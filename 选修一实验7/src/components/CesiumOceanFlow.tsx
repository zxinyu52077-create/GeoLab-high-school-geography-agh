/**
 * Cesium 动态洋流可视化组件 - 气候状态切换版
 * 支持厄尔尼诺、拉尼娜、正常年份的洋流变化
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { oceanCurrentsData, OceanCurrent } from '../data/oceanCurrents'

interface CesiumOceanFlowProps {
  climateState?: 'elnino' | 'neutral' | 'lanina'
  selectedOcean?: 'all' | 'pacific' | 'atlantic' | 'indian' | 'arctic' | 'southern'
  showOceanCurrents?: boolean
  currentSpeed?: number
  showLabels?: boolean
  showParticles?: boolean
  particleDensity?: number
}

function getLocalFlowVectors(current: OceanCurrent) {
  const origin = Cesium.Cartesian3.fromDegrees(current.lon, current.lat, 5000)
  const enuFrame = Cesium.Transforms.eastNorthUpToFixedFrame(origin)
  const eastColumn = Cesium.Matrix4.getColumn(enuFrame, 0, new Cesium.Cartesian4())
  const northColumn = Cesium.Matrix4.getColumn(enuFrame, 1, new Cesium.Cartesian4())
  const east = new Cesium.Cartesian3(eastColumn.x, eastColumn.y, eastColumn.z)
  const north = new Cesium.Cartesian3(northColumn.x, northColumn.y, northColumn.z)
  const magnitude = Math.hypot(current.uVelocity, current.vVelocity)

  if (magnitude < 1e-6) {
    return { origin, direction: east, perpendicular: north }
  }

  const eastComponent = current.uVelocity / magnitude
  const northComponent = current.vVelocity / magnitude
  const direction = Cesium.Cartesian3.add(
    Cesium.Cartesian3.multiplyByScalar(east, eastComponent, new Cesium.Cartesian3()),
    Cesium.Cartesian3.multiplyByScalar(north, northComponent, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  )
  const perpendicular = Cesium.Cartesian3.add(
    Cesium.Cartesian3.multiplyByScalar(east, -northComponent, new Cesium.Cartesian3()),
    Cesium.Cartesian3.multiplyByScalar(north, eastComponent, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  )

  return { origin, direction, perpendicular }
}

const CesiumOceanFlow: React.FC<CesiumOceanFlowProps> = ({
  climateState = 'neutral',
  selectedOcean = 'pacific',
  showOceanCurrents = true,
  currentSpeed = 1,
  showLabels = false,
  showParticles = true,
  particleDensity = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const entitiesRef = useRef<string[]>([])

  const climateMultipliers = useMemo(() => ({
    'P-SP-04': { elnino: 0.3, neutral: 1.0, lanina: 1.5 },
    'P-SP-04-1': { elnino: 0.3, neutral: 1.0, lanina: 1.5 },
    'P-OT-01': { elnino: 1.5, neutral: 1.0, lanina: 0.7 },
    'P-NP-02': { elnino: 0.9, neutral: 1.0, lanina: 1.1 },
    'P-NP-02-1': { elnino: 0.9, neutral: 1.0, lanina: 1.1 },
    'P-NP-03': { elnino: 0.9, neutral: 1.0, lanina: 1.1 },
    'P-NP-03-1': { elnino: 0.9, neutral: 1.0, lanina: 1.1 },
    'P-SP-02': { elnino: 0.8, neutral: 1.0, lanina: 1.2 },
    'I-NI-01': { elnino: 0.7, neutral: 1.0, lanina: 1.3 },
    'I-NI-01-1': { elnino: 0.7, neutral: 1.0, lanina: 1.3 },
    'I-NI-02': { elnino: 1.4, neutral: 1.0, lanina: 0.6 },
    'I-NI-02-1': { elnino: 1.4, neutral: 1.0, lanina: 0.6 },
  } as { [key: string]: { elnino: number; neutral: number; lanina: number } }), [])

  const tempOffsets = useMemo(() => ({
    'P-SP-04': { elnino: 3.0, neutral: 0, lanina: -2.0 },
    'P-SP-04-1': { elnino: 4.0, neutral: 0, lanina: -2.5 },
    'P-OT-01': { elnino: 1.5, neutral: 0, lanina: -1.0 },
    'P-NP-02': { elnino: 0.5, neutral: 0, lanina: -0.5 },
    'P-NP-02-1': { elnino: 0.5, neutral: 0, lanina: -0.5 },
  } as { [key: string]: { elnino: number; neutral: number; lanina: number } }), [])

  const getClimateMultiplier = useCallback((current: OceanCurrent) => {
    return climateMultipliers[current.id]?.[climateState] || 1.0
  }, [climateMultipliers, climateState])

  const isWarmCurrent = useCallback((current: OceanCurrent): boolean => {
    const baseTemp = current.temperature || 15
    const offset = tempOffsets[current.id]?.[climateState] || 0
    return baseTemp + offset >= 15
  }, [tempOffsets, climateState])

  

  const filterCurrents = useCallback((): OceanCurrent[] => {
    if (selectedOcean === 'all') return oceanCurrentsData

    const prefixes: { [key: string]: string[] } = {
      'pacific': ['P-NP', 'P-SP', 'P-OT'],
      'atlantic': ['A-NA', 'A-SA', 'A-OT'],
      'indian': ['I-NI', 'I-SI'],
      'arctic': ['AR'],
      'southern': ['SO'],
    }

    const keys = prefixes[selectedOcean] || []
    return oceanCurrentsData.filter(c => keys.some(k => c.id.startsWith(k)))
  }, [selectedOcean])

  const generateParticleImage = useCallback((warm: boolean): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    if (warm) {
      gradient.addColorStop(0, 'rgba(255, 165, 0, 0.9)')
      gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)')
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(79, 195, 247, 0.9)')
      gradient.addColorStop(0.5, 'rgba(33, 150, 243, 0.5)')
      gradient.addColorStop(1, 'rgba(13, 71, 161, 0)')
    }

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(16, 16, 16, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  }, [])

  const clearAllEntities = useCallback((viewer: Cesium.Viewer) => {
    entitiesRef.current.forEach(id => viewer.entities.removeById(id))
    entitiesRef.current = []
  }, [])

  const addFlowSegments = useCallback((viewer: Cesium.Viewer, filteredCurrents: OceanCurrent[]) => {
    if (!showOceanCurrents) return

    const warmColor = Cesium.Color.fromHsl(0.08, 1.0, 0.55)
    const coldColor = Cesium.Color.fromHsl(0.55, 1.0, 0.5)

    filteredCurrents.forEach(current => {
      const climateMultiplier = getClimateMultiplier(current)
      const speed = (current.speed || Math.sqrt(current.uVelocity ** 2 + current.vVelocity ** 2)) * climateMultiplier * currentSpeed
      
      const { origin, direction, perpendicular: perpDirection } = getLocalFlowVectors(current)
      const numLines = Math.max(1, Math.floor(2 * particleDensity))
      const segmentLength = speed * 120000
      const numSegments = Math.max(2, Math.floor(4 * climateMultiplier))
      const isWarm = isWarmCurrent(current)
      const baseColor = isWarm ? warmColor : coldColor

      for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
        const perpOffset = Cesium.Cartesian3.multiplyByScalar(
          perpDirection, 
          (lineIdx - (numLines - 1) / 2) * 20000, 
          new Cesium.Cartesian3()
        )

        let currentStart = origin.clone()
        Cesium.Cartesian3.add(currentStart, perpOffset, currentStart)

        for (let segIdx = 0; segIdx < numSegments; segIdx++) {
          const endPosition = Cesium.Cartesian3.add(
            currentStart,
            Cesium.Cartesian3.multiplyByScalar(direction, segmentLength, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          )

          const midOffset = Math.sin((segIdx / numSegments) * Math.PI) * 10000
          const midPerp = Cesium.Cartesian3.multiplyByScalar(perpDirection, midOffset, new Cesium.Cartesian3())
          
          const midPoint = Cesium.Cartesian3.lerp(currentStart, endPosition, 0.5, new Cesium.Cartesian3())
          Cesium.Cartesian3.add(midPoint, midPerp, midPoint)

          const positions: Cesium.Cartesian3[] = []
          for (let i = 0; i <= 4; i++) {
            const t = i / 4
            if (t <= 0.5) {
              positions.push(Cesium.Cartesian3.lerp(currentStart, midPoint, t * 2, new Cesium.Cartesian3()))
            } else {
              positions.push(Cesium.Cartesian3.lerp(midPoint, endPosition, (t - 0.5) * 2, new Cesium.Cartesian3()))
            }
          }

          const alpha = 0.5 + ((lineIdx + segIdx) % 2) * 0.2
          const colorWithAlpha = new Cesium.Color(baseColor.red, baseColor.green, baseColor.blue, alpha)

          const segmentId = `${current.id}-segment-${lineIdx}-${segIdx}`
          viewer.entities.add({
            id: segmentId,
            polyline: {
              positions: positions,
              width: 2.5,
              material: new Cesium.PolylineGlowMaterialProperty({
                color: colorWithAlpha,
                glowPower: 0.25,
              }),
            },
          })
          entitiesRef.current.push(segmentId)

          const arrowAngle = Math.atan2(direction.y, direction.x)
          const arrowLength = 20000
          const arrowBase = endPosition.clone()
          const arrowLeft = new Cesium.Cartesian3(
            arrowBase.x - arrowLength * Math.cos(arrowAngle - Math.PI / 6),
            arrowBase.y - arrowLength * Math.sin(arrowAngle - Math.PI / 6),
            arrowBase.z
          )
          const arrowRight = new Cesium.Cartesian3(
            arrowBase.x - arrowLength * Math.cos(arrowAngle + Math.PI / 6),
            arrowBase.y - arrowLength * Math.sin(arrowAngle + Math.PI / 6),
            arrowBase.z
          )

          const arrowLeftId = `${current.id}-arrow-${lineIdx}-${segIdx}-left`
          viewer.entities.add({
            id: arrowLeftId,
            polyline: {
              positions: [endPosition, arrowLeft],
              width: 2.5,
              material: new Cesium.PolylineGlowMaterialProperty({
                color: colorWithAlpha,
                glowPower: 0.35,
              }),
            },
          })
          entitiesRef.current.push(arrowLeftId)

          const arrowRightId = `${current.id}-arrow-${lineIdx}-${segIdx}-right`
          viewer.entities.add({
            id: arrowRightId,
            polyline: {
              positions: [endPosition, arrowRight],
              width: 2.5,
              material: new Cesium.PolylineGlowMaterialProperty({
                color: colorWithAlpha,
                glowPower: 0.35,
              }),
            },
          })
          entitiesRef.current.push(arrowRightId)

          currentStart = Cesium.Cartesian3.add(
            endPosition,
            Cesium.Cartesian3.multiplyByScalar(direction, 40000 * climateMultiplier, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          )
        }
      }
    })
  }, [showOceanCurrents, currentSpeed, particleDensity, getClimateMultiplier, isWarmCurrent])

  const addLabels = useCallback((viewer: Cesium.Viewer, filteredCurrents: OceanCurrent[]) => {
    if (!showLabels) {
      entitiesRef.current = entitiesRef.current.filter(id => {
        if (id.endsWith('-label')) {
          viewer.entities.removeById(id)
          return false
        }
        return true
      })
      return
    }

    filteredCurrents.forEach(current => {
      const isWarm = isWarmCurrent(current)
      const labelId = `${current.id}-label`
      
      if (viewer.entities.getById(labelId)) {
        viewer.entities.removeById(labelId)
      }

      viewer.entities.add({
        id: labelId,
        position: Cesium.Cartesian3.fromDegrees(current.lon, current.lat, 10000),
        label: {
          text: current.name,
          font: 'bold 14px "Microsoft YaHei", "SimHei", sans-serif',
          fillColor: isWarm ? Cesium.Color.ORANGE : Cesium.Color.CYAN,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          eyeOffset: new Cesium.Cartesian3(0, 0, 1200),
          scale: 1.1,
        },
      })
      entitiesRef.current.push(labelId)
    })
  }, [showLabels, isWarmCurrent])

  const addDynamicParticles = useCallback((viewer: Cesium.Viewer, filteredCurrents: OceanCurrent[]) => {
    entitiesRef.current = entitiesRef.current.filter(id => {
      if (id.includes('-particle-')) {
        viewer.entities.removeById(id)
        return false
      }
      return true
    })

    if (!showParticles) return

    const warmColor = Cesium.Color.fromHsl(0.08, 1.0, 0.55)
    const coldColor = Cesium.Color.fromHsl(0.55, 1.0, 0.5)
    const warmParticleImage = generateParticleImage(true)
    const coldParticleImage = generateParticleImage(false)

    filteredCurrents.forEach(current => {
      const climateMultiplier = getClimateMultiplier(current)
      const isWarm = isWarmCurrent(current)
      const speed = (current.speed || Math.sqrt(current.uVelocity ** 2 + current.vVelocity ** 2)) * climateMultiplier * currentSpeed
      const { origin: startPosition, direction, perpendicular: perpDirection } = getLocalFlowVectors(current)
      const numParticles = Math.max(1, Math.floor(3 * climateMultiplier * particleDensity))
      const particleImage = isWarm ? warmParticleImage : coldParticleImage
      const baseColor = isWarm ? warmColor : coldColor

      for (let i = 0; i < numParticles; i++) {
        const particleId = `${current.id}-particle-${i}`

        const startTime = Cesium.JulianDate.now()
        const delay = (i * 4) % 20

        const baseOffset = Cesium.Cartesian3.multiplyByScalar(
          perpDirection, 
          (i - (numParticles - 1) / 2) * 15000, 
          new Cesium.Cartesian3()
        )
        const startPos = startPosition.clone()
        Cesium.Cartesian3.add(startPos, baseOffset, startPos)

        viewer.entities.add({
          id: particleId,
          position: new Cesium.SampledPositionProperty(),
          billboard: {
            image: particleImage,
            scale: 0.35 * particleDensity,
            color: new Cesium.SampledProperty(Cesium.Color),
          },
        })

        const effectEntity = viewer.entities.getById(particleId)
        if (effectEntity && effectEntity.position instanceof Cesium.SampledPositionProperty) {
          const sampledPos = effectEntity.position as Cesium.SampledPositionProperty
          const delayedStart = Cesium.JulianDate.addSeconds(startTime, delay, new Cesium.JulianDate())
          sampledPos.addSample(delayedStart, startPos.clone())

          const totalDistance = speed * 100000
          const endPos = Cesium.Cartesian3.add(
            startPos.clone(),
            Cesium.Cartesian3.multiplyByScalar(direction, totalDistance, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          )
          const duration = Math.max(8, 12 / Math.max(speed, 0.05))
          const endTime = Cesium.JulianDate.addSeconds(delayedStart, duration, new Cesium.JulianDate())
          sampledPos.addSample(endTime, endPos)

          sampledPos.setInterpolationOptions({
            interpolationDegree: 1,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
          })

          if (effectEntity.billboard && effectEntity.billboard.color instanceof Cesium.SampledProperty) {
            const sampledColor = effectEntity.billboard.color as Cesium.SampledProperty
            sampledColor.addSample(delayedStart, new Cesium.Color(baseColor.red, baseColor.green, baseColor.blue, 0.1))
            
            const midTime = Cesium.JulianDate.addSeconds(delayedStart, duration * 0.3, new Cesium.JulianDate())
            sampledColor.addSample(midTime, new Cesium.Color(baseColor.red, baseColor.green, baseColor.blue, 0.7))
            
            sampledColor.addSample(endTime, new Cesium.Color(baseColor.red, baseColor.green, baseColor.blue, 0.1))
          }
        }
        entitiesRef.current.push(particleId)
      }
    })
  }, [showParticles, currentSpeed, particleDensity, getClimateMultiplier, isWarmCurrent, generateParticleImage])

  const updateVisualization = useCallback((viewer: Cesium.Viewer) => {
    clearAllEntities(viewer)
    const filteredCurrents = filterCurrents()
    addFlowSegments(viewer, filteredCurrents)
    addLabels(viewer, filteredCurrents)
    addDynamicParticles(viewer, filteredCurrents)
  }, [clearAllEntities, filterCurrents, addFlowSegments, addLabels, addDynamicParticles])

  useEffect(() => {
    if (!containerRef.current) return

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayerPicker: false,
      baseLayer: false,
      animation: false,
      timeline: false,
      fullscreenButton: true,
      geocoder: false,
      infoBox: true,
      sceneModePicker: true,
      selectionIndicator: true,
      navigationHelpButton: false,
      shouldAnimate: true,
    })

    viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
      url: '/picture/experiments/required/world-map.jpg',
    }))

    viewerRef.current = viewer

    if (viewer.scene.skyBox) viewer.scene.skyBox.show = false
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0b1728')

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(160, 0, 25000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-88),
        roll: 0,
      },
      duration: 3,
    })

    viewer.scene.globe.enableLighting = false

    return () => {
      viewer.entities.removeAll()
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    updateVisualization(viewer)
  }, [updateVisualization])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: '"Microsoft YaHei", sans-serif',
        fontSize: '12px',
        zIndex: 100,
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>洋流图例</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ width: '20px', height: '3px', background: '#ff6b35', borderRadius: '2px' }} />
          <span>暖流 15 度以上</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '3px', background: '#3182ce', borderRadius: '2px' }} />
          <span>寒流 15 度以下</span>
        </div>
      </div>
    </div>
  )
}

export default CesiumOceanFlow

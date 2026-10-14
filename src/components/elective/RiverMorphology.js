export function riverCenter(z, stage = '中游搬运') {
  const amplitude = stage === '上游侵蚀' ? .45 : stage === '下游沉积' ? 1.4 : 2.2
  return Math.sin(z * .49) * amplitude + Math.sin(z * .96 + .7) * .3
}

export function riverLevel(z, base) {
  return -.72 + (z + 12.5) / 25 * (1.2 + (100 - base) / 100 * .5) - .20
}

export function terrainHeightAt(x, z, slope, base, vegetation, stage = '中游搬运') {
  const upstream = (z + 12.5) / 25
  const distance = Math.abs(x - riverCenter(z, stage))
  const width = 2.2 + (1 - upstream) * 1.7
  const relief = (0.62 + 0.62 * 1.45) + (slope - 62) / 100 * 1.45
  const wall = relief * Math.min(1, (Math.max(0, distance - .76) / width) ** .82)
  const incision = .42 * Math.exp(-(Math.max(0, distance - .76) ** 2) / (2 * .52 ** 2))
  const roughness = 0.35 + (100 - vegetation) / 100 * 0.65
  const ridge = (0.13 * Math.sin(x * 0.83 + z * 0.28) * Math.sin(z * 0.61)
    + 0.065 * Math.sin(x * 1.9 - z * 1.17)
    + 0.034 * Math.sin(x * 4.1 + z * 3.3)
    + 0.018 * Math.sin(x * 8.4 - z * 7.1)) * roughness * Math.min(1, Math.max(0, (distance - .76) / 1.5))
  const gullies = 0.055 * Math.sin(z * 1.4 + x * 0.7) * Math.min(1, distance / 3.5) * roughness
  const baseElevation = -0.72 + upstream * (1.2 + (100 - base) / 100 * 0.5)
  return baseElevation + wall + ridge + gullies - incision
}


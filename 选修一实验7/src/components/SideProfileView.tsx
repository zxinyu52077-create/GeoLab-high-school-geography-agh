import { useEffect, useRef, useState } from 'react';
import { ClimateState } from '../types';

interface SideProfileViewProps {
  climateState: ClimateState;
  animationProgress: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

const STATE_CONFIG = {
  neutral: {
    name: '正常年份',
    seaLevelWest: 1.15,
    seaLevelEast: 1.0,
    warmPoolWidth: 0.33,
    warmPoolThickness: 0.45,
    upwellingSpeed: 50,
    upwellingColor: '#2980B9',
    surfaceCurrentSpeed: 90,
    tradeWindSpeed: 80,
    tradeWindDensity: 1.5,
    circulationShift: 0,
    circulationScale: 1.0,
    hSize: 1.0,
    hOffset: 0,
    lOffset: 0,
    color: '#2ECC71',
    bgColor: 'rgba(46, 204, 113, 0.1)',
  },
  elnino: {
    name: '厄尔尼诺',
    seaLevelWest: 1.02,
    seaLevelEast: 1.0,
    warmPoolWidth: 0.67,
    warmPoolThickness: 0.4,
    upwellingSpeed: 8,
    upwellingColor: '#1A5276',
    surfaceCurrentSpeed: 35,
    tradeWindSpeed: 35,
    tradeWindDensity: 0.4,
    circulationShift: 0.35,
    circulationScale: 0.85,
    hSize: 0.8,
    hOffset: -20,
    lOffset: 30,
    color: '#E74C3C',
    bgColor: 'rgba(231, 76, 60, 0.1)',
  },
  lanina: {
    name: '拉尼娜',
    seaLevelWest: 1.27,
    seaLevelEast: 1.0,
    warmPoolWidth: 0.25,
    warmPoolThickness: 0.6,
    upwellingSpeed: 100,
    upwellingColor: '#3498DB',
    surfaceCurrentSpeed: 95,
    tradeWindSpeed: 135,
    tradeWindDensity: 2.5,
    circulationShift: -0.25,
    circulationScale: 1.15,
    hSize: 1.2,
    hOffset: 0,
    lOffset: 0,
    color: '#3498DB',
    bgColor: 'rgba(52, 152, 219, 0.1)',
  },
};

const FEATURES = {
  neutral: ['信风稳定', '沃克环流正常', '暖池位于西太平洋', '冷水上涌正常'],
  elnino: ['信风减弱', '暖水向东扩展', '沃克环流东移', '冷水上涌减弱'],
  lanina: ['信风增强', '暖水西聚', '沃克环流西移增强', '冷水上涌增强'],
};

export default function SideProfileView({ climateState }: SideProfileViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const [isHovered, setIsHovered] = useState(false);
  
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimensions.width;
      const height = dimensions.height;
      const config = STATE_CONFIG[climateState];

    // 初始化粒子
    const initParticles = () => {
      particlesRef.current = [];
      
      // 信风粒子
      for (let i = 0; i < Math.floor(config.tradeWindDensity * 10); i++) {
        particlesRef.current.push({
          x: width * (0.7 + Math.random() * 0.3),
          y: height * (0.2 + Math.random() * 0.15),
          vx: -config.tradeWindSpeed * 0.0008,
          vy: (Math.random() - 0.5) * 0.015,
          color: 'rgba(255, 255, 255, 0.7)',
          size: 2 + Math.random() * 2,
        });
      }

      // 表层洋流粒子
      for (let i = 0; i < 15; i++) {
        const isElNino = climateState === 'elnino';
        const hasReversePulse = isElNino && Math.random() > 0.7;
        particlesRef.current.push({
          x: width * (0.1 + Math.random() * 0.8),
          y: height * (0.5 + Math.random() * 0.04),
          vx: hasReversePulse ? config.surfaceCurrentSpeed * 0.0015 : -config.surfaceCurrentSpeed * 0.0008,
          vy: (Math.random() - 0.5) * 0.005,
          color: hasReversePulse ? '#F1C40F' : 'rgba(255, 180, 100, 0.6)',
          size: 3 + Math.random() * 2,
        });
      }

      // 高空环流粒子
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: width * (0.1 + Math.random() * 0.2),
          y: height * (0.1 + Math.random() * 0.06),
          vx: config.tradeWindSpeed * 0.0004,
          vy: (Math.random() - 0.5) * 0.008,
          color: 'rgba(150, 200, 255, 0.5)',
          size: 2 + Math.random() * 1.5,
        });
      }
    };

    initParticles();

    const drawPanel = () => {
      const currentTime = timeRef.current;

      // 面板背景
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // 方向指示器
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText('西 ← → 东', width / 2, height - 12);

      // 海洋区域
      const oceanTop = height * 0.45;
      const oceanHeight = height * 0.5;
      const oceanGradient = ctx.createLinearGradient(0, oceanTop, 0, oceanTop + oceanHeight);
      oceanGradient.addColorStop(0, '#0A3D62');
      oceanGradient.addColorStop(1, '#06283D');
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, oceanTop, width, oceanHeight);

      // 大气区域
      const atmosphereHeight = height * 0.45;
      const atmGradient = ctx.createLinearGradient(0, 0, 0, atmosphereHeight);
      atmGradient.addColorStop(0, 'rgba(52, 152, 219, 0.2)');
      atmGradient.addColorStop(1, 'rgba(52, 152, 219, 0.4)');
      ctx.fillStyle = atmGradient;
      ctx.fillRect(0, 0, width, atmosphereHeight);

      // 海面曲线（动态波动）
      ctx.beginPath();
      ctx.moveTo(0, oceanTop);
      for (let x = 0; x <= width; x += 2) {
        const baseHeight = oceanTop - ((width - x) / width) * (config.seaLevelWest - config.seaLevelEast) * 30;
        const wave = Math.sin((x + currentTime * 0.05) * 0.06) * 2.5 + Math.sin((x + currentTime * 0.08) * 0.09) * 1.5;
        ctx.lineTo(x, baseHeight + wave);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = '#0A3D62';
      ctx.fill();

      // 海面高光
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const baseHeight = oceanTop - ((width - x) / width) * (config.seaLevelWest - config.seaLevelEast) * 30;
        const wave = Math.sin((x + currentTime * 0.05) * 0.06) * 2.5 + Math.sin((x + currentTime * 0.08) * 0.09) * 1.5;
        ctx.lineTo(x, baseHeight + wave);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 暖池
      const warmPoolStart = width * 0.05;
      const warmPoolW = width * config.warmPoolWidth;
      const warmPoolH = oceanHeight * config.warmPoolThickness;
      const warmPoolY = oceanTop + 5;
      
      const warmGradient = ctx.createLinearGradient(warmPoolStart, warmPoolY, warmPoolStart + warmPoolW, warmPoolY + warmPoolH);
      warmGradient.addColorStop(0, 'rgba(231, 76, 60, 0.5)');
      warmGradient.addColorStop(1, climateState === 'elnino' ? 'rgba(231, 76, 60, 0.6)' : 'rgba(230, 126, 34, 0.4)');
      
      ctx.beginPath();
      ctx.roundRect(warmPoolStart, warmPoolY, warmPoolW, warmPoolH, 6);
      ctx.fillStyle = warmGradient;
      ctx.fill();

      // 冷水上翻箭头
      const upwellingCount = climateState === 'lanina' ? 6 : (climateState === 'elnino' ? 1 : 4);
      const upwellingStartX = width * 0.7;
      const upwellingSpacing = (width * 0.25) / upwellingCount;
      
      for (let i = 0; i < upwellingCount; i++) {
        const x = upwellingStartX + i * upwellingSpacing;
        const arrowLength = 12 + Math.sin(currentTime * 0.02 + i) * 4;
        const y = oceanTop + oceanHeight - 8;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - arrowLength);
        ctx.strokeStyle = config.upwellingColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 箭头头部
        ctx.beginPath();
        ctx.moveTo(x, y - arrowLength);
        ctx.lineTo(x - 3.5, y - arrowLength + 7);
        ctx.lineTo(x + 3.5, y - arrowLength + 7);
        ctx.closePath();
        ctx.fillStyle = config.upwellingColor;
        ctx.fill();
      }

      // 沃克环流圈
      const circulationHeight = height * 0.32 * config.circulationScale;

      // 上升气流（西侧）
      const upX = width * (0.25 + config.circulationShift * 0.4);
      ctx.beginPath();
      ctx.moveTo(upX, oceanTop - 8);
      ctx.lineTo(upX, oceanTop - circulationHeight - 12);
      ctx.strokeStyle = climateState === 'lanina' ? 'rgba(46, 204, 113, 0.7)' : 'rgba(52, 152, 219, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 上升箭头头部
      ctx.beginPath();
      ctx.moveTo(upX, oceanTop - circulationHeight - 16);
      ctx.lineTo(upX - 4, oceanTop - circulationHeight - 6);
      ctx.lineTo(upX + 4, oceanTop - circulationHeight - 6);
      ctx.closePath();
      ctx.fillStyle = climateState === 'lanina' ? 'rgba(46, 204, 113, 0.7)' : 'rgba(52, 152, 219, 0.7)';
      ctx.fill();

      // 高空西风（左到右）
      const highAltY = oceanTop - circulationHeight - 18;
      ctx.beginPath();
      ctx.moveTo(upX, highAltY);
      ctx.lineTo(width * (0.75 + config.circulationShift * 0.25), highAltY);
      ctx.strokeStyle = climateState === 'elnino' ? 'rgba(231, 76, 60, 0.6)' : 'rgba(100, 150, 200, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 高空箭头
      const highWindX = width * (0.7 + config.circulationShift * 0.25);
      ctx.beginPath();
      ctx.moveTo(highWindX + 8, highAltY);
      ctx.lineTo(highWindX, highAltY - 3.5);
      ctx.lineTo(highWindX, highAltY + 3.5);
      ctx.closePath();
      ctx.fillStyle = climateState === 'elnino' ? 'rgba(231, 76, 60, 0.6)' : 'rgba(100, 150, 200, 0.6)';
      ctx.fill();

      // 下沉气流（东侧）
      const downX = width * (0.75 + config.circulationShift * 0.25);
      ctx.beginPath();
      ctx.moveTo(downX, highAltY);
      ctx.lineTo(downX, oceanTop - 5);
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 下沉箭头头部
      ctx.beginPath();
      ctx.moveTo(downX, oceanTop);
      ctx.lineTo(downX - 4, oceanTop - 7);
      ctx.lineTo(downX + 4, oceanTop - 7);
      ctx.closePath();
      ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
      ctx.fill();

      // 低空东风（右到左）
      ctx.beginPath();
      ctx.moveTo(downX, oceanTop - 5);
      ctx.lineTo(upX, oceanTop - 5);
      ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 云层
      const cloudCount = climateState === 'lanina' ? 5 : (climateState === 'elnino' ? 2 : 3);
      for (let i = 0; i < cloudCount; i++) {
        const cloudX = upX + (Math.random() - 0.5) * 60;
        const cloudY = highAltY + (Math.random() - 0.5) * 30;
        const cloudSize = 12 + Math.random() * 6;
        
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudSize / 2, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize / 3, cloudY - 4, cloudSize / 3, 0, Math.PI * 2);
        ctx.arc(cloudX - cloudSize / 3, cloudY - 3, cloudSize / 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.random() * 0.3})`;
        ctx.fill();
      }

      // 雨滴（仅在上升区域）
      if (climateState !== 'elnino') {
        const rainCount = climateState === 'lanina' ? 18 : 10;
        for (let i = 0; i < rainCount; i++) {
          const rainX = upX + (Math.random() - 0.5) * 50;
          const rainY = (currentTime * 0.04 + i * 25) % (height * 0.4);
          ctx.beginPath();
          ctx.moveTo(rainX, rainY);
          ctx.lineTo(rainX + 0.8, rainY + 7);
          ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // 气压系统标注
      ctx.font = 'bold 12px sans-serif';
      
      // 低压 L (西侧)
      const lX = width * (0.12 + config.lOffset * 0.0008);
      ctx.fillStyle = '#E74C3C';
      ctx.fillText('低压 (L)', lX, oceanTop + oceanHeight * 0.25);

      // 高压 H (东侧)
      const hX = width * (0.8 + config.hOffset * 0.0008);
      ctx.font = `bold ${12 * config.hSize}px sans-serif`;
      ctx.fillStyle = config.hSize > 1 ? '#2ECC71' : '#27AE60';
      ctx.fillText('高压 (H)', hX, oceanTop + oceanHeight * 0.25);
      ctx.font = 'bold 12px sans-serif';

      // 区域标注（放在最后确保显示在最顶层）
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#60A5FA';
      ctx.textAlign = 'left';
      ctx.fillText('西太平洋', width * 0.05, height * 0.5);
      ctx.textAlign = 'right';
      ctx.fillText('东太平洋', width * 0.95, height * 0.5);
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawPanel();

      // 更新和绘制粒子
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx * 16;
        particle.y += particle.vy * 16;

        // 边界检测
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height * 0.45;
        if (particle.y > height * 0.5) particle.y = height * 0.42;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      timeRef.current += 16;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, climateState]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full cursor-default"
      />
      
      {isHovered && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="font-bold text-gray-800 mb-2 text-xs">
            {STATE_CONFIG[climateState].name}
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {FEATURES[climateState].map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
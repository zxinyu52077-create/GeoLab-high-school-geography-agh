import { useState } from 'react';
import { Sun, Snowflake, Thermometer, Wind, Info, ChevronRight, Eye, EyeOff, Maximize2, Minimize2, Droplets, SlidersHorizontal, CloudRain } from 'lucide-react';
import { ClimateState } from '../types';
import SideProfileView from './SideProfileView';
import CesiumOceanFlow from './CesiumOceanFlow';

export default function VisualizationPage() {
  const [climateState, setClimateState] = useState<ClimateState>('neutral');
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [circulationMode, setCirculationMode] = useState<'simple' | 'detailed'>('detailed');
  const [windStrength, setWindStrength] = useState(1);
  const [tempAnomaly, setTempAnomaly] = useState(1);
  
  // 洋流控制参数
  const [showOceanCurrents, setShowOceanCurrents] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [particleDensity, setParticleDensity] = useState(1);
  const [solarInput, setSolarInput] = useState(60);
  const [moistureTransport, setMoistureTransport] = useState(50);
  const [surfaceType, setSurfaceType] = useState<'ocean' | 'forest' | 'dryland'>('ocean');

  // 教学用相对强度指数，展示能量、水汽输送与下垫面的因果关系，不代表水量观测值。
  const evaporationIndex = Math.min(100, Math.round(15 + solarInput * 0.55 + (surfaceType === 'ocean' ? 25 : surfaceType === 'forest' ? 15 : 5)));
  const cloudIndex = Math.min(100, Math.round(evaporationIndex * 0.55 + moistureTransport * 0.45));
  const precipitationIndex = Math.round(cloudIndex * (surfaceType === 'dryland' ? 0.65 : 0.8));
  const runoffIndex = Math.round(precipitationIndex * (surfaceType === 'dryland' ? 0.82 : surfaceType === 'forest' ? 0.25 : 0.5));

  const handleClimateChange = (state: ClimateState) => {
    setClimateState(state);
  };

  const stateInfo = {
    elnino: {
      title: '厄尔尼诺现象',
      subtitle: 'El Niño',
      description: '厄尔尼诺是赤道东太平洋海水温度异常升高的现象，通常伴随信风减弱、沃克环流异常和全球气候模式改变。',
      color: 'red' as const,
      tempStatus: '+1.5~+3°C',
      windStatus: '信风减弱/反向',
      circulationStatus: '沃克环流东移',
      warmPoolStatus: '暖池东扩',
      upwellingStatus: '减弱/消失',
      phase: 'ENSO暖相位'
    },
    neutral: {
      title: '中性状态',
      subtitle: 'Neutral',
      description: '中性状态是太平洋海温处于正常范围的时期，信风稳定，沃克环流正常运作。',
      color: 'green' as const,
      tempStatus: '正常',
      windStatus: '信风稳定',
      circulationStatus: '沃克环流正常',
      warmPoolStatus: '正常位置',
      upwellingStatus: '正常',
      phase: 'ENSO中性'
    },
    lanina: {
      title: '拉尼娜现象',
      subtitle: 'La Niña',
      description: '拉尼娜是赤道东太平洋海水温度异常降低的现象，通常伴随信风增强、沃克环流加强和全球气候模式改变。',
      color: 'blue' as const,
      tempStatus: '-1.5~-3°C',
      windStatus: '信风增强',
      circulationStatus: '沃克环流西移增强',
      warmPoolStatus: '暖池西缩',
      upwellingStatus: '增强',
      phase: 'ENSO冷相位'
    }
  }[climateState];

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">洋流、海气作用与水循环</h1>
          <p className="text-gray-400 text-sm sm:text-base">对比 ENSO 海温异常怎样改变洋流、环流与区域水汽路径，并继续追踪水循环过程</p>
          <button onClick={() => document.getElementById('water-cycle-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20">
            <CloudRain className="h-4 w-4" />直接进入水循环联动实验
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleClimateChange('elnino')}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        climateState === 'elnino'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span className="font-medium">厄尔尼诺</span>
                    </button>
                    <button
                      onClick={() => handleClimateChange('neutral')}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        climateState === 'neutral'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <Thermometer className="w-5 h-5" />
                      <span className="font-medium">中性状态</span>
                    </button>
                    <button
                      onClick={() => handleClimateChange('lanina')}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        climateState === 'lanina'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                          : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <Snowflake className="w-5 h-5" />
                      <span className="font-medium">拉尼娜</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowOceanCurrents(!showOceanCurrents)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        showOceanCurrents
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600'
                      }`}
                      title={showOceanCurrents ? '隐藏洋流' : '显示洋流'}
                    >
                      <Droplets className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setShowLabels(!showLabels)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        showLabels
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600'
                      }`}
                      title={showLabels ? '隐藏标签' : '显示标签'}
                    >
                      {showLabels ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => setIsZoomed(!isZoomed)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isZoomed
                          ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600'
                      }`}
                      title={isZoomed ? '缩小视图' : '放大视图'}
                    >
                      {isZoomed ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        showInfo
                          ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600'
                      }`}
                      title="显示信息"
                    >
                      <Info className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className={`enso-map-frame relative bg-slate-900/50 rounded-xl overflow-hidden ${isZoomed ? 'enso-map-frame-zoomed' : ''}`}>
                  <CesiumOceanFlow 
                    climateState={climateState}
                    showOceanCurrents={showOceanCurrents}
                    currentSpeed={currentSpeed}
                    showLabels={showLabels}
                    showParticles={showParticles}
                    particleDensity={particleDensity}
                  />

                  {showInfo && (
                    <div className="absolute top-4 left-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-5 border border-slate-700">
                      <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        <span>可视化说明</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-300 mb-2">
                            此地图展示了太平洋区域的海水温度异常分布和大气环流模式。
                          </p>
                          <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <span>暖水异常区域</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span>冷水异常区域</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <span>沃克环流路径</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-300 mb-2">操作提示：</p>
                          <ul className="space-y-1 text-xs text-gray-400">
                            <li>• 切换不同气候状态观察洋流变化</li>
                            <li>• 使用右侧控制面板调节参数</li>
                            <li>• 点击放大按钮查看细节</li>
                            <li>• 使用鼠标拖拽旋转地球</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">关键参数控制</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCirculationMode('simple')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        circulationMode === 'simple' ? 'bg-blue-500 text-white' : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600'
                      }`}
                    >
                      简化模式
                    </button>
                    <button
                      onClick={() => setCirculationMode('detailed')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        circulationMode === 'detailed' ? 'bg-blue-500 text-white' : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600'
                      }`}
                    >
                      详细模式
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Wind className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300 text-sm font-medium">信风强度</span>
                      </div>
                      <span className="text-white font-semibold">{(windStrength * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2"
                      step="0.1"
                      value={windStrength}
                      onChange={(e) => setWindStrength(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>减弱</span>
                      <span>增强</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-300 text-sm font-medium">温度异常幅度</span>
                      </div>
                      <span className="text-white font-semibold">{(tempAnomaly * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={tempAnomaly}
                      onChange={(e) => setTempAnomaly(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>减弱</span>
                      <span>增强</span>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 text-sm font-medium">洋流速度</span>
                      </div>
                      <span className="text-white font-semibold">{(currentSpeed * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={currentSpeed}
                      onChange={(e) => setCurrentSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>慢速</span>
                      <span>快速</span>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300 text-sm font-medium">粒子密度</span>
                      </div>
                      <span className="text-white font-semibold">{(particleDensity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={particleDensity}
                      onChange={(e) => setParticleDensity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>稀疏</span>
                      <span>密集</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300 text-sm font-medium">显示控制</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowParticles(!showParticles)}
                      className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        showParticles
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-600/50 text-gray-400 hover:bg-slate-600 border border-transparent'
                      }`}
                    >
                      <Droplets className="w-4 h-4" />
                      <span>粒子效果</span>
                    </button>
                    <button
                      onClick={() => setShowLabels(!showLabels)}
                      className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        showLabels
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-600/50 text-gray-400 hover:bg-slate-600 border border-transparent'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>标签显示</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-green-500/30 p-5 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">正常年份</h3>
                    <p className="text-xs text-gray-500">Neutral</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  ENSO中性
                </div>
              </div>
              <div className="relative bg-slate-900/70 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <SideProfileView climateState="neutral" animationProgress={1} />
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-xs font-medium mb-1">信风</div>
                    <div className="text-gray-300 text-xs">稳定</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-xs font-medium mb-1">环流</div>
                    <div className="text-gray-300 text-xs">正常</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-green-400 text-xs font-medium mb-1">上涌</div>
                    <div className="text-gray-300 text-xs">活跃</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-red-500/30 p-5 shadow-lg shadow-red-500/5 hover:shadow-red-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">厄尔尼诺</h3>
                    <p className="text-xs text-gray-500">El Niño</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  ENSO暖相
                </div>
              </div>
              <div className="relative bg-slate-900/70 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <SideProfileView climateState="elnino" animationProgress={1} />
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-xs font-medium mb-1">信风</div>
                    <div className="text-gray-300 text-xs">减弱</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-xs font-medium mb-1">暖池</div>
                    <div className="text-gray-300 text-xs">东扩</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-red-400 text-xs font-medium mb-1">上涌</div>
                    <div className="text-gray-300 text-xs">减弱</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-blue-500/30 p-5 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Snowflake className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">拉尼娜</h3>
                    <p className="text-xs text-gray-500">La Niña</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                  ENSO冷相
                </div>
              </div>
              <div className="relative bg-slate-900/70 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <SideProfileView climateState="lanina" animationProgress={1} />
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-blue-400 text-xs font-medium mb-1">信风</div>
                    <div className="text-gray-300 text-xs">增强</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-blue-400 text-xs font-medium mb-1">暖池</div>
                    <div className="text-gray-300 text-xs">西聚</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                    <div className="text-blue-400 text-xs font-medium mb-1">上涌</div>
                    <div className="text-gray-300 text-xs">增强</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 ${
              stateInfo.color === 'red' ? 'border-red-500/30 shadow-lg shadow-red-500/5' :
              stateInfo.color === 'blue' ? 'border-blue-500/30 shadow-lg shadow-blue-500/5' : 
              'border-green-500/30 shadow-lg shadow-green-500/5'
            }`}>
              <div className="flex items-center space-x-4 mb-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  stateInfo.color === 'red' ? 'bg-red-500/20' :
                  stateInfo.color === 'blue' ? 'bg-blue-500/20' : 'bg-green-500/20'
                }`}>
                  {stateInfo.color === 'red' ? <Sun className="w-7 h-7 text-red-400" /> :
                   stateInfo.color === 'blue' ? <Snowflake className="w-7 h-7 text-blue-400" /> :
                   <Thermometer className="w-7 h-7 text-green-400" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{stateInfo.title}</h3>
                  <p className="text-gray-400 text-sm italic">{stateInfo.subtitle}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-5 leading-relaxed">{stateInfo.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-gray-400 text-xs">温度异常</span>
                  </div>
                  <span className={`font-semibold text-sm ${
                    stateInfo.color === 'red' ? 'text-red-400' :
                    stateInfo.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                  }`}>{stateInfo.tempStatus}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Wind className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-gray-400 text-xs">信风状态</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{stateInfo.windStatus}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <CloudRain className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-400 text-xs">环流状态</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{stateInfo.circulationStatus}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Sun className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-gray-400 text-xs">暖池状态</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{stateInfo.warmPoolStatus}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-700">
                <div className="flex items-center justify-center mb-4">
                  <span className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    stateInfo.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    stateInfo.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {stateInfo.phase}
                  </span>
                </div>
                
                {/* 补充信息 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">ONI指数</span>
                    <span className={`font-medium ${
                      stateInfo.color === 'red' ? 'text-red-400' :
                      stateInfo.color === 'blue' ? 'text-blue-400' : 'text-gray-300'
                    }`}>
                      {stateInfo.color === 'red' ? '+0.5°C ~ +2.0°C' :
                       stateInfo.color === 'blue' ? '-0.5°C ~ -2.0°C' : '±0.5°C 以内'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">典型周期</span>
                    <span className="text-gray-300">2~7年</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">持续时间</span>
                    <span className="text-gray-300">9~12个月</span>
                  </div>
                </div>
                
                {/* 影响区域标签 */}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">主要影响区域</div>
                  <div className="flex flex-wrap gap-2">
                    {['东南亚', '澳大利亚', '南美西岸', '北美西部', '非洲东部'].map((region) => (
                      <span 
                        key={region}
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          stateInfo.color === 'red' ? 'bg-red-500/15 text-red-300' :
                          stateInfo.color === 'blue' ? 'bg-blue-500/15 text-blue-300' : 
                          'bg-slate-600/50 text-gray-300'
                        }`}
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">形成过程</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {climateState === 'elnino' ? (
                  <>
                    <div className="flex items-start space-x-3 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">东南信风异常减弱</p>
                        <p className="text-gray-400 text-xs mt-1">信风减弱导致表层暖水无法继续向西输送，甚至出现西风异常</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">暖池向东扩展</p>
                        <p className="text-gray-400 text-xs mt-1">西太平洋暖池的温水向东流动，导致东太平洋水温升高</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">沃克环流异常</p>
                        <p className="text-gray-400 text-xs mt-1">上升气流区东移，下沉气流区减弱，大气环流模式改变</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-bold">4</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">冷水上涌减弱</p>
                        <p className="text-gray-400 text-xs mt-1">东太平洋沿岸冷水上涌减弱或消失，进一步加剧水温升高</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-bold">5</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">全球气候异常</p>
                        <p className="text-gray-400 text-xs mt-1">引发全球范围的气候异常，包括暴雨、干旱和气温异常</p>
                      </div>
                    </div>
                  </>
                ) : climateState === 'lanina' ? (
                  <>
                    <div className="flex items-start space-x-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">东南信风异常增强</p>
                        <p className="text-gray-400 text-xs mt-1">信风增强将更多暖水输送至西太平洋，导致东太平洋冷水上涌增强</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">西太平洋暖池加强</p>
                        <p className="text-gray-400 text-xs mt-1">暖池在西太平洋聚集并增强，形成更强的对流活动</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">沃克环流增强西移</p>
                        <p className="text-gray-400 text-xs mt-1">上升气流区西移并增强，下沉气流区也随之增强</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 font-bold">4</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">东太平洋冷水上涌增强</p>
                        <p className="text-gray-400 text-xs mt-1">更强的信风导致更多冷水从深海涌升，东太平洋水温降低</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 font-bold">5</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">全球气候响应</p>
                        <p className="text-gray-400 text-xs mt-1">引发与厄尔尼诺相反的全球气候异常模式</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">稳定的东南信风</p>
                        <p className="text-gray-400 text-xs mt-1">信风将表层海水从东太平洋吹向西太平洋</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">西太平洋暖池形成</p>
                        <p className="text-gray-400 text-xs mt-1">暖水在西太平洋聚集，形成温暖的表层水</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">正常的沃克环流</p>
                        <p className="text-gray-400 text-xs mt-1">西太平洋上升气流，东太平洋下沉气流，形成完整环流</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 font-bold">4</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">东太平洋冷水上涌</p>
                        <p className="text-gray-400 text-xs mt-1">深层冷水上升补充被吹走的表层水，维持水温平衡</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 font-bold">5</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">气候系统平衡</p>
                        <p className="text-gray-400 text-xs mt-1">海洋与大气相互作用维持稳定状态</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-slate-700">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                        <Sun className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="text-sm text-gray-400">厄尔尼诺</span>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-gray-500 mx-2" />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                        <Thermometer className="w-6 h-6 text-green-400" />
                      </div>
                      <span className="text-sm text-gray-400">中性状态</span>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-gray-500 mx-2" />
                      <ChevronRight className="w-5 h-5 text-gray-500 mx-2" />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                        <Snowflake className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-400">拉尼娜</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section id="water-cycle-lab" className="scroll-mt-24 bg-slate-800/60 rounded-2xl border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">水循环联动实验</h2>
                <p className="text-sm text-gray-400 mt-1">调节能量、水汽输送和下垫面，追踪“蒸发—凝结—降水—径流/下渗”。</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs">相对强度示意 · 非实测水量</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="space-y-4">
                <label className="block text-sm text-gray-300">太阳辐射输入：{solarInput}%
                  <input aria-label="太阳辐射输入" className="block w-full mt-2 accent-yellow-400" type="range" min="0" max="100" value={solarInput} onChange={(event) => setSolarInput(Number(event.target.value))} />
                </label>
                <label className="block text-sm text-gray-300">水平水汽输送：{moistureTransport}%
                  <input aria-label="水平水汽输送" className="block w-full mt-2 accent-cyan-400" type="range" min="0" max="100" value={moistureTransport} onChange={(event) => setMoistureTransport(Number(event.target.value))} />
                </label>
                <div>
                  <p className="text-sm text-gray-300 mb-2">选择下垫面</p>
                  <div className="flex flex-wrap gap-2">
                    {([{ id: 'ocean', label: '海洋' }, { id: 'forest', label: '森林' }, { id: 'dryland', label: '干旱地表' }] as const).map((surface) => (
                      <button key={surface.id} onClick={() => setSurfaceType(surface.id)} className={`px-3 py-2 rounded-lg text-sm ${surfaceType === surface.id ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}>{surface.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: '蒸发 / 蒸腾', value: evaporationIndex, detail: '能量增加通常增强水面蒸发；植被通过蒸腾回到大气' },
                  { label: '凝结成云', value: cloudIndex, detail: '水汽输送与抬升冷却共同影响云的形成' },
                  { label: '降水', value: precipitationIndex, detail: '云滴增长后降水；降水空间可受环流和地形影响' },
                  { label: '地表径流倾向', value: runoffIndex, detail: surfaceType === 'forest' ? '植被与土壤有利于截留、入渗，径流倾向较低' : surfaceType === 'dryland' ? '干旱地表入渗条件差时，降水可能形成较强地表径流' : '海洋区降水回到海洋，构成较短的海洋水循环路径' },
                ].map((step, index) => (
                  <div key={step.label} className="rounded-xl bg-slate-700/60 p-4 border border-slate-600/70">
                    <div className="flex items-center justify-between mb-2"><span className="text-xs text-cyan-300">过程 {index + 1}</span><span className="text-white font-bold">{step.value}/100</span></div>
                    <h3 className="text-white font-semibold">{step.label}</h3>
                    <div className="h-2 rounded-full bg-slate-600 my-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all" style={{ width: `${step.value}%` }} /></div>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">推理提示：水汽从海洋输送到陆地后，降水可能经地表径流、下渗和地下径流返回海洋；此处的指数只用于比较参数改变方向，水循环长期总量仍受水量平衡约束。</p>
          </section>
        </div>
      </div>
    </div>
  );
}

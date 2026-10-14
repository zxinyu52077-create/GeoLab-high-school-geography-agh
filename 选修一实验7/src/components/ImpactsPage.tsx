import { useState } from 'react';
import { Sun, Snowflake, MapPin, Droplets, Thermometer, Wind, AlertTriangle, X, TrendingUp, TrendingDown, CloudRain, Zap, Info } from 'lucide-react';
import { regionalImpacts, historicalEvents, oceanTemperatureData } from '../data/scienceData';
import { ClimateState } from '../types';

export default function ImpactsPage() {
  const [activeState, setActiveState] = useState<ClimateState>('elnino');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regions = [
    { id: 'northAmerica', name: '北美洲', position: { top: '20%', left: '18%' } },
    { id: 'southAmerica', name: '南美洲', position: { top: '55%', left: '22%' } },
    { id: 'asia', name: '亚洲', position: { top: '25%', left: '65%' } },
    { id: 'oceania', name: '大洋洲', position: { top: '60%', left: '75%' } },
    { id: 'africa', name: '非洲', position: { top: '62%', left: '55%' } },
    { id: 'europe', name: '欧洲', position: { top: '25%', left: '42%' } },
  ];

  const currentImpacts = activeState === 'elnino' ? regionalImpacts.elnino : regionalImpacts.lanina;
  const currentTempData = oceanTemperatureData[activeState];

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(selectedRegion === regionId ? null : regionId);
  };

  const clearSelection = () => {
    setSelectedRegion(null);
  };

  const getImpactIcon = (impact: string) => {
    if (impact.includes('干旱')) return <Thermometer className="w-4 h-4 text-orange-400" />;
    if (impact.includes('暴雨') || impact.includes('洪水')) return <Droplets className="w-4 h-4 text-blue-400" />;
    if (impact.includes('暖')) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (impact.includes('冷') || impact.includes('雪')) return <Snowflake className="w-4 h-4 text-cyan-400" />;
    if (impact.includes('飓风') || impact.includes('风暴')) return <Wind className="w-4 h-4 text-purple-400" />;
    if (impact.includes('季风') || impact.includes('风')) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (impact.includes('降水') || impact.includes('雨')) return <CloudRain className="w-4 h-4 text-blue-400" />;
    return <AlertTriangle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            {activeState === 'elnino' ? (
              <Sun className="w-10 h-10 text-red-400" />
            ) : (
              <Snowflake className="w-10 h-10 text-blue-400" />
            )}
            全球影响分布
          </h1>
          <p className="text-gray-400 text-lg">探索厄尔尼诺与拉尼娜现象对全球各区域气候的深远影响</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveState('elnino'); setSelectedRegion(null); }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeState === 'elnino'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl shadow-red-500/30 scale-105'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600 hover:scale-102'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium">厄尔尼诺影响</span>
            </button>
            <button
              onClick={() => { setActiveState('lanina'); setSelectedRegion(null); }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeState === 'lanina'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/30 scale-105'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600 hover:scale-102'
              }`}
            >
              <Snowflake className="w-5 h-5" />
              <span className="font-medium">拉尼娜影响</span>
            </button>
          </div>
          
          <div className={`ml-auto px-4 py-2 rounded-lg ${
            activeState === 'elnino' ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <Info className={`w-4 h-4 ${activeState === 'elnino' ? 'text-red-400' : 'text-blue-400'}`} />
              <span className="text-sm text-gray-300">
                当前显示：{activeState === 'elnino' ? '厄尔尼诺' : '拉尼娜'}现象影响
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${activeState === 'elnino' ? 'text-red-400' : 'text-blue-400'}`} />
                  全球影响分布图
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${activeState === 'elnino' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
                    <span className="text-gray-400">异常区域</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <span className="text-gray-400">陆地</span>
                  </div>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl overflow-hidden" style={{ height: '450px' }}>
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={activeState === 'elnino' ? '#ef4444' : '#3b82f6'} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={activeState === 'elnino' ? '#ef4444' : '#3b82f6'} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <path
                    d="M 50 50 L 150 50 L 200 80 L 220 120 L 180 150 L 150 130 L 120 140 L 80 120 L 60 80 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{ filter: hoveredRegion === 'northAmerica' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
                  />
                  <text x="130" y="100" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">北美洲</text>

                  <path
                    d="M 180 200 L 250 200 L 260 250 L 240 300 L 200 320 L 170 280 L 160 240 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{ filter: hoveredRegion === 'southAmerica' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
                  />
                  <text x="220" y="260" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">南美洲</text>

                  <path
                    d="M 350 40 L 500 40 L 520 120 L 500 180 L 420 200 L 380 160 L 360 100 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{ filter: hoveredRegion === 'asia' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
                  />
                  <text x="430" y="120" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">亚洲</text>

                  <path
                    d="M 300 300 L 350 290 L 380 320 L 360 360 L 320 370 L 290 340 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{ filter: hoveredRegion === 'africa' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
                  />
                  <text x="335" y="330" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">非洲</text>

                  <path
                    d="M 280 80 L 330 70 L 340 100 L 320 130 L 290 120 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{ filter: hoveredRegion === 'europe' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
                  />
                  <text x="305" y="100" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">欧洲</text>

                  <path
                    d="M 480 280 L 540 270 L 560 320 L 530 360 L 490 350 L 470 310 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{ filter: hoveredRegion === 'oceania' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' : 'none' }}
                  />
                  <text x="520" y="320" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">大洋洲</text>

                  <ellipse
                    cx="320" cy="180" rx="150" ry="100"
                    fill={`url(#oceanGlow)`}
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="320" cy="180" rx="150" ry="100"
                    fill="none"
                    stroke={activeState === 'elnino' ? '#ef4444' : '#3b82f6'}
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className="animate-pulse"
                  />
                  <text x="320" y="185" fill={activeState === 'elnino' ? '#fca5a5' : '#93c5fd'} fontSize="14" textAnchor="middle" fontWeight="bold">
                    太平洋异常区域
                  </text>

                  {currentTempData.slice(0, 6).map((point, index) => {
                    const x = ((point.lon + 180) / 360) * 600;
                    const y = ((90 - point.lat) / 180) * 450;
                    const size = Math.abs(point.anomaly) * 8 + 4;
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r={size}
                        fill={point.anomaly > 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'}
                        className="animate-ping"
                        style={{ animationDelay: `${index * 0.5}s` }}
                      />
                    );
                  })}
                </svg>

                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      selectedRegion === region.id
                        ? 'scale-130 z-20'
                        : hoveredRegion === region.id
                          ? 'scale-115 z-10'
                          : 'z-10'
                    }`}
                    style={{
                      top: region.position.top,
                      left: region.position.left,
                    }}
                    title={`点击查看${region.name}的详细影响`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRegion === region.id
                        ? activeState === 'elnino'
                          ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 animate-pulse'
                          : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 animate-pulse'
                        : hoveredRegion === region.id
                          ? activeState === 'elnino'
                            ? 'bg-red-500/80 shadow-lg shadow-red-500/30'
                            : 'bg-blue-500/80 shadow-lg shadow-blue-500/30'
                          : 'bg-slate-700/80 hover:bg-slate-600'
                    }`}>
                      <MapPin className={`w-7 h-7 ${selectedRegion === region.id || hoveredRegion === region.id ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {(selectedRegion === region.id || hoveredRegion === region.id) && (
                      <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg ${
                        activeState === 'elnino' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      }`}>
                        {region.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${activeState === 'elnino' ? 'text-red-400' : 'text-blue-400'}`} />
                  历史事件影响回顾
                </h3>
                <div className="space-y-4">
                  {historicalEvents.filter(e => e.type === activeState).slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="bg-slate-700/50 rounded-xl p-4 hover:bg-slate-700/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">{event.name}</h4>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          event.intensity === 'very_strong' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          event.intensity === 'strong' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {event.intensity === 'very_strong' ? '极强' : event.intensity === 'strong' ? '强' : '中等'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {event.impacts.map((impact, index) => (
                          <span key={index} className="px-2.5 py-1 bg-slate-600/60 hover:bg-slate-600 rounded-full text-xs text-gray-300 transition-colors">
                            {impact}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className={`w-5 h-5 ${activeState === 'elnino' ? 'text-red-400' : 'text-blue-400'}`} />
                  温度异常数据
                </h3>
                <div className="space-y-3">
                  {currentTempData.slice(0, 5).map((point, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          point.anomaly > 0 ? 'bg-red-500/20' : 'bg-blue-500/20'
                        }`}>
                          {point.anomaly > 0 ? (
                            <Sun className="w-4 h-4 text-red-400" />
                          ) : (
                            <Snowflake className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {point.lat > 0 ? '北纬' : '南纬'}{Math.abs(point.lat)}°, {point.lon > 0 ? '东经' : '西经'}{Math.abs(point.lon)}°
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${point.anomaly > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                        {point.anomaly > 0 ? '+' : ''}{point.anomaly.toFixed(1)}°C
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {selectedRegion ? (
              <div className={`bg-slate-800/60 backdrop-blur-md rounded-2xl border p-6 shadow-xl ${
                activeState === 'elnino' ? 'border-red-500/30' : 'border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeState === 'elnino' ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30' : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30'
                    }`}>
                      <MapPin className={`w-6 h-6 ${activeState === 'elnino' ? 'text-red-400' : 'text-blue-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {regions.find(r => r.id === selectedRegion)?.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {activeState === 'elnino' ? '厄尔尼诺' : '拉尼娜'}期间的气候影响
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="p-2.5 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-all hover:scale-105"
                    title="关闭详情"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="bg-slate-700/40 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">影响数量</span>
                    <span className={`font-semibold ${activeState === 'elnino' ? 'text-red-400' : 'text-blue-400'}`}>
                      {currentImpacts[selectedRegion as keyof typeof currentImpacts]?.impacts.length || 0} 项
                    </span>
                  </div>
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      activeState === 'elnino' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`} style={{ width: '100%' }} />
                  </div>
                </div>

                <ul className="space-y-3">
                  {currentImpacts[selectedRegion as keyof typeof currentImpacts]?.impacts.map((impact, index) => (
                    <li key={index} className="flex items-start space-x-3 bg-slate-700/40 rounded-xl p-4 hover:bg-slate-700/60 transition-colors group">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        activeState === 'elnino' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      } group-hover:scale-110 transition-transform`}>
                        {getImpactIcon(impact)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-200 text-sm font-medium">{impact}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">选择区域查看详情</h3>
                <p className="text-gray-400 text-sm mb-5">点击地图上的标记点，查看该区域在{activeState === 'elnino' ? '厄尔尼诺' : '拉尼娜'}期间的具体气候影响。</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl transition-all hover:scale-102 ${
                        selectedRegion === region.id
                          ? activeState === 'elnino'
                            ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border border-red-500/50'
                            : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/50'
                          : 'bg-slate-700/50 hover:bg-slate-600 border border-transparent'
                      }`}
                    >
                      <MapPin className={`w-5 h-5 ${selectedRegion === region.id ? (activeState === 'elnino' ? 'text-red-400' : 'text-blue-400') : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${selectedRegion === region.id ? 'text-white' : 'text-gray-300'}`}>{region.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">影响对比</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                    <span className="text-gray-300 text-sm font-medium">厄尔尼诺</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm font-medium">拉尼娜</span>
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  </div>
                </div>
                
                <div className="bg-slate-700/40 rounded-xl p-4 space-y-3">
                  {[
                    { indicator: '澳大利亚东部降水', elnino: '减少', lanina: '增加' },
                    { indicator: '印度夏季风', elnino: '减弱', lanina: '增强' },
                    { indicator: '秘鲁北部降水', elnino: '增加', lanina: '减少' },
                    { indicator: '大西洋飓风', elnino: '减少', lanina: '增加' },
                    { indicator: '中国南方冬季', elnino: '偏暖', lanina: '偏冷' },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-600/50 last:border-b-0">
                      <span className="text-gray-400 text-sm">{item.indicator}</span>
                      <div className="flex space-x-6">
                        <span className="text-red-400 text-sm font-medium">{item.elnino}</span>
                        <span className="text-blue-400 text-sm font-medium">{item.lanina}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">关键要点</h3>
              <div className="space-y-3">
                {activeState === 'elnino' ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10">
                        <Thermometer className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">东太平洋海水温度异常升高，最高可达常年平均值+1.5°C以上</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10">
                        <Wind className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">东南信风减弱或逆转，导致暖水向东回流</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10">
                        <CloudRain className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">全球降水模式发生显著变化，部分地区暴雨洪涝，部分地区严重干旱</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10">
                        <Sun className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">通常导致全球平均气温升高，增加极端天气事件发生频率</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10">
                        <Snowflake className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">东太平洋海水温度异常降低，通常低于常年平均值0.5°C以上</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10">
                        <Wind className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">东南信风异常增强，将更多暖水推向太平洋西部</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10">
                        <CloudRain className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">降水模式与厄尔尼诺相反，引发不同区域的气候异常</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10">
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">通常导致大西洋飓风活动增加，对全球气候影响更为持久</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

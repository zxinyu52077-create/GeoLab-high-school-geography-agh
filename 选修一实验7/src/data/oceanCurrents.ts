/**
 * 全球洋流数据 - 扩展版
 * 包含连贯连接的洋流系统链条
 */

export interface OceanCurrent {
  id: string;
  name: string;
  lon: number;
  lat: number;
  uVelocity: number;
  vVelocity: number;
  temperature?: number;
  salinity?: number;
  speed?: number;
  depth?: number;
  season?: string;
  description?: string;
  nextCurrent?: string;
  prevCurrent?: string;
}

export const oceanCurrentsData: OceanCurrent[] = [
  // ============ 北太平洋环流系统 (顺时针) ============
  { id: 'P-NP-01', name: '北赤道暖流', lon: -140.0, lat: 10.0, uVelocity: -0.5, vVelocity: 0.0, temperature: 28.0, salinity: 35.0, speed: 0.5, depth: 50, season: '全年', description: '沿北纬10°稳定向西流动', nextCurrent: 'P-NP-02' },
  { id: 'P-NP-02', name: '黑潮', lon: 125.0, lat: 15.0, uVelocity: 0.2, vVelocity: 0.7, temperature: 26.0, salinity: 34.8, speed: 0.73, depth: 100, season: '全年', description: '沿菲律宾东岸向北流动', prevCurrent: 'P-NP-01', nextCurrent: 'P-NP-02-1' },
  { id: 'P-NP-02-1', name: '黑潮续流', lon: 130.0, lat: 25.0, uVelocity: 0.3, vVelocity: 0.65, temperature: 24.5, salinity: 34.5, speed: 0.71, depth: 100, season: '全年', description: '沿日本南岸向东北流动', prevCurrent: 'P-NP-02', nextCurrent: 'P-NP-03' },
  { id: 'P-NP-03', name: '北太平洋暖流', lon: 155.0, lat: 35.0, uVelocity: 0.5, vVelocity: 0.2, temperature: 18.0, salinity: 34.2, speed: 0.54, depth: 100, season: '全年', description: '黑潮延续体，向东流动', prevCurrent: 'P-NP-02-1', nextCurrent: 'P-NP-03-1' },
  { id: 'P-NP-03-1', name: '北太平洋暖流东部', lon: -170.0, lat: 40.0, uVelocity: 0.6, vVelocity: 0.0, temperature: 16.0, salinity: 34.0, speed: 0.6, depth: 100, season: '全年', description: '沿北纬40°向东流动', prevCurrent: 'P-NP-03', nextCurrent: 'P-NP-04' },
  { id: 'P-NP-04', name: '加利福尼亚寒流', lon: -130.0, lat: 40.0, uVelocity: 0.0, vVelocity: -0.35, temperature: 14.0, salinity: 33.8, speed: 0.35, depth: 150, season: '全年', description: '沿北美西岸向南流动', prevCurrent: 'P-NP-03-1', nextCurrent: 'P-NP-04-1' },
  { id: 'P-NP-04-1', name: '加利福尼亚寒流南部', lon: -125.0, lat: 25.0, uVelocity: -0.1, vVelocity: -0.25, temperature: 16.0, salinity: 34.0, speed: 0.27, depth: 150, season: '全年', description: '继续向南流动', prevCurrent: 'P-NP-04', nextCurrent: 'P-NP-01' },
  
  // ============ 南太平洋环流系统 (逆时针) ============
  { id: 'P-SP-01', name: '南赤道暖流', lon: -140.0, lat: -10.0, uVelocity: -0.6, vVelocity: 0.0, temperature: 28.5, salinity: 35.2, speed: 0.6, depth: 50, season: '全年', description: '沿赤道南侧向西流动', nextCurrent: 'P-SP-02' },
  { id: 'P-SP-02', name: '东澳大利亚暖流', lon: 155.0, lat: -15.0, uVelocity: 0.0, vVelocity: -0.45, temperature: 23.0, salinity: 34.8, speed: 0.45, depth: 150, season: '全年', description: '沿澳大利亚东岸向南流动', prevCurrent: 'P-SP-01', nextCurrent: 'P-SP-03' },
  { id: 'P-SP-03', name: '南太平洋西风漂流', lon: 160.0, lat: -45.0, uVelocity: 0.45, vVelocity: 0.0, temperature: 5.0, salinity: 34.0, speed: 0.45, depth: 300, season: '全年', description: '向东流动的寒流', prevCurrent: 'P-SP-02', nextCurrent: 'P-SP-03-1' },
  { id: 'P-SP-03-1', name: '南太平洋西风漂流东部', lon: -120.0, lat: -47.0, uVelocity: 0.4, vVelocity: 0.0, temperature: 4.0, salinity: 34.2, speed: 0.4, depth: 300, season: '全年', description: '继续向东流动', prevCurrent: 'P-SP-03', nextCurrent: 'P-SP-04' },
  { id: 'P-SP-04', name: '秘鲁寒流', lon: -80.0, lat: -40.0, uVelocity: 0.0, vVelocity: 0.3, temperature: 8.0, salinity: 34.5, speed: 0.3, depth: 200, season: '全年', description: '沿南美洲西岸向北流动', prevCurrent: 'P-SP-03-1', nextCurrent: 'P-SP-04-1' },
  { id: 'P-SP-04-1', name: '秘鲁寒流北部', lon: -80.0, lat: -15.0, uVelocity: -0.1, vVelocity: 0.25, temperature: 12.0, salinity: 34.8, speed: 0.27, depth: 200, season: '全年', description: '继续向北流动，汇入赤道逆流', prevCurrent: 'P-SP-04', nextCurrent: 'P-OT-01' },
  
  // ============ 太平洋其他洋流 ============
  { id: 'P-OT-01', name: '赤道逆流', lon: -150.0, lat: 5.0, uVelocity: 0.6, vVelocity: 0.0, temperature: 29.0, salinity: 35.0, speed: 0.6, depth: 50, season: '全年', description: '位于南北赤道暖流之间向东流动', prevCurrent: 'P-SP-04-1', nextCurrent: 'P-NP-01' },
  { id: 'P-OT-02', name: '棉兰老暖流', lon: 127.0, lat: 5.0, uVelocity: -0.2, vVelocity: -0.3, temperature: 27.0, salinity: 34.8, speed: 0.36, depth: 100, season: '全年', description: '沿菲律宾棉兰老岛东岸向南流动', nextCurrent: 'P-SP-01' },
  { id: 'P-NP-05', name: '阿拉斯加暖流', lon: -148.0, lat: 55.0, uVelocity: 0.3, vVelocity: 0.35, temperature: 8.0, salinity: 33.5, speed: 0.46, depth: 200, season: '夏季', description: '沿阿拉斯加湾向北流动', nextCurrent: 'P-NP-06' },
  { id: 'P-NP-06', name: '亲潮', lon: 160.0, lat: 55.0, uVelocity: -0.15, vVelocity: -0.25, temperature: 4.0, salinity: 33.2, speed: 0.29, depth: 200, season: '全年', description: '沿千岛群岛向南流动', prevCurrent: 'P-NP-05', nextCurrent: 'P-NP-02-1' },
  
  // ============ 北大西洋环流系统 (顺时针) ============
  { id: 'A-NA-01', name: '北赤道暖流', lon: -45.0, lat: 15.0, uVelocity: -0.45, vVelocity: 0.0, temperature: 27.5, salinity: 35.2, speed: 0.45, depth: 50, season: '全年', description: '沿北纬15°向西流动', nextCurrent: 'A-NA-02' },
  { id: 'A-NA-02', name: '安的列斯暖流', lon: -70.0, lat: 18.0, uVelocity: 0.0, vVelocity: 0.55, temperature: 25.0, salinity: 35.0, speed: 0.55, depth: 100, season: '全年', description: '沿安的列斯群岛向北流动', prevCurrent: 'A-NA-01', nextCurrent: 'A-NA-03' },
  { id: 'A-NA-03', name: '墨西哥湾暖流', lon: -80.0, lat: 25.0, uVelocity: 0.5, vVelocity: 0.7, temperature: 23.0, salinity: 35.0, speed: 0.86, depth: 200, season: '全年', description: '沿北美东南岸向东北流动', prevCurrent: 'A-NA-02', nextCurrent: 'A-NA-03-1' },
  { id: 'A-NA-03-1', name: '墨西哥湾暖流延续', lon: -60.0, lat: 35.0, uVelocity: 0.6, vVelocity: 0.5, temperature: 20.0, salinity: 35.0, speed: 0.78, depth: 200, season: '全年', description: '继续向东北流动', prevCurrent: 'A-NA-03', nextCurrent: 'A-NA-04' },
  { id: 'A-NA-04', name: '北大西洋暖流', lon: -30.0, lat: 45.0, uVelocity: 0.45, vVelocity: 0.4, temperature: 14.0, salinity: 35.2, speed: 0.6, depth: 200, season: '全年', description: '流向不列颠群岛', prevCurrent: 'A-NA-03-1', nextCurrent: 'A-NA-04-1' },
  { id: 'A-NA-04-1', name: '北大西洋暖流东部', lon: -10.0, lat: 52.0, uVelocity: 0.35, vVelocity: 0.3, temperature: 12.0, salinity: 35.1, speed: 0.46, depth: 200, season: '全年', description: '进入挪威海', prevCurrent: 'A-NA-04', nextCurrent: 'AR-01' },
  { id: 'A-NA-05', name: '加那利寒流', lon: -25.0, lat: 35.0, uVelocity: 0.0, vVelocity: -0.45, temperature: 18.0, salinity: 35.5, speed: 0.45, depth: 200, season: '全年', description: '沿非洲西北岸向南流动', prevCurrent: 'A-NA-04', nextCurrent: 'A-NA-05-1' },
  { id: 'A-NA-05-1', name: '加那利寒流南部', lon: -18.0, lat: 20.0, uVelocity: -0.1, vVelocity: -0.4, temperature: 22.0, salinity: 35.3, speed: 0.41, depth: 200, season: '全年', description: '继续向南流动', prevCurrent: 'A-NA-05', nextCurrent: 'A-NA-01' },
  
  // ============ 南大西洋环流系统 (逆时针) ============
  { id: 'A-SA-01', name: '南赤道暖流', lon: -30.0, lat: -5.0, uVelocity: -0.55, vVelocity: 0.0, temperature: 28.0, salinity: 35.0, speed: 0.55, depth: 50, season: '全年', description: '沿赤道南侧向西流动', nextCurrent: 'A-SA-02' },
  { id: 'A-SA-02', name: '巴西暖流', lon: -45.0, lat: -10.0, uVelocity: 0.0, vVelocity: -0.45, temperature: 21.0, salinity: 34.8, speed: 0.45, depth: 150, season: '全年', description: '沿南美大陆东南岸向南流动', prevCurrent: 'A-SA-01', nextCurrent: 'A-SA-03' },
  { id: 'A-SA-03', name: '南大西洋西风漂流', lon: -40.0, lat: -42.0, uVelocity: 0.45, vVelocity: 0.0, temperature: 6.0, salinity: 34.2, speed: 0.45, depth: 300, season: '全年', description: '向东流动的寒流', prevCurrent: 'A-SA-02', nextCurrent: 'A-SA-03-1' },
  { id: 'A-SA-03-1', name: '南大西洋西风漂流东部', lon: 10.0, lat: -45.0, uVelocity: 0.4, vVelocity: 0.0, temperature: 5.0, salinity: 34.0, speed: 0.4, depth: 300, season: '全年', description: '继续向东流动', prevCurrent: 'A-SA-03', nextCurrent: 'A-SA-04' },
  { id: 'A-SA-04', name: '本格拉寒流', lon: 15.0, lat: -35.0, uVelocity: 0.0, vVelocity: 0.35, temperature: 14.0, salinity: 35.0, speed: 0.35, depth: 200, season: '全年', description: '沿南部非洲西岸向北流动', prevCurrent: 'A-SA-03-1', nextCurrent: 'A-SA-04-1' },
  { id: 'A-SA-04-1', name: '本格拉寒流北部', lon: 12.0, lat: -15.0, uVelocity: 0.1, vVelocity: 0.3, temperature: 18.0, salinity: 35.2, speed: 0.32, depth: 200, season: '全年', description: '继续向北流动', prevCurrent: 'A-SA-04', nextCurrent: 'A-SA-01' },
  
  // ============ 大西洋其他洋流 ============
  { id: 'A-OT-01', name: '拉布拉多寒流', lon: -55.0, lat: 50.0, uVelocity: 0.0, vVelocity: -0.4, temperature: 2.0, salinity: 32.5, speed: 0.4, depth: 200, season: '冬季', description: '沿拉布拉多半岛向南流动', nextCurrent: 'A-NA-03' },
  { id: 'A-OT-02', name: '几内亚暖流', lon: 0.0, lat: 5.0, uVelocity: 0.5, vVelocity: 0.25, temperature: 27.0, salinity: 34.5, speed: 0.56, depth: 100, season: '夏季', description: '沿非洲几内亚湾向东流动', nextCurrent: 'A-NA-01' },
  
  // ============ 印度洋洋流 ============
  { id: 'I-NI-01', name: '季风洋流(冬季)', lon: 80.0, lat: 5.0, uVelocity: -0.45, vVelocity: 0.0, temperature: 26.0, salinity: 34.8, speed: 0.45, depth: 100, season: '冬季', description: '受东北季风影响向西流动', nextCurrent: 'I-NI-01-1' },
  { id: 'I-NI-01-1', name: '季风洋流(冬季西段)', lon: 60.0, lat: 5.0, uVelocity: -0.4, vVelocity: 0.0, temperature: 25.0, salinity: 35.0, speed: 0.4, depth: 100, season: '冬季', description: '继续向西流动', prevCurrent: 'I-NI-01', nextCurrent: 'I-SI-03' },
  { id: 'I-NI-02', name: '索马里暖流(夏季)', lon: 50.0, lat: 5.0, uVelocity: 0.3, vVelocity: 0.5, temperature: 25.0, salinity: 35.0, speed: 0.58, depth: 100, season: '夏季', description: '受西南季风影响向北流动', nextCurrent: 'I-NI-02-1' },
  { id: 'I-NI-02-1', name: '索马里暖流(夏季北段)', lon: 48.0, lat: 12.0, uVelocity: 0.4, vVelocity: 0.3, temperature: 24.0, salinity: 35.0, speed: 0.5, depth: 100, season: '夏季', description: '转向东北流动', prevCurrent: 'I-NI-02', nextCurrent: 'I-NI-01' },
  { id: 'I-SI-01', name: '南赤道暖流', lon: 70.0, lat: -8.0, uVelocity: -0.55, vVelocity: 0.0, temperature: 27.5, salinity: 35.0, speed: 0.55, depth: 50, season: '全年', description: '南印度洋低纬度向西流动', nextCurrent: 'I-SI-03' },
  { id: 'I-SI-02', name: '厄加勒斯暖流', lon: 35.0, lat: -25.0, uVelocity: 0.0, vVelocity: -0.55, temperature: 19.0, salinity: 34.8, speed: 0.55, depth: 150, season: '全年', description: '沿非洲东南岸向南流动', prevCurrent: 'I-SI-03', nextCurrent: 'I-SI-04' },
  { id: 'I-SI-03', name: '莫桑比克暖流', lon: 40.0, lat: -15.0, uVelocity: 0.0, vVelocity: -0.45, temperature: 23.0, salinity: 34.5, speed: 0.45, depth: 150, season: '全年', description: '沿莫桑比克海峡向南流动', prevCurrent: 'I-SI-01', nextCurrent: 'I-SI-02' },
  { id: 'I-SI-04', name: '印度洋西风漂流', lon: 60.0, lat: -42.0, uVelocity: 0.45, vVelocity: 0.0, temperature: 5.0, salinity: 34.0, speed: 0.45, depth: 300, season: '全年', description: '向东流动的寒流', prevCurrent: 'I-SI-02', nextCurrent: 'I-SI-04-1' },
  { id: 'I-SI-04-1', name: '印度洋西风漂流东部', lon: 110.0, lat: -40.0, uVelocity: 0.4, vVelocity: 0.0, temperature: 6.0, salinity: 34.2, speed: 0.4, depth: 300, season: '全年', description: '继续向东流动', prevCurrent: 'I-SI-04', nextCurrent: 'I-SI-05' },
  { id: 'I-SI-05', name: '西澳大利亚寒流', lon: 115.0, lat: -35.0, uVelocity: 0.0, vVelocity: 0.3, temperature: 16.0, salinity: 34.5, speed: 0.3, depth: 200, season: '全年', description: '沿澳大利亚西岸向北流动', prevCurrent: 'I-SI-04-1', nextCurrent: 'I-SI-01' },
  
  // ============ 北冰洋洋流 ============
  { id: 'AR-01', name: '挪威暖流', lon: 5.0, lat: 65.0, uVelocity: 0.35, vVelocity: 0.45, temperature: 8.0, salinity: 34.5, speed: 0.57, depth: 200, season: '全年', description: '沿挪威西岸向北流动', prevCurrent: 'A-NA-04-1', nextCurrent: 'AR-02' },
  { id: 'AR-02', name: '东格陵兰寒流', lon: -15.0, lat: 70.0, uVelocity: -0.25, vVelocity: -0.25, temperature: -1.0, salinity: 32.0, speed: 0.35, depth: 200, season: '全年', description: '沿格陵兰岛东岸向南流动', prevCurrent: 'AR-01', nextCurrent: 'A-OT-01' },
  { id: 'AR-03', name: '北角暖流', lon: 25.0, lat: 70.0, uVelocity: 0.4, vVelocity: 0.35, temperature: 6.0, salinity: 34.0, speed: 0.53, depth: 200, season: '全年', description: '沿挪威北岸向东流动', prevCurrent: 'AR-01', nextCurrent: 'AR-04' },
  { id: 'AR-04', name: '斯匹次卑尔根暖流', lon: 10.0, lat: 78.0, uVelocity: 0.3, vVelocity: 0.35, temperature: 4.0, salinity: 33.8, speed: 0.46, depth: 200, season: '全年', description: '沿斯匹次卑尔根群岛西岸向北流动', prevCurrent: 'AR-03' },
  
  // ============ 南大洋洋流 ============
  { id: 'SO-01', name: '南极绕极流', lon: -60.0, lat: -55.0, uVelocity: 0.5, vVelocity: 0.0, temperature: 2.0, salinity: 34.5, speed: 0.5, depth: 500, season: '全年', description: '全球最大洋流，环绕南极流动', nextCurrent: 'SO-01-1' },
  { id: 'SO-01-1', name: '南极绕极流(太平洋段)', lon: 160.0, lat: -55.0, uVelocity: 0.45, vVelocity: 0.0, temperature: 1.5, salinity: 34.6, speed: 0.45, depth: 500, season: '全年', description: '太平洋区域段', prevCurrent: 'SO-01', nextCurrent: 'SO-01-2' },
  { id: 'SO-01-2', name: '南极绕极流(大西洋段)', lon: 0.0, lat: -55.0, uVelocity: 0.5, vVelocity: 0.0, temperature: 2.0, salinity: 34.5, speed: 0.5, depth: 500, season: '全年', description: '大西洋区域段', prevCurrent: 'SO-01-1', nextCurrent: 'SO-01-3' },
  { id: 'SO-01-3', name: '南极绕极流(印度洋段)', lon: 80.0, lat: -55.0, uVelocity: 0.48, vVelocity: 0.0, temperature: 1.8, salinity: 34.5, speed: 0.48, depth: 500, season: '全年', description: '印度洋区域段', prevCurrent: 'SO-01-2', nextCurrent: 'SO-01' },
];

export const getCurrentsByOcean = (ocean: string): OceanCurrent[] => {
  const prefixes: { [key: string]: string[] } = {
    'pacific': ['P-NP', 'P-SP', 'P-OT'],
    'atlantic': ['A-NA', 'A-SA', 'A-OT'],
    'indian': ['I-NI', 'I-SI'],
    'arctic': ['AR'],
    'southern': ['SO'],
  };
  
  const keys = prefixes[ocean.toLowerCase()] || [];
  return oceanCurrentsData.filter(c => keys.some(k => c.id.startsWith(k)));
};

export const getCurrentById = (id: string): OceanCurrent | undefined => {
  return oceanCurrentsData.find(c => c.id === id);
};

export const getConnectedCurrents = (startId: string): OceanCurrent[] => {
  const result: OceanCurrent[] = [];
  const visited = new Set<string>();
  let current = getCurrentById(startId);
  
  while (current) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    result.push(current);
    const nextId = current.nextCurrent;
    current = nextId ? getCurrentById(nextId) : undefined;
  }
  
  return result;
};
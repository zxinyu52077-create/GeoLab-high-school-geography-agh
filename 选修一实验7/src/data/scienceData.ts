export interface ClimateEvent {
  id: string;
  name: string;
  type: 'elnino' | 'lanina' | 'neutral';
  year: number;
  intensity: 'weak' | 'moderate' | 'strong' | 'very_strong';
  description: string;
  impacts: string[];
}

export interface OceanTemperature {
  lat: number;
  lon: number;
  anomaly: number;
}

export const elninoDefinition = {
  name: '厄尔尼诺现象',
  englishName: 'El Niño',
  definition: '厄尔尼诺是指赤道东太平洋海水温度异常升高的现象，是全球气候系统中最重要的年际变化信号之一。',
  origin: '名称来源于西班牙语"El Niño"，意为"小男孩"，最初由秘鲁渔民发现圣诞节前后海水变暖的现象。',
  characteristics: [
    '赤道东太平洋海水温度异常升高（通常超过常年平均值0.5℃）',
    '信风减弱或逆转',
    '沃克环流减弱或崩溃',
    '东太平洋海平面上升',
    '全球气候模式发生显著变化'
  ],
  formationMechanism: [
    '正常情况下，东南信风将温暖的表层海水吹向太平洋西部',
    '西部海水堆积，形成暖池，东部则因深层冷水上翻而较冷',
    '当信风减弱时，西部暖水向东回流',
    '东太平洋海水温度升高，形成厄尔尼诺',
    '厄尔尼诺会进一步削弱信风，形成正反馈'
  ]
};

export const laninaDefinition = {
  name: '拉尼娜现象',
  englishName: 'La Niña',
  definition: '拉尼娜是厄尔尼诺的相反现象，指赤道东太平洋海水温度异常降低的现象。',
  origin: '名称来源于西班牙语"La Niña"，意为"小女孩"，是厄尔尼诺的对应词。',
  characteristics: [
    '赤道东太平洋海水温度异常降低（通常低于常年平均值0.5℃）',
    '信风增强',
    '沃克环流增强',
    '东太平洋海平面下降',
    '全球气候模式发生与厄尔尼诺相反的变化'
  ],
  formationMechanism: [
    '信风异常增强，将更多暖水推向太平洋西部',
    '东太平洋深层冷水上翻加剧，水温降低',
    '冷水区域扩大，形成拉尼娜',
    '拉尼娜会进一步增强信风，形成正反馈'
  ]
};

export const walkerCirculation = {
  description: '沃克环流是赤道太平洋上空的大型大气环流系统，是理解厄尔尼诺和拉尼娜的关键。',
  normalState: [
    '太平洋东部：冷空气下沉，形成高压区',
    '太平洋西部：暖空气上升，形成低压区',
    '近地面：东南信风从东向西吹',
    '高空：气流从西向东回流',
    '形成完整的闭合环流'
  ],
  elninoState: [
    '东太平洋海水变暖，上升气流增强',
    '西太平洋上升气流减弱',
    '沃克环流减弱甚至反向',
    '信风减弱或变为西风',
    '导致降水分布异常'
  ],
  laninaState: [
    '东太平洋海水变冷，下沉气流增强',
    '西太平洋上升气流更强',
    '沃克环流增强',
    '信风异常强劲',
    '加剧正常的气候模式'
  ]
};

export const historicalEvents: ClimateEvent[] = [
  {
    id: '1982-83',
    name: '1982-1983年厄尔尼诺',
    type: 'elnino',
    year: 1982,
    intensity: 'very_strong',
    description: '20世纪最强的厄尔尼诺事件之一，全球多地遭受严重灾害。',
    impacts: ['澳大利亚严重干旱', '印度夏季季风减弱', '秘鲁发生特大洪水', '全球气温升高0.4℃']
  },
  {
    id: '1997-98',
    name: '1997-1998年厄尔尼诺',
    type: 'elnino',
    year: 1997,
    intensity: 'very_strong',
    description: '有记录以来最强的厄尔尼诺事件，造成全球重大气候异常。',
    impacts: ['东南亚严重森林火灾', '巴西东北部干旱', '美国加州暴雨', '全球经济损失超过300亿美元']
  },
  {
    id: '2015-16',
    name: '2015-2016年厄尔尼诺',
    type: 'elnino',
    year: 2015,
    intensity: 'strong',
    description: '21世纪以来最强的厄尔尼诺事件。',
    impacts: ['非洲之角严重干旱', '智利北部洪水', '中国南方暴雨洪涝', '全球平均气温创历史新高']
  },
  {
    id: '1998-2001',
    name: '1998-2001年拉尼娜',
    type: 'lanina',
    year: 1998,
    intensity: 'strong',
    description: '紧随1997-98厄尔尼诺之后的强拉尼娜事件。',
    impacts: ['澳大利亚东部暴雨洪水', '印度季风偏强', '美国东南部干旱', '大西洋飓风活动增加']
  },
  {
    id: '2007-08',
    name: '2007-2008年拉尼娜',
    type: 'lanina',
    year: 2007,
    intensity: 'moderate',
    description: '中等强度的拉尼娜事件。',
    impacts: ['东南亚洪水', '巴西南部干旱', '中国南方雪灾', '秘鲁沿海异常寒冷']
  }
];

export const regionalImpacts = {
  elnino: {
    northAmerica: {
      title: '北美洲',
      impacts: ['美国西南部冬季降水增多', '美国东南部干旱', '加拿大西部暖冬', '墨西哥湾飓风减少']
    },
    southAmerica: {
      title: '南美洲',
      impacts: ['秘鲁北部和厄瓜多尔暴雨洪水', '巴西东北部严重干旱', '阿根廷中部多雨', '智利中部温暖湿润']
    },
    asia: {
      title: '亚洲',
      impacts: ['印度夏季风减弱，干旱', '东南亚干旱，森林火灾', '中国南方冬季偏暖、降水增多', '日本冬季降雪减少']
    },
    oceania: {
      title: '大洋洲',
      impacts: ['澳大利亚东部和北部严重干旱', '新西兰北部降水减少', '太平洋岛国暴雨']
    },
    africa: {
      title: '非洲',
      impacts: ['东非和南非降水增多', '西非干旱', '非洲之角严重干旱']
    },
    europe: {
      title: '欧洲',
      impacts: ['欧洲南部冬季偏暖', '北欧冬季异常寒冷', '地中海地区降水异常']
    }
  },
  lanina: {
    northAmerica: {
      title: '北美洲',
      impacts: ['美国东南部冬季降水增多', '美国西北部干旱', '加拿大东部寒冷', '大西洋飓风活动增加']
    },
    southAmerica: {
      title: '南美洲',
      impacts: ['巴西南部干旱', '阿根廷北部多雨', '秘鲁沿海冷水上翻增强']
    },
    asia: {
      title: '亚洲',
      impacts: ['印度夏季风偏强', '东南亚降水增多', '中国南方冬季偏冷、易出现低温雨雪', '日本冬季降雪增多']
    },
    oceania: {
      title: '大洋洲',
      impacts: ['澳大利亚东部降水增多', '新西兰南部降水增多']
    },
    africa: {
      title: '非洲',
      impacts: ['东非干旱', '西非降水增多']
    },
    europe: {
      title: '欧洲',
      impacts: ['欧洲北部冬季偏冷', '南欧冬季降水偏多']
    }
  }
};

export const oceanTemperatureData: { [key: string]: OceanTemperature[] } = {
  elnino: [
    { lat: -5, lon: -180, anomaly: 0.8 },
    { lat: 0, lon: -170, anomaly: 1.2 },
    { lat: 5, lon: -160, anomaly: 1.5 },
    { lat: 0, lon: -150, anomaly: 1.8 },
    { lat: -5, lon: -140, anomaly: 1.6 },
    { lat: 0, lon: -130, anomaly: 1.2 },
    { lat: 5, lon: -120, anomaly: 0.9 },
    { lat: 0, lon: -110, anomaly: 0.6 },
    { lat: -5, lon: -100, anomaly: 0.4 },
    { lat: 0, lon: -90, anomaly: 0.2 },
    { lat: -10, lon: -160, anomaly: 1.0 },
    { lat: -10, lon: -150, anomaly: 1.3 },
    { lat: -10, lon: -140, anomaly: 1.1 },
    { lat: 10, lon: -160, anomaly: 0.9 },
    { lat: 10, lon: -150, anomaly: 1.2 },
  ],
  lanina: [
    { lat: -5, lon: -180, anomaly: -0.6 },
    { lat: 0, lon: -170, anomaly: -1.0 },
    { lat: 5, lon: -160, anomaly: -1.3 },
    { lat: 0, lon: -150, anomaly: -1.5 },
    { lat: -5, lon: -140, anomaly: -1.2 },
    { lat: 0, lon: -130, anomaly: -0.9 },
    { lat: 5, lon: -120, anomaly: -0.7 },
    { lat: 0, lon: -110, anomaly: -0.5 },
    { lat: -5, lon: -100, anomaly: -0.3 },
    { lat: 0, lon: -90, anomaly: -0.2 },
    { lat: -10, lon: -160, anomaly: -0.8 },
    { lat: -10, lon: -150, anomaly: -1.1 },
    { lat: -10, lon: -140, anomaly: -0.9 },
    { lat: 10, lon: -160, anomaly: -0.7 },
    { lat: 10, lon: -150, anomaly: -1.0 },
  ],
  neutral: [
    { lat: -5, lon: -180, anomaly: 0.0 },
    { lat: 0, lon: -170, anomaly: 0.1 },
    { lat: 5, lon: -160, anomaly: -0.1 },
    { lat: 0, lon: -150, anomaly: 0.0 },
    { lat: -5, lon: -140, anomaly: 0.1 },
    { lat: 0, lon: -130, anomaly: 0.0 },
    { lat: 5, lon: -120, anomaly: -0.1 },
    { lat: 0, lon: -110, anomaly: 0.0 },
    { lat: -5, lon: -100, anomaly: 0.1 },
    { lat: 0, lon: -90, anomaly: 0.0 },
  ]
};

export const noaaData = {
  ninoRegions: [
    { id: 'Nino 1+2', area: '0-10°S, 80-90°W', description: '东太平洋最东部' },
    { id: 'Nino 3', area: '5°N-5°S, 90-150°W', description: '东太平洋中部' },
    { id: 'Nino 4', area: '5°N-5°S, 160°E-150°W', description: '西太平洋' },
    { id: 'Nino 3.4', area: '5°N-5°S, 170-120°W', description: '关键监测区域' }
  ],
  oniIndex: [
    { month: '2023-01', value: 0.8 },
    { month: '2023-02', value: 0.9 },
    { month: '2023-03', value: 1.0 },
    { month: '2023-04', value: 1.2 },
    { month: '2023-05', value: 1.1 },
    { month: '2023-06', value: 0.9 },
    { month: '2023-07', value: 0.7 },
    { month: '2023-08', value: 0.5 },
    { month: '2023-09', value: 0.3 },
    { month: '2023-10', value: 0.1 },
    { month: '2023-11', value: -0.2 },
    { month: '2023-12', value: -0.4 },
  ],
  threshold: {
    elnino: 0.5,
    lanina: -0.5,
    warning: 0.8
  }
};

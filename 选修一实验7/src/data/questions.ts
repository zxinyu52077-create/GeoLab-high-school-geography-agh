export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'graph';
  difficulty: 'easy' | 'medium' | 'hard';
  chapter: string;
  content: string;
  options?: { label: string; value: string; isCorrect: boolean }[];
  graphPath?: string;
  graphPaths?: string[];
  graphData?: {
    type: 'temperature' | 'pressure' | 'wind' | 'ocean';
    title: string;
    description: string;
  };
  correctAnswer: string | string[];
  explanation: string;
  relatedKnowledge: string[];
}

export const questions: Question[] = [
  // === 环节1：基础概念 ===
  {
    id: 'q1',
    type: 'single',
    difficulty: 'easy',
    chapter: '厄尔尼诺基础概念',
    content: '厄尔尼诺现象的核心特征是什么？',
    options: [
      { label: 'A', value: '赤道东太平洋海水温度异常升高', isCorrect: true },
      { label: 'B', value: '赤道西太平洋海水温度异常升高', isCorrect: false },
      { label: 'C', value: '全球平均气温下降', isCorrect: false },
      { label: 'D', value: '极地冰盖融化加速', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '厄尔尼诺的核心定义是赤道东太平洋（Nino 3.4区域）海水表面温度比常年平均值升高0.5℃以上，并持续至少5个月。',
    relatedKnowledge: ['厄尔尼诺定义', 'Nino区域', '温度异常标准']
  },
  {
    id: 'q2',
    type: 'single',
    difficulty: 'easy',
    chapter: '拉尼娜基础概念',
    content: '拉尼娜现象与厄尔尼诺现象的关系是什么？',
    options: [
      { label: 'A', value: '两者是同一现象的不同阶段', isCorrect: false },
      { label: 'B', value: '两者是相反的现象', isCorrect: true },
      { label: 'C', value: '拉尼娜是厄尔尼诺的前兆', isCorrect: false },
      { label: 'D', value: '两者没有直接关系', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '拉尼娜是厄尔尼诺的相反现象，表现为赤道东太平洋海水温度异常降低。两者交替出现，构成ENSO循环。',
    relatedKnowledge: ['拉尼娜定义', 'ENSO循环', '厄尔尼诺-拉尼娜交替']
  },
  {
    id: 'q3',
    type: 'single',
    difficulty: 'easy',
    chapter: '名称由来',
    content: '厄尔尼诺（El Niño）这个名称来源于哪种语言？',
    options: [
      { label: 'A', value: '英语', isCorrect: false },
      { label: 'B', value: '西班牙语', isCorrect: true },
      { label: 'C', value: '葡萄牙语', isCorrect: false },
      { label: 'D', value: '汉语', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺（El Niño）在西班牙语中意为"小男孩"，最初由秘鲁渔民发现圣诞节前后海水变暖的现象，故以此命名。',
    relatedKnowledge: ['名称起源', '发现历史', '秘鲁渔民']
  },
  {
    id: 'q4',
    type: 'single',
    difficulty: 'easy',
    chapter: 'ENSO概念',
    content: 'ENSO的全称是什么？',
    options: [
      { label: 'A', value: '厄尔尼诺南方涛动', isCorrect: true },
      { label: 'B', value: '全球气候振荡系统', isCorrect: false },
      { label: 'C', value: '东太平洋洋流系统', isCorrect: false },
      { label: 'D', value: '海洋大气相互作用', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: 'ENSO是El Niño-Southern Oscillation的缩写，即厄尔尼诺南方涛动，是全球最重要的年际气候变率信号。',
    relatedKnowledge: ['ENSO定义', '缩写含义', '气候变率']
  },
  {
    id: 'q5',
    type: 'single',
    difficulty: 'medium',
    chapter: '温度异常标准',
    content: '厄尔尼诺的温度异常标准是多少？',
    options: [
      { label: 'A', value: '高于常年平均值0.3℃', isCorrect: false },
      { label: 'B', value: '高于常年平均值0.5℃', isCorrect: true },
      { label: 'C', value: '高于常年平均值1.0℃', isCorrect: false },
      { label: 'D', value: '高于常年平均值1.5℃', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺的判定标准是Nino 3.4区域海表温度异常高于常年平均值0.5℃以上，并持续至少5个月。',
    relatedKnowledge: ['温度异常标准', 'Nino 3.4区域', '判定方法']
  },
  {
    id: 'q6',
    type: 'single',
    difficulty: 'medium',
    chapter: '拉尼娜定义',
    content: '拉尼娜现象的温度异常标准是多少？',
    options: [
      { label: 'A', value: '低于常年平均值0.3℃', isCorrect: false },
      { label: 'B', value: '低于常年平均值0.5℃', isCorrect: true },
      { label: 'C', value: '低于常年平均值1.0℃', isCorrect: false },
      { label: 'D', value: '低于常年平均值1.5℃', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '拉尼娜的判定标准是Nino 3.4区域海表温度异常低于常年平均值0.5℃以上，并持续至少5个月。',
    relatedKnowledge: ['拉尼娜判定标准', '温度异常', 'ENSO监测']
  },
  {
    id: 'q7',
    type: 'single',
    difficulty: 'easy',
    chapter: '中性状态',
    content: '当Nino 3.4区域海温异常在什么范围内属于中性状态？',
    options: [
      { label: 'A', value: '-0.5℃到+0.5℃之间', isCorrect: true },
      { label: 'B', value: '-1.0℃到+1.0℃之间', isCorrect: false },
      { label: 'C', value: '-0.3℃到+0.3℃之间', isCorrect: false },
      { label: 'D', value: '-0.8℃到+0.8℃之间', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '当Nino 3.4区域海温异常在-0.5℃到+0.5℃之间时，属于ENSO中性状态，既不是厄尔尼诺也不是拉尼娜。',
    relatedKnowledge: ['中性状态', 'ENSO循环', '温度范围']
  },
  {
    id: 'q8',
    type: 'multiple',
    difficulty: 'medium',
    chapter: 'ENSO特征',
    content: '以下哪些是厄尔尼诺的典型特征？（多选）',
    options: [
      { label: 'A', value: '东太平洋海水变暖', isCorrect: true },
      { label: 'B', value: '东南信风减弱', isCorrect: true },
      { label: 'C', value: '西太平洋海平面下降', isCorrect: true },
      { label: 'D', value: '全球平均气温下降', isCorrect: false }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '厄尔尼诺的典型特征包括东太平洋海水变暖、东南信风减弱、西太平洋海平面下降等，通常会导致全球平均气温升高。',
    relatedKnowledge: ['厄尔尼诺特征', '信风变化', '海平面变化']
  },
  {
    id: 'q9',
    type: 'multiple',
    difficulty: 'medium',
    chapter: '拉尼娜特征',
    content: '以下哪些是拉尼娜的典型特征？（多选）',
    options: [
      { label: 'A', value: '东太平洋海水变冷', isCorrect: true },
      { label: 'B', value: '东南信风增强', isCorrect: true },
      { label: 'C', value: '东太平洋海平面上升', isCorrect: false },
      { label: 'D', value: '沃克环流增强', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '拉尼娜的典型特征包括东太平洋海水变冷、东南信风增强、沃克环流增强等，东太平洋海平面通常会下降。',
    relatedKnowledge: ['拉尼娜特征', '沃克环流', '信风']
  },
  {
    id: 'q10',
    type: 'single',
    difficulty: 'hard',
    chapter: 'ENSO周期',
    content: 'ENSO循环的平均周期大约是多少年？',
    options: [
      { label: 'A', value: '1-2年', isCorrect: false },
      { label: 'B', value: '2-7年', isCorrect: true },
      { label: 'C', value: '5-10年', isCorrect: false },
      { label: 'D', value: '10-15年', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'ENSO循环的周期不固定，通常在2到7年之间，平均周期约为4年左右。',
    relatedKnowledge: ['ENSO周期', '气候振荡', '周期变化']
  },

  // === 环节2：形成机制 ===
  {
    id: 'q11',
    type: 'single',
    difficulty: 'medium',
    chapter: '沃克环流',
    content: '正常情况下，沃克环流的气流方向是怎样的？',
    options: [
      { label: 'A', value: '近地面从西向东，高空从东向西', isCorrect: false },
      { label: 'B', value: '近地面从东向西，高空从西向东', isCorrect: true },
      { label: 'C', value: '近地面和高空都从东向西', isCorrect: false },
      { label: 'D', value: '近地面和高空都从西向东', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '正常的沃克环流中，近地面东南信风从东太平洋吹向西太平洋，高空则形成从西向东的回流，构成闭合环流。',
    relatedKnowledge: ['沃克环流结构', '信风', '大气环流']
  },
  {
    id: 'q12',
    type: 'single',
    difficulty: 'medium',
    chapter: '成因机制',
    content: '厄尔尼诺发生时，信风会发生什么变化？',
    options: [
      { label: 'A', value: '东南信风增强', isCorrect: false },
      { label: 'B', value: '东南信风减弱或逆转', isCorrect: true },
      { label: 'C', value: '信风方向不变，但风速增加', isCorrect: false },
      { label: 'D', value: '信风完全消失', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺发生时，东太平洋海水变暖导致气压梯度减小，东南信风减弱甚至转为西风，这是厄尔尼诺形成的关键机制。',
    relatedKnowledge: ['信风变化', '厄尔尼诺形成机制', '气压梯度']
  },
  {
    id: 'q13',
    type: 'single',
    difficulty: 'hard',
    chapter: '深层机制',
    content: '厄尔尼诺发生时，东太平洋深层海水上翻会发生什么变化？',
    options: [
      { label: 'A', value: '上翻增强，带来更多冷水', isCorrect: false },
      { label: 'B', value: '上翻减弱，表层海水变暖', isCorrect: true },
      { label: 'C', value: '上翻方向改变', isCorrect: false },
      { label: 'D', value: '没有变化', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '正常情况下，东太平洋有强劲的上升流将深层冷水带到表层。厄尔尼诺时信风减弱，上升流减弱，表层海水得不到冷水补充而变暖。',
    relatedKnowledge: ['上升流', '海水温度垂直分布', '厄尔尼诺机制']
  },
  {
    id: 'q14',
    type: 'single',
    difficulty: 'medium',
    chapter: '沃克环流异常',
    content: '厄尔尼诺发生时，沃克环流会发生什么变化？',
    options: [
      { label: 'A', value: '环流增强', isCorrect: false },
      { label: 'B', value: '环流减弱或逆转', isCorrect: true },
      { label: 'C', value: '环流方向不变', isCorrect: false },
      { label: 'D', value: '环流完全消失', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺发生时，东太平洋上升气流增强，西太平洋上升气流减弱，导致沃克环流整体减弱甚至逆转。',
    relatedKnowledge: ['沃克环流异常', '大气响应', '厄尔尼诺影响']
  },
  {
    id: 'q15',
    type: 'single',
    difficulty: 'medium',
    chapter: '拉尼娜机制',
    content: '拉尼娜发生时，信风会发生什么变化？',
    options: [
      { label: 'A', value: '东南信风减弱', isCorrect: false },
      { label: 'B', value: '东南信风增强', isCorrect: true },
      { label: 'C', value: '信风方向逆转', isCorrect: false },
      { label: 'D', value: '信风消失', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '拉尼娜发生时，东太平洋海水变冷导致气压梯度增大，东南信风异常增强，将更多暖水推向西太平洋。',
    relatedKnowledge: ['拉尼娜机制', '信风增强', '气压梯度']
  },
  {
    id: 'q16',
    type: 'single',
    difficulty: 'hard',
    chapter: '正反馈机制',
    content: '厄尔尼诺的正反馈机制是指什么？',
    options: [
      { label: 'A', value: '海水变暖导致信风增强', isCorrect: false },
      { label: 'B', value: '海水变暖导致信风减弱，进一步加剧变暖', isCorrect: true },
      { label: 'C', value: '信风增强导致海水变冷', isCorrect: false },
      { label: 'D', value: '气压变化与海水温度无关', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺的正反馈机制是：东太平洋海水变暖→气压梯度减小→信风减弱→暖水进一步向东回流→海水进一步变暖。',
    relatedKnowledge: ['正反馈', '厄尔尼诺发展', '大气海洋相互作用']
  },
  {
    id: 'q17',
    type: 'single',
    difficulty: 'medium',
    chapter: '西太平洋暖池',
    content: '西太平洋暖池是什么？',
    options: [
      { label: 'A', value: '西太平洋的一个温泉', isCorrect: false },
      { label: 'B', value: '西太平洋表层海水温度较高的区域', isCorrect: true },
      { label: 'C', value: '西太平洋的深海热泉', isCorrect: false },
      { label: 'D', value: '西太平洋的一个火山口', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '西太平洋暖池是指西太平洋表层海水温度常年较高的区域，是全球大气环流的重要热源，对ENSO现象有重要影响。',
    relatedKnowledge: ['西太平洋暖池', '热源', '大气环流']
  },
  {
    id: 'q18',
    type: 'multiple',
    difficulty: 'hard',
    chapter: '形成过程',
    content: '厄尔尼诺的形成过程包括哪些阶段？（多选）',
    options: [
      { label: 'A', value: '信风减弱', isCorrect: true },
      { label: 'B', value: '暖水向东回流', isCorrect: true },
      { label: 'C', value: '东太平洋海水降温', isCorrect: false },
      { label: 'D', value: '沃克环流减弱', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '厄尔尼诺的形成过程包括信风减弱、暖水向东回流、东太平洋海水升温、沃克环流减弱等阶段。',
    relatedKnowledge: ['厄尔尼诺形成', '过程阶段', '大气海洋相互作用']
  },
  {
    id: 'q19',
    type: 'single',
    difficulty: 'easy',
    chapter: '科里奥利力',
    content: '东南信风是由什么因素形成的？',
    options: [
      { label: 'A', value: '地球自转和气压梯度', isCorrect: true },
      { label: 'B', value: '海水温度差异', isCorrect: false },
      { label: 'C', value: '地形影响', isCorrect: false },
      { label: 'D', value: '人类活动', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '东南信风是由赤道附近的气压梯度和地球自转产生的科里奥利力共同作用形成的。',
    relatedKnowledge: ['信风形成', '科里奥利力', '气压梯度']
  },
  {
    id: 'q20',
    type: 'single',
    difficulty: 'hard',
    chapter: '温跃层',
    content: '厄尔尼诺发生时，温跃层会发生什么变化？',
    options: [
      { label: 'A', value: '温跃层加深', isCorrect: false },
      { label: 'B', value: '温跃层变浅', isCorrect: true },
      { label: 'C', value: '温跃层位置不变', isCorrect: false },
      { label: 'D', value: '温跃层消失', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺发生时，东太平洋暖水层增厚，导致温跃层变浅，深层冷水难以到达表层。',
    relatedKnowledge: ['温跃层', '海水分层', '厄尔尼诺影响']
  },

  // === 环节3：全球影响 ===
  {
    id: 'q21',
    type: 'multiple',
    difficulty: 'medium',
    chapter: '厄尔尼诺影响',
    content: '厄尔尼诺对全球气候的影响包括哪些？（多选）',
    options: [
      { label: 'A', value: '澳大利亚东部干旱', isCorrect: true },
      { label: 'B', value: '印度夏季风增强', isCorrect: false },
      { label: 'C', value: '秘鲁北部暴雨', isCorrect: true },
      { label: 'D', value: '美国西南部冬季降水增多', isCorrect: true }
    ],
    correctAnswer: ['A', 'C', 'D'],
    explanation: '厄尔尼诺导致澳大利亚东部干旱、秘鲁北部暴雨、美国西南部冬季降水增多。而印度夏季风通常会减弱，导致干旱。',
    relatedKnowledge: ['厄尔尼诺区域影响', '全球气候异常', '季风变化']
  },
  {
    id: 'q22',
    type: 'single',
    difficulty: 'medium',
    chapter: '拉尼娜影响',
    content: '拉尼娜发生时，下列哪个地区通常会经历更多降水？',
    options: [
      { label: 'A', value: '澳大利亚东部', isCorrect: true },
      { label: 'B', value: '秘鲁北部', isCorrect: false },
      { label: 'C', value: '印度', isCorrect: false },
      { label: 'D', value: '巴西东北部', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '拉尼娜期间，信风增强导致西太平洋暖池进一步发展，澳大利亚东部通常会经历更多降水，甚至引发洪水。',
    relatedKnowledge: ['拉尼娜区域影响', '西太平洋暖池', '降水分布']
  },
  {
    id: 'q23',
    type: 'single',
    difficulty: 'medium',
    chapter: '北美影响',
    content: '厄尔尼诺年，美国西南部冬季通常会出现什么情况？',
    options: [
      { label: 'A', value: '干旱', isCorrect: false },
      { label: 'B', value: '降水增多', isCorrect: true },
      { label: 'C', value: '气温下降', isCorrect: false },
      { label: 'D', value: '台风增多', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺年，美国西南部冬季降水通常会增多，容易引发暴雨和洪水。',
    relatedKnowledge: ['厄尔尼诺北美影响', '冬季降水', '区域气候']
  },
  {
    id: 'q24',
    type: 'single',
    difficulty: 'medium',
    chapter: '南美影响',
    content: '厄尔尼诺年，秘鲁北部通常会出现什么情况？',
    options: [
      { label: 'A', value: '干旱', isCorrect: false },
      { label: 'B', value: '暴雨洪水', isCorrect: true },
      { label: 'C', value: '气温下降', isCorrect: false },
      { label: 'D', value: '地震增多', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺年，秘鲁北部沿海地区通常会出现暴雨洪水，这是由于上升流减弱导致暖水聚集，对流活动增强。',
    relatedKnowledge: ['厄尔尼诺南美影响', '暴雨洪水', '对流活动']
  },
  {
    id: 'q25',
    type: 'single',
    difficulty: 'medium',
    chapter: '亚洲影响',
    content: '厄尔尼诺年，印度夏季风通常会怎样变化？',
    options: [
      { label: 'A', value: '增强', isCorrect: false },
      { label: 'B', value: '减弱', isCorrect: true },
      { label: 'C', value: '没有变化', isCorrect: false },
      { label: 'D', value: '方向逆转', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺年，印度夏季风通常会减弱，导致印度次大陆降水减少，容易引发干旱。',
    relatedKnowledge: ['厄尔尼诺亚洲影响', '印度季风', '降水变化']
  },
  {
    id: 'q26',
    type: 'multiple',
    difficulty: 'hard',
    chapter: '中国影响',
    content: '厄尔尼诺年，中国可能出现哪些气候异常？（多选）',
    options: [
      { label: 'A', value: '南方冬季偏暖', isCorrect: true },
      { label: 'B', value: '北方夏季高温', isCorrect: true },
      { label: 'C', value: '长江流域梅雨偏强', isCorrect: true },
      { label: 'D', value: '西北干旱减轻', isCorrect: false }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '厄尔尼诺年中国通常出现南方冬季偏暖、北方夏季高温、长江流域梅雨偏强等特征，而西北地区干旱通常会加重。',
    relatedKnowledge: ['厄尔尼诺对中国的影响', '东亚季风', '区域气候异常']
  },
  {
    id: 'q27',
    type: 'single',
    difficulty: 'medium',
    chapter: '非洲影响',
    content: '厄尔尼诺年，东非地区通常会出现什么情况？',
    options: [
      { label: 'A', value: '干旱', isCorrect: false },
      { label: 'B', value: '降水增多', isCorrect: true },
      { label: 'C', value: '气温下降', isCorrect: false },
      { label: 'D', value: '沙尘暴增多', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺年，东非地区通常会出现降水增多，而西非地区则容易出现干旱。',
    relatedKnowledge: ['厄尔尼诺非洲影响', '降水分布', '区域气候']
  },
  {
    id: 'q28',
    type: 'single',
    difficulty: 'medium',
    chapter: '飓风影响',
    content: '厄尔尼诺年，大西洋飓风活动通常会怎样？',
    options: [
      { label: 'A', value: '增加', isCorrect: false },
      { label: 'B', value: '减少', isCorrect: true },
      { label: 'C', value: '没有变化', isCorrect: false },
      { label: 'D', value: '强度增强', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺年，大西洋飓风活动通常会减少，而拉尼娜年则会增加。',
    relatedKnowledge: ['飓风活动', 'ENSO影响', '大西洋气候']
  },
  {
    id: 'q29',
    type: 'single',
    difficulty: 'easy',
    chapter: '渔业影响',
    content: '厄尔尼诺年，秘鲁渔场的渔业产量通常会怎样？',
    options: [
      { label: 'A', value: '增加', isCorrect: false },
      { label: 'B', value: '减少', isCorrect: true },
      { label: 'C', value: '没有变化', isCorrect: false },
      { label: 'D', value: '先增后减', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺年，上升流减弱导致营养物质减少，秘鲁渔场的渔业产量通常会大幅减少。',
    relatedKnowledge: ['渔业影响', '上升流', '营养物质']
  },
  {
    id: 'q30',
    type: 'multiple',
    difficulty: 'medium',
    chapter: '农业影响',
    content: '厄尔尼诺对农业的影响包括哪些？（多选）',
    options: [
      { label: 'A', value: '部分地区作物减产', isCorrect: true },
      { label: 'B', value: '病虫害增多', isCorrect: true },
      { label: 'C', value: '所有地区都增产', isCorrect: false },
      { label: 'D', value: '水资源管理困难', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '厄尔尼诺会导致部分地区干旱或洪涝，造成作物减产，同时温暖湿润的气候可能导致病虫害增多，给水资源管理带来困难。',
    relatedKnowledge: ['农业影响', '作物产量', '病虫害']
  },

  // === 环节4：读图分析 ===
  {
    id: 'q31',
    type: 'graph',
    difficulty: 'medium',
    chapter: '温度异常图',
    content: '观察右侧的太平洋海温异常图（读图分析1），判断当前处于什么状态？',
    graphPath: './picture/读图分析1.jpg',
    graphData: {
      type: 'temperature',
      title: '太平洋海表面温度异常分布',
      description: '图中红色区域表示温度高于常年平均值，蓝色区域表示温度低于常年平均值。东太平洋出现大范围红色区域。'
    },
    options: [
      { label: 'A', value: '厄尔尼诺状态', isCorrect: true },
      { label: 'B', value: '拉尼娜状态', isCorrect: false },
      { label: 'C', value: '中性状态', isCorrect: false },
      { label: 'D', value: '无法判断', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '图中东太平洋出现大范围温度正异常（红色区域），这是厄尔尼诺的典型特征。',
    relatedKnowledge: ['海温异常识别', '厄尔尼诺特征', '温度分布图解读']
  },
  {
    id: 'q32',
    type: 'graph',
    difficulty: 'hard',
    chapter: 'ONI指数图',
    content: '观察ONI指数变化图（读图分析2），判断哪一段时间处于拉尼娜状态？',
    graphPath: './picture/读图分析2.jpg',
    graphData: {
      type: 'temperature',
      title: 'ONI指数时间序列图',
      description: 'ONI指数是衡量厄尔尼诺/拉尼娜强度的关键指标。图中显示2020年11月至2021年5月指数持续低于-0.5。'
    },
    options: [
      { label: 'A', value: '2020年1月-6月', isCorrect: false },
      { label: 'B', value: '2020年11月-2021年5月', isCorrect: true },
      { label: 'C', value: '2021年6月-12月', isCorrect: false },
      { label: 'D', value: '2022年1月-6月', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'ONI指数持续低于-0.5℃并持续5个月以上即为拉尼娜状态。图中2020年11月至2021年5月符合这一标准。',
    relatedKnowledge: ['ONI指数', '拉尼娜判定标准', '时间序列分析']
  },
  {
    id: 'q33',
    type: 'graph',
    difficulty: 'medium',
    chapter: '大气环流图',
    content: '观察沃克环流示意图（读图分析3），判断哪幅图表示厄尔尼诺状态？',
    graphPath: './picture/读图分析3.jpg',
    graphData: {
      type: 'wind',
      title: '沃克环流示意图',
      description: '图A：东太平洋下沉，西太平洋上升；图B：东太平洋上升增强，西太平洋上升减弱，环流明显减弱。'
    },
    options: [
      { label: 'A', value: '图A', isCorrect: false },
      { label: 'B', value: '图B', isCorrect: true },
      { label: 'C', value: '两者都是', isCorrect: false },
      { label: 'D', value: '两者都不是', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺时，东太平洋海水变暖导致上升气流增强，西太平洋上升气流减弱，沃克环流整体减弱，图B符合这一特征。',
    relatedKnowledge: ['沃克环流异常', '厄尔尼诺大气响应', '环流示意图解读']
  },
  {
    id: 'q34',
    type: 'graph',
    difficulty: 'medium',
    chapter: '海温剖面图',
    content: '观察太平洋海温垂直剖面图，判断哪个区域显示了厄尔尼诺特征？',
    graphPath: './picture/读图分析4.jpg',
    graphData: {
      type: 'temperature',
      title: '太平洋海温垂直剖面',
      description: '图中显示东太平洋和西太平洋的水温垂直分布。东太平洋表层水温明显高于深层，温跃层较浅。'
    },
    options: [
      { label: 'A', value: '西太平洋', isCorrect: false },
      { label: 'B', value: '东太平洋', isCorrect: true },
      { label: 'C', value: '中太平洋', isCorrect: false },
      { label: 'D', value: '南太平洋', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺时，东太平洋表层水温升高，温跃层变浅，与图中东太平洋的特征相符。',
    relatedKnowledge: ['海温剖面', '温跃层', '厄尔尼诺特征']
  },
  {
    id: 'q35',
    type: 'graph',
    difficulty: 'hard',
    chapter: '气压分布图',
    content: '观察太平洋气压分布图（图A和图B），判断哪幅图表示拉尼娜状态？',
    graphPaths: ['./picture/读图分析5A.jpg', './picture/读图分析5B.jpg'],
    graphData: {
      type: 'pressure',
      title: '太平洋海平面气压分布',
      description: '图A：东太平洋高压减弱，西太平洋低压减弱；图B：东太平洋高压增强，西太平洋低压增强，气压梯度增大。'
    },
    options: [
      { label: 'A', value: '图A', isCorrect: false },
      { label: 'B', value: '图B', isCorrect: true },
      { label: 'C', value: '两者都是', isCorrect: false },
      { label: 'D', value: '两者都不是', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '拉尼娜时，东太平洋气压升高，西太平洋气压降低，气压梯度增大，导致信风增强，图B符合这一特征。',
    relatedKnowledge: ['气压分布', '拉尼娜特征', '信风形成']
  },
  {
    id: 'q36',
    type: 'graph',
    difficulty: 'medium',
    chapter: '洋流示意图',
    content: '观察太平洋洋流示意图，厄尔尼诺时赤道逆流会发生什么变化？',
    graphPath: './picture/读图分析6.jpg',
    graphData: {
      type: 'ocean',
      title: '太平洋表层洋流',
      description: '图中显示正常状态和厄尔尼诺状态的洋流方向。厄尔尼诺时，赤道逆流增强并向东流动。'
    },
    options: [
      { label: 'A', value: '减弱', isCorrect: false },
      { label: 'B', value: '增强并向东流动', isCorrect: true },
      { label: 'C', value: '方向不变', isCorrect: false },
      { label: 'D', value: '消失', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺时，信风减弱导致赤道逆流增强，暖水向东流动，这是厄尔尼诺的重要特征。',
    relatedKnowledge: ['赤道逆流', '洋流变化', '厄尔尼诺机制']
  },
  {
    id: 'q37',
    type: 'graph',
    difficulty: 'hard',
    chapter: '降水分布图',
    content: '观察全球降水异常分布图，厄尔尼诺年哪个地区降水会异常偏多？',
    graphPath: './picture/读图分析7.jpg',
    graphData: {
      type: 'temperature',
      title: '全球降水异常分布',
      description: '图中绿色区域表示降水偏多，棕色区域表示降水偏少。东太平洋和美国西南部为绿色，澳大利亚和印度为棕色。'
    },
    options: [
      { label: 'A', value: '澳大利亚东部', isCorrect: false },
      { label: 'B', value: '印度', isCorrect: false },
      { label: 'C', value: '秘鲁北部', isCorrect: true },
      { label: 'D', value: '巴西东北部', isCorrect: false }
    ],
    correctAnswer: 'C',
    explanation: '厄尔尼诺年，秘鲁北部地区降水异常偏多，容易引发暴雨洪水。',
    relatedKnowledge: ['降水异常', '厄尔尼诺影响', '区域气候']
  },
  {
    id: 'q38',
    type: 'graph',
    difficulty: 'medium',
    chapter: '风场图',
    content: '观察太平洋风场图，判断哪个季节最容易发生厄尔尼诺？',
    graphPath: './picture/读图分析8.jpg',
    graphData: {
      type: 'wind',
      title: '太平洋风场季节变化',
      description: '图中显示不同季节的信风强度。冬季信风最弱，夏季信风最强。'
    },
    options: [
      { label: 'A', value: '春季', isCorrect: false },
      { label: 'B', value: '夏季', isCorrect: false },
      { label: 'C', value: '秋季', isCorrect: false },
      { label: 'D', value: '冬季', isCorrect: true }
    ],
    correctAnswer: 'D',
    explanation: '冬季信风最弱，此时最容易发生信风减弱或逆转，从而触发厄尔尼诺事件。',
    relatedKnowledge: ['信风季节变化', '厄尔尼诺季节', '风场分析']
  },
  {
    id: 'q39',
    type: 'graph',
    difficulty: 'hard',
    chapter: '海平面高度图',
    content: '观察太平洋海平面高度异常图，厄尔尼诺时哪个区域海平面会上升？',
    graphPath: './picture/读图分析9.jpg',
    graphData: {
      type: 'ocean',
      title: '太平洋海平面高度异常',
      description: '图中红色区域表示海平面高于常年平均值，蓝色区域表示低于常年平均值。东太平洋为红色，西太平洋为蓝色。'
    },
    options: [
      { label: 'A', value: '西太平洋', isCorrect: false },
      { label: 'B', value: '东太平洋', isCorrect: true },
      { label: 'C', value: '北太平洋', isCorrect: false },
      { label: 'D', value: '南太平洋', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺时，暖水向东回流导致东太平洋海平面上升，西太平洋海平面下降。',
    relatedKnowledge: ['海平面变化', '厄尔尼诺特征', '海水分布']
  },
  {
    id: 'q40',
    type: 'graph',
    difficulty: 'medium',
    chapter: 'SST异常图',
    content: '观察海表面温度异常图，Nino 3.4区域位于哪里？',
    graphPath: './picture/读图分析10.jpg',
    graphData: {
      type: 'temperature',
      title: 'Nino区域划分',
      description: '图中标示了Nino 1+2、Nino 3、Nino 4和Nino 3.4区域。Nino 3.4位于东太平洋中部。'
    },
    options: [
      { label: 'A', value: '东太平洋东部', isCorrect: false },
      { label: 'B', value: '东太平洋中部', isCorrect: true },
      { label: 'C', value: '西太平洋', isCorrect: false },
      { label: 'D', value: '中太平洋', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'Nino 3.4区域位于5°N-5°S，170°W-120°W，即东太平洋中部，是监测ENSO的关键区域。',
    relatedKnowledge: ['Nino区域', 'ENSO监测', '区域划分']
  },

  // === 环节5：历史事件 ===
  {
    id: 'q41',
    type: 'multiple',
    difficulty: 'medium',
    chapter: '强厄尔尼诺事件',
    content: '以下哪些是强厄尔尼诺事件？（多选）',
    options: [
      { label: 'A', value: '1982-1983年', isCorrect: true },
      { label: 'B', value: '1997-1998年', isCorrect: true },
      { label: 'C', value: '2007-2008年', isCorrect: false },
      { label: 'D', value: '2015-2016年', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '1982-83、1997-98和2015-16年都是有记录以来最强的厄尔尼诺事件。2007-08年是拉尼娜事件。',
    relatedKnowledge: ['历史厄尔尼诺事件', '事件强度分类', 'ENSO历史记录']
  },
  {
    id: 'q42',
    type: 'single',
    difficulty: 'medium',
    chapter: '最强事件',
    content: '有记录以来最强的厄尔尼诺事件是哪一次？',
    options: [
      { label: 'A', value: '1982-1983年', isCorrect: false },
      { label: 'B', value: '1997-1998年', isCorrect: true },
      { label: 'C', value: '2015-2016年', isCorrect: false },
      { label: 'D', value: '1991-1992年', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '1997-1998年的厄尔尼诺事件是有记录以来最强的一次，造成了全球重大气候异常和经济损失。',
    relatedKnowledge: ['最强厄尔尼诺', '历史事件', '事件强度']
  },
  {
    id: 'q43',
    type: 'single',
    difficulty: 'easy',
    chapter: '拉尼娜事件',
    content: '以下哪次是拉尼娜事件？',
    options: [
      { label: 'A', value: '1997-1998年', isCorrect: false },
      { label: 'B', value: '2007-2008年', isCorrect: true },
      { label: 'C', value: '2015-2016年', isCorrect: false },
      { label: 'D', value: '2018-2019年', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '2007-2008年是一次中等强度的拉尼娜事件，紧随2006-2007年的厄尔尼诺事件之后。',
    relatedKnowledge: ['拉尼娜事件', '历史记录', 'ENSO交替']
  },
  {
    id: 'q44',
    type: 'single',
    difficulty: 'medium',
    chapter: '事件影响',
    content: '1997-1998年厄尔尼诺事件造成了哪些影响？',
    options: [
      { label: 'A', value: '全球经济损失超过300亿美元', isCorrect: true },
      { label: 'B', value: '全球气温下降0.5℃', isCorrect: false },
      { label: 'C', value: '所有地区降水都增多', isCorrect: false },
      { label: 'D', value: '没有造成明显影响', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '1997-1998年厄尔尼诺事件造成了全球重大气候异常，经济损失超过300亿美元，全球气温明显升高。',
    relatedKnowledge: ['事件影响', '经济损失', '全球气温']
  },
  {
    id: 'q45',
    type: 'multiple',
    difficulty: 'hard',
    chapter: '1982-83事件',
    content: '1982-1983年厄尔尼诺事件的特点包括哪些？（多选）',
    options: [
      { label: 'A', value: '发生时间较早（春季开始）', isCorrect: true },
      { label: 'B', value: '强度非常强', isCorrect: true },
      { label: 'C', value: '持续时间短', isCorrect: false },
      { label: 'D', value: '影响范围广', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '1982-1983年厄尔尼诺事件发生较早（春季开始），强度非常强，持续时间长，影响范围广。',
    relatedKnowledge: ['1982-83事件', '事件特点', '历史事件']
  },
  {
    id: 'q46',
    type: 'single',
    difficulty: 'medium',
    chapter: '2015-16事件',
    content: '2015-2016年厄尔尼诺事件对中国的影响是什么？',
    options: [
      { label: 'A', value: '全国普遍干旱', isCorrect: false },
      { label: 'B', value: '南方暴雨洪涝', isCorrect: true },
      { label: 'C', value: '北方暴雪', isCorrect: false },
      { label: 'D', value: '没有明显影响', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '2015-2016年厄尔尼诺事件导致中国南方出现暴雨洪涝，同时北方出现高温干旱。',
    relatedKnowledge: ['2015-16事件', '中国影响', '区域气候']
  },
  {
    id: 'q47',
    type: 'single',
    difficulty: 'easy',
    chapter: '事件周期',
    content: '厄尔尼诺事件通常发生在什么周期？',
    options: [
      { label: 'A', value: '每年都发生', isCorrect: false },
      { label: 'B', value: '每隔2-7年', isCorrect: true },
      { label: 'C', value: '每隔10年', isCorrect: false },
      { label: 'D', value: '没有固定周期', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺事件通常每隔2-7年发生一次，平均周期约为4年。',
    relatedKnowledge: ['ENSO周期', '事件频率', '气候振荡']
  },
  {
    id: 'q48',
    type: 'multiple',
    difficulty: 'medium',
    chapter: '事件预测',
    content: '预测厄尔尼诺事件的方法包括哪些？（多选）',
    options: [
      { label: 'A', value: '监测海温异常', isCorrect: true },
      { label: 'B', value: '分析大气环流', isCorrect: true },
      { label: 'C', value: '观察动物行为', isCorrect: false },
      { label: 'D', value: '数值模型预测', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '预测厄尔尼诺事件的方法包括监测海温异常、分析大气环流和使用数值模型预测等。',
    relatedKnowledge: ['ENSO预测', '监测方法', '数值模型']
  },
  {
    id: 'q49',
    type: 'single',
    difficulty: 'hard',
    chapter: '事件强度',
    content: '如何判断厄尔尼诺事件的强度？',
    options: [
      { label: 'A', value: '仅根据温度异常幅度', isCorrect: false },
      { label: 'B', value: '仅根据持续时间', isCorrect: false },
      { label: 'C', value: '综合温度异常幅度和持续时间', isCorrect: true },
      { label: 'D', value: '根据受灾程度', isCorrect: false }
    ],
    correctAnswer: 'C',
    explanation: '厄尔尼诺事件的强度是根据Nino区域海温异常的幅度和持续时间综合判断的，通常分为弱、中等、强和极强四个等级。',
    relatedKnowledge: ['事件强度', '判断标准', 'Nino指数']
  },
  {
    id: 'q50',
    type: 'single',
    difficulty: 'medium',
    chapter: '事件命名',
    content: '厄尔尼诺事件通常以什么命名？',
    options: [
      { label: 'A', value: '发生年份', isCorrect: true },
      { label: 'B', value: '发现者名字', isCorrect: false },
      { label: 'C', value: '影响地区', isCorrect: false },
      { label: 'D', value: '强度等级', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '厄尔尼诺事件通常以发生的年份命名，如1997-1998年厄尔尼诺、2015-2016年厄尔尼诺等。',
    relatedKnowledge: ['事件命名', '历史记录', 'ENSO事件']
  },

  // === 环节6：综合应用 ===
  {
    id: 'q51',
    type: 'single',
    difficulty: 'hard',
    chapter: 'ENSO循环',
    content: 'ENSO循环中，厄尔尼诺和拉尼娜之间通常会经历什么阶段？',
    options: [
      { label: 'A', value: '直接从厄尔尼诺转为拉尼娜', isCorrect: false },
      { label: 'B', value: '经过中性状态过渡', isCorrect: true },
      { label: 'C', value: '同时存在', isCorrect: false },
      { label: 'D', value: '没有固定模式', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'ENSO循环通常遵循"厄尔尼诺-中性-拉尼娜-中性"的模式，中性状态是两种极端状态之间的过渡阶段。',
    relatedKnowledge: ['ENSO循环', '中性状态', '气候振荡']
  },
  {
    id: 'q52',
    type: 'single',
    difficulty: 'medium',
    chapter: '预测与监测',
    content: 'NOAA监测厄尔尼诺/拉尼娜的关键指标是什么？',
    options: [
      { label: 'A', value: '全球平均气温', isCorrect: false },
      { label: 'B', value: 'ONI指数（Nino 3.4区海温异常）', isCorrect: true },
      { label: 'C', value: '北极冰盖面积', isCorrect: false },
      { label: 'D', value: '二氧化碳浓度', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'ONI（海洋尼诺指数）是NOAA用于监测ENSO状态的主要指标，基于Nino 3.4区域的海表温度异常计算。',
    relatedKnowledge: ['ONI指数', 'Nino区域', 'NOAA监测']
  },
  {
    id: 'q53',
    type: 'multiple',
    difficulty: 'hard',
    chapter: '综合分析',
    content: '当监测到Nino 3.4区域海温异常持续高于+0.5℃达5个月时，可以得出什么结论？（多选）',
    options: [
      { label: 'A', value: '厄尔尼诺事件正在发生', isCorrect: true },
      { label: 'B', value: '全球气候可能出现异常', isCorrect: true },
      { label: 'C', value: '拉尼娜事件即将发生', isCorrect: false },
      { label: 'D', value: '需要加强监测和预警', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '当Nino 3.4区域海温异常持续高于+0.5℃达5个月时，表明厄尔尼诺事件正在发生，全球气候可能出现异常，需要加强监测和预警。',
    relatedKnowledge: ['ENSO监测', '厄尔尼诺判定', '预警系统']
  },
  {
    id: 'q54',
    type: 'single',
    difficulty: 'medium',
    chapter: '实际应用',
    content: '厄尔尼诺预测对农业生产有什么帮助？',
    options: [
      { label: 'A', value: '没有实际意义', isCorrect: false },
      { label: 'B', value: '可以提前调整种植计划', isCorrect: true },
      { label: 'C', value: '只能预测天气，不能指导生产', isCorrect: false },
      { label: 'D', value: '会造成误导', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '厄尔尼诺预测可以帮助农民提前调整种植计划，选择适应异常气候的作物品种，减少灾害损失。',
    relatedKnowledge: ['农业应用', '气候预测', '灾害防范']
  },
  {
    id: 'q55',
    type: 'single',
    difficulty: 'hard',
    chapter: '气候联系',
    content: '厄尔尼诺与全球变暖之间是什么关系？',
    options: [
      { label: 'A', value: '厄尔尼诺导致全球变暖', isCorrect: false },
      { label: 'B', value: '全球变暖导致厄尔尼诺', isCorrect: false },
      { label: 'C', value: '两者相互影响，全球变暖可能改变ENSO特征', isCorrect: true },
      { label: 'D', value: '两者没有关系', isCorrect: false }
    ],
    correctAnswer: 'C',
    explanation: '厄尔尼诺和全球变暖是两个不同的气候现象，但它们相互影响。研究表明，全球变暖可能会改变ENSO事件的频率、强度和空间分布。',
    relatedKnowledge: ['全球变暖', 'ENSO变化', '气候相互作用']
  },
  {
    id: 'q56',
    type: 'multiple',
    difficulty: 'hard',
    chapter: '跨学科应用',
    content: 'ENSO研究涉及哪些学科领域？（多选）',
    options: [
      { label: 'A', value: '海洋学', isCorrect: true },
      { label: 'B', value: '大气科学', isCorrect: true },
      { label: 'C', value: '地理学', isCorrect: true },
      { label: 'D', value: '历史学', isCorrect: false }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: 'ENSO研究涉及海洋学、大气科学、地理学等多个学科领域，是一门综合性的气候科学。',
    relatedKnowledge: ['跨学科研究', '气候科学', '学科交叉']
  },
  {
    id: 'q57',
    type: 'single',
    difficulty: 'medium',
    chapter: '预警系统',
    content: '中国气象局发布ENSO预警的依据是什么？',
    options: [
      { label: 'A', value: '专家经验', isCorrect: false },
      { label: 'B', value: 'Nino区域海温异常和大气环流特征', isCorrect: true },
      { label: 'C', value: '历史事件统计', isCorrect: false },
      { label: 'D', value: '随机预测', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '中国气象局发布ENSO预警的依据是Nino区域海温异常、大气环流特征以及数值模式预测结果。',
    relatedKnowledge: ['预警系统', '监测指标', '预测方法']
  },
  {
    id: 'q58',
    type: 'single',
    difficulty: 'hard',
    chapter: '未来趋势',
    content: '未来气候变化可能会如何影响ENSO？',
    options: [
      { label: 'A', value: 'ENSO将消失', isCorrect: false },
      { label: 'B', value: 'ENSO事件可能变得更强、更频繁', isCorrect: true },
      { label: 'C', value: 'ENSO将变得更弱', isCorrect: false },
      { label: 'D', value: 'ENSO不会变化', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '研究表明，随着全球变暖，ENSO事件可能会变得更强、更频繁，极端事件的发生概率可能增加。',
    relatedKnowledge: ['未来趋势', '气候变化', 'ENSO预测']
  },
  {
    id: 'q59',
    type: 'multiple',
    difficulty: 'medium',
    chapter: '生活应用',
    content: '了解ENSO知识对日常生活有什么帮助？（多选）',
    options: [
      { label: 'A', value: '提前做好防灾准备', isCorrect: true },
      { label: 'B', value: '合理安排农业生产', isCorrect: true },
      { label: 'C', value: '预测股票市场', isCorrect: false },
      { label: 'D', value: '了解气候异常原因', isCorrect: true }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: '了解ENSO知识可以帮助人们提前做好防灾准备、合理安排农业生产、了解气候异常的原因，但不能预测股票市场。',
    relatedKnowledge: ['生活应用', '防灾减灾', '气候知识']
  },
  {
    id: 'q60',
    type: 'single',
    difficulty: 'easy',
    chapter: '学习意义',
    content: '学习ENSO知识的意义是什么？',
    options: [
      { label: 'A', value: '没有意义', isCorrect: false },
      { label: 'B', value: '了解全球气候系统，提高气候素养', isCorrect: true },
      { label: 'C', value: '只为应付考试', isCorrect: false },
      { label: 'D', value: '可以预测天气', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: '学习ENSO知识可以帮助我们了解全球气候系统的运作机制，提高气候素养，更好地应对气候变化带来的挑战。',
    relatedKnowledge: ['学习意义', '气候素养', '科学素养']
  }
];

export const learningStages = [
  {
    id: 'stage1',
    name: '基础概念',
    description: '学习厄尔尼诺和拉尼娜的基本定义、特征和判定标准',
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
    requiredScore: 80
  },
  {
    id: 'stage2',
    name: '形成机制',
    description: '深入理解沃克环流、信风变化和海气相互作用',
    questionIds: ['q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20'],
    requiredScore: 80
  },
  {
    id: 'stage3',
    name: '全球影响',
    description: '掌握厄尔尼诺和拉尼娜对各区域的气候影响',
    questionIds: ['q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q28', 'q29', 'q30'],
    requiredScore: 80
  },
  {
    id: 'stage4',
    name: '读图分析',
    description: '学会解读海温异常图、ONI指数图等专业图表',
    questionIds: ['q31', 'q32', 'q33', 'q34', 'q35', 'q36', 'q37', 'q38', 'q39', 'q40'],
    requiredScore: 80
  },
  {
    id: 'stage5',
    name: '历史事件',
    description: '了解重大ENSO事件的历史和影响',
    questionIds: ['q41', 'q42', 'q43', 'q44', 'q45', 'q46', 'q47', 'q48', 'q49', 'q50'],
    requiredScore: 80
  },
  {
    id: 'stage6',
    name: '综合应用',
    description: '综合运用所学知识分析实际问题和未来趋势',
    questionIds: ['q51', 'q52', 'q53', 'q54', 'q55', 'q56', 'q57', 'q58', 'q59', 'q60'],
    requiredScore: 80
  }
];

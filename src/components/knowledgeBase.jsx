const COURSE_PAINS = {
  '太阳辐射': {
    concept: '太阳辐射',
    module: '必修一 第二章',
    commonMistakes: ['混淆太阳辐射与太阳活动的概念', '不理解大气削弱作用机制'],
    difficulty: 'medium'
  },
  '热力环流': {
    concept: '热力环流',
    module: '必修一 第二章',
    commonMistakes: ['不理解冷热不均导致气压差异', '混淆高压低压与温度关系'],
    difficulty: 'hard'
  },
  '水循环': {
    concept: '水循环',
    module: '必修一 第三章',
    commonMistakes: ['混淆水循环各环节', '不理解人类活动影响'],
    difficulty: 'medium'
  },
  '洋流': {
    concept: '洋流',
    module: '必修一 第三章',
    commonMistakes: ['记不住主要洋流名称', '混淆寒流暖流性质'],
    difficulty: 'hard'
  }
}

const KNOWLEDGE_GRAPH = {
  '太阳辐射': { relations: ['大气热力作用', '水循环'], chapter: '必修一 第二章' },
  '热力环流': { relations: ['气压带', '风带', '季风'], chapter: '必修一 第二章' },
  '水循环': { relations: ['洋流', '地表径流'], chapter: '必修一 第三章' },
  '洋流': { relations: ['气候', '渔场'], chapter: '必修一 第三章' }
}

const EXPERIMENT_MAPPING = {
  'required-02': { title: '太阳对地球的影响', concepts: ['太阳辐射'] },
  'required-06': { title: '大气能量收支与热力环流', concepts: ['热力环流'] },
  'required-07': { title: '水循环过程与水量平衡', concepts: ['水循环'] },
  'required-09': { title: '洋流分布与海浪潮汐', concepts: ['洋流'] }
}

const EXAM_QUESTIONS = {
  '太阳辐射': [{ year: 2024, region: '全国甲卷', type: '综合题', difficulty: 'medium', question: '说明太阳辐射对我国西北地区农业发展的影响。' }],
  '热力环流': [{ year: 2024, region: '江苏卷', type: '综合题', difficulty: 'hard', question: '绘制海陆间热力环流示意图。' }],
  '水循环': [{ year: 2024, region: '全国乙卷', type: '综合题', difficulty: 'medium', question: '说明人类活动对水循环各环节的影响。' }]
}

const TEACHING_OBJECTIVES = {
  '太阳辐射分布与太阳活动效应': {
    module: '必修一 实验 2',
    objectives: [
      {
        level: '记忆',
        items: ['太阳辐射的概念与组成', '太阳活动的类型（黑子、耀斑、日珥）', '太阳常数的基本数值']
      },
      {
        level: '理解',
        items: ['太阳辐射的纬度分布规律', '太阳活动对地球磁场的影响机制', '太阳活动周期的形成原理']
      },
      {
        level: '应用',
        items: ['解释太阳辐射对农业生产的影响', '分析太阳活动对无线电通信的干扰', '说明太阳活动与极光现象的关系']
      },
      {
        level: '分析',
        items: ['对比不同纬度地区太阳辐射强度差异', '探究太阳活动对气候变化的影响', '分析太阳活动预报的实际意义']
      }
    ],
    coreCompetencies: ['区域认知', '综合思维', '地理实践力'],
    keyPoints: ['太阳辐射的时空分布规律', '太阳活动的周期性变化', '太阳活动对人类活动的影响']
  }
}

const LOCAL_KNOWLEDGE = [
  {
    title: '太阳辐射与太阳活动',
    book: '必修一',
    chapter: '第二章',
    keywords: ['太阳辐射', '太阳高度', '太阳活动', '太阳黑子', '耀斑', '光照', '纬度', '大气削弱'],
    core: '太阳辐射是地表能量的主要来源。到达地面的太阳辐射受太阳高度、昼长、天气和地形等因素影响；太阳活动则会影响地球磁场、电离层和高层大气。',
    mistakes: COURSE_PAINS['太阳辐射'].commonMistakes,
  },
  {
    title: '热力环流与大气运动',
    book: '必修一',
    chapter: '第二章',
    keywords: ['热力环流', '海陆风', '山谷风', '季风', '气压带', '风带', '冷热不均', '气压差异', '大气运动'],
    core: '地面冷热不均使近地面空气产生垂直运动，并造成同一水平面的气压差异；水平气压梯度力促使空气由高压流向低压，形成热力环流。海陆风和山谷风是局地环流的例子。',
    mistakes: COURSE_PAINS['热力环流'].commonMistakes,
  },
  {
    title: '水循环与水量平衡',
    book: '必修一',
    chapter: '第三章',
    keywords: ['水循环', '水量平衡', '蒸发', '降水', '地表径流', '地下径流', '水汽输送', '河流', '径流'],
    core: '水循环通过蒸发（蒸腾）、水汽输送、降水、下渗和径流等环节联系海洋、陆地和大气。人类活动会改变下垫面和径流过程，但水量平衡分析必须明确区域、时段及水量收支边界。',
    mistakes: COURSE_PAINS['水循环'].commonMistakes,
  },
  {
    title: '洋流与海气相互作用',
    book: '必修一 / 选修一',
    chapter: '海洋运动与气候',
    keywords: ['洋流', '寒流', '暖流', '渔场', '沿岸气候', '厄尔尼诺', '拉尼娜', '海水温度', '沃克环流'],
    core: '洋流会输送热量并影响沿岸气候、海洋生物分布和航运。厄尔尼诺与拉尼娜是热带太平洋海气耦合系统的异常状态，分析时要结合海温、信风、上升流和沃克环流的变化。',
    mistakes: COURSE_PAINS['洋流'].commonMistakes,
  },
]

export function findCoursePain(concept) {
  return COURSE_PAINS[concept] || null
}

export function findRelatedKnowledge(concept) {
  return KNOWLEDGE_GRAPH[concept] || null
}

export function findRelatedExamQuestions(concept) {
  return EXAM_QUESTIONS[concept] || []
}

export function findRelatedExperiments(concept) {
  const results = []
  for (const id in EXPERIMENT_MAPPING) {
    const exp = EXPERIMENT_MAPPING[id]
    if (exp.concepts.includes(concept)) {
      results.push({ id, title: exp.title, relatedConcepts: exp.concepts })
    }
  }
  return results
}

export function findTeachingObjectives(moduleName) {
  return TEACHING_OBJECTIVES[moduleName] || null
}

export function searchKnowledge(query) {
  const normalizedQuery = String(query || '').toLocaleLowerCase()
  if (!normalizedQuery.trim()) return []

  return LOCAL_KNOWLEDGE
    .map((entry) => {
      const matchedKeywords = entry.keywords.filter((keyword) => normalizedQuery.includes(keyword.toLocaleLowerCase()))
      return { ...entry, matchedKeywords, score: matchedKeywords.reduce((score, keyword) => score + keyword.length, 0) }
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
}

export function getKnowledgeSummary(topic) {
  const results = searchKnowledge(topic)
  return {
    topic,
    summary: results.map((entry) => `${entry.title}：${entry.core}`).join('\n\n') || '本地知识库暂未匹配到相关内容。',
    results,
  }
}

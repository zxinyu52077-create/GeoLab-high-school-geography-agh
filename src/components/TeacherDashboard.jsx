import { useState } from 'react'

function TeacherDashboard({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview')

  const menuItems = [
    { id: 'overview', label: '教学概览', icon: '📊' },
    { id: 'videos', label: '教学视频', icon: '🎬' },
    { id: 'lessonplans', label: '教案管理', icon: '📚' },
    { id: 'analytics', label: '学情分析', icon: '📈' },
    { id: 'schedule', label: '教学安排', icon: '📅' },
    { id: 'quizzes', label: '作业测验', icon: '✏️' },
    { id: 'discussions', label: '讨论区', icon: '💬' },
    { id: 'grades', label: '成绩管理', icon: '📝' },
    { id: 'resources', label: '资源库', icon: '🗂️' },
  ]

  const navigateTo = (tabId) => {
    setActiveTab(tabId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel currentUser={currentUser} onNavigate={navigateTo} />
      case 'videos':
        return <VideoManager />
      case 'lessonplans':
        return <LessonPlanManager />
      case 'analytics':
        return <AnalyticsPanel currentUser={currentUser} />
      case 'schedule':
        return <ScheduleManager />
      case 'quizzes':
        return <QuizManager />
      case 'discussions':
        return <DiscussionManager />
      case 'grades':
        return <GradeManager currentUser={currentUser} />
      case 'resources':
        return <ResourceLibrary />
      default:
        return <OverviewPanel currentUser={currentUser} onNavigate={navigateTo} />
    }
  }

  return (
    <div className="teacher-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>教师工作台</h2>
          <div className="user-info">
            <span className="user-icon">👨‍🏫</span>
            <span className="user-name">{currentUser.name}</span>
            <span className="user-class">{currentUser.class_name}</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      
      <main className="dashboard-content">
        <header className="dashboard-topbar">
          <button className="back-btn" onClick={() => onNavigate('textbook')}>
            ← 返回教材选择
          </button>
        </header>
        <div className="dashboard-data-notice" role="note">
          <strong>演示数据</strong>：教师工作台目前展示预置样例，视频、教案、作业和统计修改尚未连接本地数据库。
        </div>
        {renderContent()}
      </main>
    </div>
  )
}

function OverviewPanel({ currentUser, onNavigate }) {
  const stats = {
    totalStudents: 45,
    completedExperiments: 128,
    avgScore: 85.5,
    pendingQuizzes: 3,
  }

  return (
    <div className="overview-panel">
      <header className="panel-header">
        <h1>教学概览</h1>
        <p>欢迎回来，{currentUser.name}老师</p>
      </header>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">学生总数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completedExperiments}</div>
            <div className="stat-label">已完成实验</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.avgScore}</div>
            <div className="stat-label">平均成绩</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingQuizzes}</div>
            <div className="stat-label">待批改作业</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>快捷操作</h3>
        <div className="action-grid">
          <button className="action-btn" onClick={() => onNavigate('quizzes')}>📝 发布作业</button>
          <button className="action-btn" onClick={() => onNavigate('analytics')}>📈 查看学情</button>
          <button className="action-btn" onClick={() => onNavigate('schedule')}>📅 安排课程</button>
          <button className="action-btn" onClick={() => onNavigate('resources')}>📁 上传资源</button>
        </div>
      </div>
    </div>
  )
}

function VideoManager() {
  const [videos, setVideos] = useState([
    { id: 1, title: '大气环流原理详解', tags: '必修一,大气,环流', course: '必修一', is_public: 1, created_at: '2024-01-15' },
    { id: 2, title: '板块构造学说与地震形成', tags: '选修一,地质,板块', course: '选修一', is_public: 0, created_at: '2024-01-10' },
    { id: 3, title: '气候类型判读方法', tags: '必修一,气候,判断', course: '必修一', is_public: 1, created_at: '2024-01-08' },
    { id: 4, title: '等高线地形图判读', tags: '必修一,地形,地图', course: '必修一', is_public: 1, created_at: '2024-01-05' },
    { id: 5, title: '洋流分布模式及影响', tags: '必修一,海洋,洋流', course: '必修一', is_public: 0, created_at: '2024-01-03' },
    { id: 6, title: '地球自转与公转', tags: '必修一,地球,运动', course: '必修一', is_public: 1, created_at: '2024-01-01' },
    { id: 7, title: '锋面系统与天气', tags: '必修一,天气,锋面', course: '必修一', is_public: 1, created_at: '2023-12-28' },
    { id: 8, title: '水资源合理利用', tags: '必修二,资源,利用', course: '必修二', is_public: 0, created_at: '2023-12-25' },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setIsUploading(true)
        setTimeout(() => {
          const newVideo = {
            id: Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            tags: '未分类',
            course: '必修一',
            is_public: 0,
            created_at: new Date().toISOString().split('T')[0],
          }
          setVideos([newVideo, ...videos])
          setIsUploading(false)
        }, 1500)
      }
    }
    input.click()
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这个视频吗？')) {
      setVideos(videos.filter(v => v.id !== id))
    }
  }

  const handleTogglePublic = (id) => {
    setVideos(videos.map(v => 
      v.id === id ? { ...v, is_public: v.is_public ? 0 : 1 } : v
    ))
  }

  return (
    <div className="video-manager">
      <header className="panel-header">
        <h1>教学视频管理</h1>
        <button className="upload-btn" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? '上传中...' : '+ 上传视频'}
        </button>
      </header>
      
      <div className="video-list">
        {videos.length === 0 ? (
          <div className="empty-state">暂无视频，请点击上方按钮上传</div>
        ) : videos.map((video) => (
          <div key={video.id} className="video-item">
            <div className="video-icon">🎬</div>
            <div className="video-info">
              <h4>{video.title}</h4>
              <p className="video-meta">
                <span>课程: {video.course}</span>
                <span>标签: {video.tags}</span>
                <span>{video.created_at}</span>
              </p>
            </div>
            <div className="video-actions">
              <span className={`public-badge ${video.is_public ? 'public' : 'private'}`} onClick={() => handleTogglePublic(video.id)} style={{cursor: 'pointer'}}>
                {video.is_public ? '公开' : '私有'}
              </span>
              <button className="action-icon" onClick={() => handleDelete(video.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LessonPlanManager() {
  const [plans, setPlans] = useState([
    { id: 1, title: '大气运动', category: '课件', description: '讲解大气运动基本原理，包括热力环流、三圈环流', created_at: '2024-01-12', content: `# 大气运动教学教案

## 一、教学目标
1. 理解大气运动的基本原理
2. 掌握热力环流的形成过程
3. 理解三圈环流的形成机制

## 二、教学重点
1. 热力环流的形成原理
2. 三圈环流的模式

## 三、教学过程

### （一）导入（5分钟）
通过展示城市热岛效应图片，引导学生思考为什么城市气温高于郊区。

### （二）热力环流（20分钟）
1. 概念讲解：由于地面冷热不均而形成的空气环流
2. 形成过程：
   - 地面受热不均
   - 空气垂直运动
   - 同一水平面气压差异
   - 空气水平运动

### （三）三圈环流（25分钟）
1. 假设条件：地球不自转、地表均匀
2. 单圈环流模式
3. 考虑地球自转：三圈环流形成

## 四、课堂练习
1. 画出热力环流示意图
2. 分析海陆风的形成原因

## 五、课后作业
完成课本P35页练习题` },
    { id: 2, title: '气候类型分析', category: '教案', description: '气候类型判读方法，结合实例分析', created_at: '2024-01-08', content: `# 气候类型分析教学教案

## 一、教学目标
1. 掌握世界主要气候类型的分布规律
2. 学会根据气温降水图判断气候类型
3. 理解气候类型的成因

## 二、教学重点
1. 气候类型的分布规律
2. 气候类型判读方法

## 三、教学过程

### （一）复习导入（5分钟）
回顾气压带风带的分布规律

### （二）气候类型分布（15分钟）
1. 热带气候类型分布
2. 亚热带气候类型分布
3. 温带气候类型分布

### （三）气候类型判读（25分钟）
1. 以温定带：根据最冷月气温判断
2. 以水定型：根据降水特点判断
3. 实例分析：给出气温降水图让学生判断

### （四）气候成因分析（15分钟）
1. 太阳辐射
2. 大气环流
3. 下垫面因素

## 四、课堂小结
总结气候类型判读的三步法

## 五、课后作业
完成练习册相关习题` },
    { id: 3, title: '等高线地形图教学', category: '课件', description: '等高线地形图的判读技巧，包括山脊、山谷、陡崖等', created_at: '2024-01-05', content: `# 等高线地形图教学教案

## 一、教学目标
1. 理解等高线的概念
2. 掌握等高线地形图的判读方法
3. 能够识别山脊、山谷、陡崖等地形部位

## 二、教学重点
1. 等高线地形图的判读
2. 地形部位的识别

## 三、教学过程

### （一）概念讲解（10分钟）
1. 等高线定义
2. 等高距概念

### （二）地形部位识别（25分钟）
1. 山顶与盆地
2. 山脊与山谷
3. 陡崖
4. 鞍部

### （三）等高线地形图判读（20分钟）
1. 海拔高度判断
2. 坡度陡缓判断
3. 地形剖面图绘制

## 四、课堂练习
给出等高线地形图，让学生识别地形部位

## 五、课后作业
绘制校园地形剖面图` },
    { id: 4, title: '洋流对地理环境的影响', category: '教案', description: '洋流分布模式及其对气候、渔业的影响', created_at: '2024-01-03', content: `# 洋流对地理环境的影响

## 一、教学目标
1. 理解洋流的分类
2. 掌握世界洋流分布规律
3. 理解洋流对地理环境的影响

## 二、教学重点
1. 世界洋流分布模式
2. 洋流对气候和渔业的影响

## 三、教学过程

### （一）洋流分类（10分钟）
1. 按性质分：暖流和寒流
2. 按成因分：风海流、密度流、补偿流

### （二）世界洋流分布（20分钟）
1. 洋流分布模式图
2. 各大洋洋流分布特点

### （三）洋流对地理环境的影响（25分钟）
1. 对气候的影响
2. 对海洋生物的影响
3. 对航海的影响
4. 对海洋污染的影响

## 四、案例分析
1. 北大西洋暖流对西欧气候的影响
2. 秘鲁渔场的形成原因

## 五、课后作业
分析日本暖流对日本气候的影响` },
    { id: 5, title: '地球公转与四季变化', category: 'PPT', description: '地球公转的地理意义，黄赤交角的影响', created_at: '2023-12-28', content: `# 地球公转与四季变化

## 一、教学目标
1. 理解地球公转的特点
2. 掌握黄赤交角的概念
3. 理解四季变化的原因

## 二、教学重点
1. 黄赤交角的影响
2. 四季变化的成因

## 三、教学过程

### （一）地球公转特点（10分钟）
1. 公转轨道
2. 公转方向
3. 公转周期

### （二）黄赤交角（15分钟）
1. 概念讲解
2. 黄赤交角的影响

### （三）太阳直射点的移动（15分钟）
1. 二分二至日位置
2. 太阳直射点移动规律

### （四）四季变化（15分钟）
1. 四季形成原因
2. 四季划分

## 四、课堂练习
绘制太阳直射点移动轨迹图

## 五、课后作业
分析当地季节变化特点` },
    { id: 6, title: '自然灾害防治', category: '课件', description: '常见自然灾害的成因、危害及防治措施', created_at: '2023-12-25', content: `# 自然灾害防治

## 一、教学目标
1. 了解常见自然灾害类型
2. 理解自然灾害的成因
3. 掌握自然灾害的防治措施

## 二、教学重点
1. 自然灾害的成因分析
2. 防灾减灾措施

## 三、教学过程

### （一）自然灾害概述（5分钟）
1. 自然灾害定义
2. 自然灾害分类

### （二）气象灾害（20分钟）
1. 洪涝灾害
2. 干旱灾害
3. 台风灾害

### （三）地质灾害（20分钟）
1. 地震
2. 滑坡和泥石流

### （四）防灾减灾措施（10分钟）
1. 监测预警系统
2. 工程措施
3. 非工程措施

## 四、案例分析
1. 汶川地震案例分析
2. 长江洪涝灾害治理

## 五、课后作业
调查本地常见自然灾害及防治措施` },
    { id: 7, title: '区域地理复习', category: 'Word', description: '中国区域地理知识点总结与练习题', created_at: '2023-12-20', content: `# 中国区域地理复习资料

## 一、北方地区

### （一）地理位置
大兴安岭、青藏高原以东，内蒙古高原以南，秦岭-淮河以北

### （二）自然特征
1. 地形：平原为主
2. 气候：温带季风气候
3. 河流：黄河、海河、辽河

### （三）农业生产
1. 耕地类型：旱地
2. 主要农作物：小麦、玉米、大豆

### （四）工业基地
1. 辽中南工业基地
2. 京津唐工业基地

## 二、南方地区

### （一）地理位置
秦岭-淮河以南，青藏高原以东

### （二）自然特征
1. 地形：丘陵、山地为主
2. 气候：亚热带季风气候
3. 河流：长江、珠江

### （三）农业生产
1. 耕地类型：水田
2. 主要农作物：水稻、油菜、甘蔗

## 三、练习题
1. 分析北方地区农业发展的有利条件
2. 比较南方和北方的气候差异` },
    { id: 8, title: '农业区位因素分析', category: '教案', description: '农业区位选择的主要因素及案例分析', created_at: '2023-12-18', content: `# 农业区位因素分析

## 一、教学目标
1. 理解农业区位因素的概念
2. 掌握主要农业区位因素
3. 学会分析农业区位选择

## 二、教学重点
1. 自然因素对农业的影响
2. 社会经济因素对农业的影响

## 三、教学过程

### （一）农业区位因素概念（5分钟）
1. 区位的含义
2. 农业区位因素的分类

### （二）自然因素（15分钟）
1. 气候
2. 地形
3. 土壤
4. 水源

### （三）社会经济因素（20分钟）
1. 市场
2. 交通
3. 政策
4. 科技

### （四）案例分析（15分钟）
1. 季风水田农业区位分析
2. 商品谷物农业区位分析

## 四、课堂活动
分组讨论本地农业区位因素

## 五、课后作业
分析家乡农业生产的区位条件` },
  ])

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const ext = file.name.split('.').pop().toLowerCase()
        let category = '其他'
        if (['pdf'].includes(ext)) category = 'PDF'
        else if (['doc', 'docx'].includes(ext)) category = 'Word'
        else if (['ppt', 'pptx'].includes(ext)) category = 'PPT'
        
        const newPlan = {
          id: Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: category,
          description: '用户上传的教学资源',
          content: `# ${file.name.replace(/\.[^/.]+$/, '')}\n\n暂无详细内容，请上传完整文件查看。`,
          created_at: new Date().toISOString().split('T')[0],
        }
        setPlans([newPlan, ...plans])
      }
    }
    input.click()
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这个教案吗？')) {
      setPlans(plans.filter(p => p.id !== id))
    }
  }

  const handleView = (plan) => {
    setSelectedPlan(plan)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPlan(null)
  }

  const renderMarkdown = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h3 key={index} className="modal-content-h3">{line.slice(3)}</h3>
      } else if (line.startsWith('# ')) {
        return <h2 key={index} className="modal-content-h2">{line.slice(2)}</h2>
      } else if (line.startsWith('### ')) {
        return <h4 key={index} className="modal-content-h4">{line.slice(4)}</h4>
      } else if (line.startsWith('- ')) {
        return <li key={index} className="modal-content-li">{line.slice(2)}</li>
      } else if (line.trim()) {
        return <p key={index} className="modal-content-p">{line}</p>
      }
      return <br key={index} />
    })
  }

  return (
    <div className="lessonplan-manager">
      <header className="panel-header">
        <h1>教案管理</h1>
        <button className="upload-btn" onClick={handleUpload}>
          + 上传教案
        </button>
      </header>
      
      <div className="plan-list">
        {plans.length === 0 ? (
          <div className="empty-state">暂无教案，请点击上方按钮上传</div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="plan-item">
            <div className="plan-icon">📄</div>
            <div className="plan-info">
              <h4>{plan.title}</h4>
              <p>{plan.description}</p>
              <p className="plan-meta">
                <span className="category-tag">{plan.category}</span>
                <span>{plan.created_at}</span>
              </p>
            </div>
            <div className="plan-actions">
              <button className="view-btn" onClick={() => handleView(plan)}>👁️ 查看</button>
              <button className="action-icon" onClick={() => handleDelete(plan.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPlan.title}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span className="category-tag">{selectedPlan.category}</span>
                <span>{selectedPlan.created_at}</span>
              </div>
              <div className="modal-content-body">
                {renderMarkdown(selectedPlan.content)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsPanel({ currentUser }) {
  const [selectedClass, setSelectedClass] = useState(currentUser.class_name)
  const [classStats] = useState({
    total_students: 45,
    total_experiments: 180,
    completed_experiments: 128,
    completion_rate: 71.1,
    avg_score: 85.5,
    avg_duration: 45,
  })

  const [students] = useState([
    { id: 1, name: '张同学', completed: 8, total: 10, score: 92, status: '优秀' },
    { id: 2, name: '李同学', completed: 7, total: 10, score: 85, status: '良好' },
    { id: 3, name: '薛同学', completed: 10, total: 10, score: 95, status: '优秀' },
    { id: 4, name: '王同学', completed: 6, total: 10, score: 78, status: '中等' },
    { id: 5, name: '赵同学', completed: 9, total: 10, score: 90, status: '优秀' },
    { id: 6, name: '刘同学', completed: 5, total: 10, score: 72, status: '需关注' },
    { id: 7, name: '陈同学', completed: 8, total: 10, score: 88, status: '良好' },
    { id: 8, name: '杨同学', completed: 10, total: 10, score: 96, status: '优秀' },
    { id: 9, name: '周同学', completed: 7, total: 10, score: 80, status: '良好' },
    { id: 10, name: '吴同学', completed: 4, total: 10, score: 65, status: '需关注' },
  ])

  return (
    <div className="analytics-panel">
      <header className="panel-header">
        <h1>学情分析</h1>
        <select 
          className="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="高一(1)班">高一(1)班</option>
          <option value="高一(2)班">高一(2)班</option>
          <option value="高一(3)班">高一(3)班</option>
        </select>
      </header>

      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-value">{classStats.total_students}</div>
          <div className="summary-label">班级人数</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{classStats.completion_rate}%</div>
          <div className="summary-label">实验完成率</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{classStats.avg_score}</div>
          <div className="summary-label">平均成绩</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{classStats.avg_duration}分钟</div>
          <div className="summary-label">平均时长</div>
        </div>
      </div>

      <div className="students-section">
        <h3>学生学习情况</h3>
        <table className="students-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>完成数/总数</th>
              <th>完成率</th>
              <th>平均成绩</th>
              <th>学习状态</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.completed}/{student.total}</td>
                <td>{((student.completed / student.total) * 100).toFixed(0)}%</td>
                <td>{student.score}</td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td><button className="detail-btn">查看</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScheduleManager() {
  const [viewMode, setViewMode] = useState('calendar')
  const [schedules, setSchedules] = useState([
    { id: 1, title: '大气运动实验', type: 'experiment', date: '2024-01-20', time: '09:00', class_name: '高一(1)班' },
    { id: 2, title: '期中考试', type: 'exam', date: '2024-01-22', time: '14:00', class_name: '高一(1)班' },
    { id: 3, title: '气候类型判读作业', type: 'homework', date: '2024-01-21', deadline: '23:59', class_name: '高一(1)班' },
    { id: 4, title: '地球公转课程', type: 'course', date: '2024-01-23', time: '10:00', class_name: '高一(1)班' },
    { id: 5, title: '等高线地形图实验', type: 'experiment', date: '2024-01-24', time: '14:00', class_name: '高一(2)班' },
    { id: 6, title: '洋流分布复习', type: 'course', date: '2024-01-25', time: '09:00', class_name: '高一(1)班' },
    { id: 7, title: '单元测验', type: 'exam', date: '2024-01-26', time: '15:00', class_name: '高一(2)班' },
    { id: 8, title: '锋面系统作业', type: 'homework', date: '2024-01-27', deadline: '23:59', class_name: '高一(1)班' },
    { id: 9, title: '自然灾害防治课程', type: 'course', date: '2024-01-28', time: '14:00', class_name: '高一(2)班' },
    { id: 10, title: '区域地理实验', type: 'experiment', date: '2024-01-29', time: '09:00', class_name: '高一(1)班' },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    type: 'course',
    date: '',
    time: '',
    class_name: '高一(1)班'
  })

  const typeLabels = {
    course: '课程',
    experiment: '实验',
    exam: '考试',
    homework: '作业',
  }

  const typeColors = {
    course: '#4CAF50',
    experiment: '#2196F3',
    exam: '#F44336',
    homework: '#FF9800',
  }

  const handleAdd = () => {
    if (!newSchedule.title.trim() || !newSchedule.date) {
      alert('请输入标题和日期')
      return
    }
    const schedule = {
      id: Date.now(),
      ...newSchedule,
    }
    setSchedules([...schedules, schedule].sort((a, b) => a.date.localeCompare(b.date)))
    setNewSchedule({ title: '', type: 'course', date: '', time: '', class_name: '高一(1)班' })
    setShowAddModal(false)
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这个安排吗？')) {
      setSchedules(schedules.filter(s => s.id !== id))
    }
  }

  return (
    <div className="schedule-manager">
      <header className="panel-header">
        <h1>教学安排</h1>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 日历
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 列表
          </button>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            + 添加
          </button>
        </div>
      </header>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>添加教学安排</h3>
            <div className="form-group">
              <label>标题</label>
              <input 
                type="text" 
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                placeholder="请输入安排标题"
              />
            </div>
            <div className="form-group">
              <label>类型</label>
              <select 
                value={newSchedule.type}
                onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value})}
              >
                <option value="course">课程</option>
                <option value="experiment">实验</option>
                <option value="exam">考试</option>
                <option value="homework">作业</option>
              </select>
            </div>
            <div className="form-group">
              <label>日期</label>
              <input 
                type="date" 
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>时间</label>
              <input 
                type="time" 
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="confirm-btn" onClick={handleAdd}>添加</button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="nav-btn">←</button>
            <span className="month-label">2024年1月</span>
            <button className="nav-btn">→</button>
          </div>
          <div className="calendar-grid">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 4
              const hasEvent = schedules.some(s => s.date === `2024-01-${String(dayNum).padStart(2, '0')}`)
              return (
                <div key={i} className={`calendar-day ${dayNum > 0 && dayNum <= 31 ? '' : 'empty'}`}>
                  {dayNum > 0 && dayNum <= 31 && (
                    <>
                      <span className="day-num">{dayNum}</span>
                      {hasEvent && <span className="event-dot" />}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="list-view">
          {schedules.length === 0 ? (
            <div className="empty-state">暂无安排，请点击上方按钮添加</div>
          ) : schedules.map((item) => (
            <div key={item.id} className="schedule-item">
              <div className="schedule-time">
                <div className="date">{item.date}</div>
                <div className="time">{item.time || item.deadline}</div>
              </div>
              <div className="schedule-info">
                <h4>{item.title}</h4>
                <span className="schedule-class">{item.class_name}</span>
              </div>
              <div 
                className="schedule-type" 
                style={{ backgroundColor: typeColors[item.type] }}
              >
                {typeLabels[item.type]}
              </div>
              <button className="action-icon" onClick={() => handleDelete(item.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuizManager() {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: '大气压强测试', type: 'choice', score: 10, created_at: '2024-01-15', class_name: '高一(1)班', deadline: '2024-01-18' },
    { id: 2, title: '气候类型填空', type: 'fill', score: 15, created_at: '2024-01-12', class_name: '高一(1)班', deadline: '2024-01-15' },
    { id: 3, title: '等高线地形图综合分析', type: 'essay', score: 25, created_at: '2024-01-10', class_name: '高一(2)班', deadline: '2024-01-13' },
    { id: 4, title: '洋流分布选择题', type: 'choice', score: 12, created_at: '2024-01-08', class_name: '高一(1)班', deadline: '2024-01-11' },
    { id: 5, title: '地球运动填空题', type: 'fill', score: 18, created_at: '2024-01-05', class_name: '高一(2)班', deadline: '2024-01-08' },
    { id: 6, title: '锋面系统分析题', type: 'essay', score: 20, created_at: '2024-01-03', class_name: '高一(1)班', deadline: '2024-01-06' },
    { id: 7, title: '自然灾害防治选择', type: 'choice', score: 15, created_at: '2023-12-28', class_name: '高一(2)班', deadline: '2023-12-31' },
    { id: 8, title: '农业区位分析', type: 'essay', score: 30, created_at: '2023-12-25', class_name: '高一(1)班', deadline: '2023-12-28' },
  ])

  const [submissions, setSubmissions] = useState([
    { id: 1, title: '大气压强测试', pending: 3, total: 45 },
    { id: 2, title: '气候类型填空', pending: 5, total: 45 },
    { id: 3, title: '等高线地形图综合分析', pending: 8, total: 42 },
    { id: 4, title: '洋流分布选择题', pending: 2, total: 45 },
    { id: 5, title: '地球运动填空题', pending: 12, total: 42 },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQuiz, setNewQuiz] = useState({ title: '', type: 'choice', score: 10 })

  const typeLabels = {
    choice: '选择题',
    fill: '填空题',
    essay: '主观题',
  }

  const handleCreateQuiz = () => {
    if (!newQuiz.title.trim()) {
      alert('请输入测验标题')
      return
    }
    const quiz = {
      id: Date.now(),
      ...newQuiz,
      created_at: new Date().toISOString().split('T')[0],
    }
    setQuizzes([quiz, ...quizzes])
    setNewQuiz({ title: '', type: 'choice', score: 10 })
    setShowCreateModal(false)
  }

  const handleDeleteQuiz = (id) => {
    if (confirm('确定要删除这个测验吗？')) {
      setQuizzes(quizzes.filter(q => q.id !== id))
    }
  }

  const handleGrade = (id) => {
    if (confirm('确认已批改完所有作业？')) {
      setSubmissions(submissions.map(s => 
        s.id === id ? { ...s, pending: 0 } : s
      ))
    }
  }

  return (
    <div className="quiz-manager">
      <header className="panel-header">
        <h1>作业与测验管理</h1>
        <button className="add-btn" onClick={() => setShowCreateModal(true)}>
          + 创建测验
        </button>
      </header>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>创建新测验</h3>
            <div className="form-group">
              <label>测验标题</label>
              <input 
                type="text" 
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                placeholder="请输入测验标题"
              />
            </div>
            <div className="form-group">
              <label>测验类型</label>
              <select 
                value={newQuiz.type}
                onChange={(e) => setNewQuiz({...newQuiz, type: e.target.value})}
              >
                <option value="choice">选择题</option>
                <option value="fill">填空题</option>
                <option value="essay">主观题</option>
              </select>
            </div>
            <div className="form-group">
              <label>分值</label>
              <input 
                type="number" 
                value={newQuiz.score}
                onChange={(e) => setNewQuiz({...newQuiz, score: parseInt(e.target.value) || 0})}
                min="1"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>取消</button>
              <button className="confirm-btn" onClick={handleCreateQuiz}>创建</button>
            </div>
          </div>
        </div>
      )}

      <div className="quiz-list">
        {quizzes.length === 0 ? (
          <div className="empty-state">暂无测验，请点击上方按钮创建</div>
        ) : quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-item">
            <div className="quiz-info">
              <h4>{quiz.title}</h4>
              <p className="quiz-meta">
                <span className="type-tag">{typeLabels[quiz.type]}</span>
                <span>分值: {quiz.score}分</span>
                <span>{quiz.created_at}</span>
              </p>
            </div>
            <div className="quiz-actions">
              <button className="action-icon" onClick={() => handleDeleteQuiz(quiz.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <div className="submissions-section">
        <h3>待批改作业</h3>
        <div className="submissions-list">
          {submissions.filter(s => s.pending > 0).length === 0 ? (
            <div className="empty-state">暂无待批改作业</div>
          ) : submissions.filter(s => s.pending > 0).map((item) => (
            <div key={item.id} className="submission-item">
              <span className="submission-title">{item.title}</span>
              <span className="submission-count">{item.pending}份待批改</span>
              <button className="grade-btn" onClick={() => handleGrade(item.id)}>批改</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DiscussionManager() {
  const [discussions, setDiscussions] = useState([
    { id: 1, title: '关于气旋和反气旋的区别', course: '必修一', is_top: 1, created_at: '2024-01-18', replies: 5, author: '张同学' },
    { id: 2, title: '等高线地形图判读技巧分享', course: '必修一', is_top: 1, created_at: '2024-01-17', replies: 12, author: '李同学' },
    { id: 3, title: '实验操作疑问：如何正确使用气压计', course: '选修一', is_top: 0, created_at: '2024-01-17', replies: 3, author: '薛同学' },
    { id: 4, title: '求助：气候类型判读总是出错', course: '必修一', is_top: 0, created_at: '2024-01-16', replies: 8, author: '王同学' },
    { id: 5, title: '洋流对气候影响的实例分析', course: '必修一', is_top: 0, created_at: '2024-01-15', replies: 6, author: '赵同学' },
    { id: 6, title: '地球公转产生的四季变化原理', course: '必修一', is_top: 0, created_at: '2024-01-14', replies: 4, author: '刘同学' },
    { id: 7, title: '锋面系统与天气变化的关系', course: '必修一', is_top: 0, created_at: '2024-01-13', replies: 7, author: '陈同学' },
    { id: 8, title: '自然灾害防治措施总结', course: '选修一', is_top: 0, created_at: '2024-01-12', replies: 9, author: '杨同学' },
    { id: 9, title: '农业区位选择的影响因素', course: '必修二', is_top: 0, created_at: '2024-01-11', replies: 5, author: '周同学' },
    { id: 10, title: '区域地理学习方法分享', course: '必修三', is_top: 0, created_at: '2024-01-10', replies: 11, author: '吴同学' },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDiscussion, setNewDiscussion] = useState({ title: '', course: '必修一' })

  const handleCreate = () => {
    if (!newDiscussion.title.trim()) {
      alert('请输入话题标题')
      return
    }
    const discussion = {
      id: Date.now(),
      ...newDiscussion,
      is_top: 0,
      created_at: new Date().toISOString().split('T')[0],
      replies: 0,
    }
    setDiscussions([discussion, ...discussions])
    setNewDiscussion({ title: '', course: '必修一' })
    setShowCreateModal(false)
  }

  const handleToggleTop = (id) => {
    setDiscussions(discussions.map(d => 
      d.id === id ? { ...d, is_top: d.is_top ? 0 : 1 } : d
    ))
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这个话题吗？')) {
      setDiscussions(discussions.filter(d => d.id !== id))
    }
  }

  return (
    <div className="discussion-manager">
      <header className="panel-header">
        <h1>讨论区管理</h1>
        <button className="add-btn" onClick={() => setShowCreateModal(true)}>
          + 创建话题
        </button>
      </header>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>创建新话题</h3>
            <div className="form-group">
              <label>话题标题</label>
              <input 
                type="text" 
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
                placeholder="请输入话题标题"
              />
            </div>
            <div className="form-group">
              <label>所属课程</label>
              <select 
                value={newDiscussion.course}
                onChange={(e) => setNewDiscussion({...newDiscussion, course: e.target.value})}
              >
                <option value="必修一">必修一</option>
                <option value="必修二">必修二</option>
                <option value="选修一">选修一</option>
                <option value="选修二">选修二</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>取消</button>
              <button className="confirm-btn" onClick={handleCreate}>创建</button>
            </div>
          </div>
        </div>
      )}

      <div className="discussion-list">
        {discussions.length === 0 ? (
          <div className="empty-state">暂无话题，请点击上方按钮创建</div>
        ) : discussions.map((item) => (
          <div key={item.id} className={`discussion-item ${item.is_top ? 'top' : ''}`}>
            {item.is_top && <span className="top-badge">置顶</span>}
            <div className="discussion-info">
              <h4>{item.title}</h4>
              <p className="discussion-meta">
                <span>作者: {item.author}</span>
                <span>{item.course}</span>
                <span>回复: {item.replies}</span>
                <span>{item.created_at}</span>
              </p>
            </div>
            <div className="discussion-actions">
              <button className="action-icon" onClick={() => handleToggleTop(item.id)}>
                {item.is_top ? '⬇️' : '⬆️'}
              </button>
              <button className="action-icon" onClick={() => handleDelete(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GradeManager({ currentUser }) {
  const [selectedType, setSelectedType] = useState('experiment')
  const [grades] = useState([
    { id: 1, name: '张同学', experiment: 92, quiz: 88, exam: 95, class_rank: 3 },
    { id: 2, name: '李同学', experiment: 85, quiz: 82, exam: 88, class_rank: 8 },
    { id: 3, name: '薛同学', experiment: 95, quiz: 90, exam: 92, class_rank: 2 },
    { id: 4, name: '王同学', experiment: 78, quiz: 80, exam: 85, class_rank: 15 },
    { id: 5, name: '赵同学', experiment: 90, quiz: 85, exam: 91, class_rank: 5 },
    { id: 6, name: '刘同学', experiment: 72, quiz: 75, exam: 78, class_rank: 20 },
    { id: 7, name: '陈同学', experiment: 88, quiz: 86, exam: 89, class_rank: 7 },
    { id: 8, name: '杨同学', experiment: 96, quiz: 92, exam: 94, class_rank: 1 },
    { id: 9, name: '周同学', experiment: 80, quiz: 78, exam: 82, class_rank: 12 },
    { id: 10, name: '吴同学', experiment: 65, quiz: 68, exam: 70, class_rank: 25 },
    { id: 11, name: '郑同学', experiment: 83, quiz: 84, exam: 86, class_rank: 10 },
    { id: 12, name: '孙同学', experiment: 91, quiz: 89, exam: 93, class_rank: 4 },
  ])

  const handleExport = () => {
    const csvContent = [
      ['姓名', '实验成绩', '作业成绩', '考试成绩'],
      ...grades.map(g => [g.name, g.experiment, g.quiz, g.exam])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `成绩表_${currentUser.class_name}.csv`
    link.click()
  }

  return (
    <div className="grade-manager">
      <header className="panel-header">
        <h1>成绩管理</h1>
        <div className="header-actions">
          <select 
            className="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="experiment">实验成绩</option>
            <option value="quiz">作业成绩</option>
            <option value="exam">考试成绩</option>
          </select>
          <button className="export-btn" onClick={handleExport}>
            📥 导出Excel
          </button>
        </div>
      </header>

      <div className="grade-table-container">
        <table className="grade-table">
          <thead>
            <tr>
              <th>班级排名</th>
              <th>姓名</th>
              <th>实验成绩</th>
              <th>作业成绩</th>
              <th>考试成绩</th>
              <th>平均分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((student) => {
              const avg = ((student.experiment + student.quiz + student.exam) / 3).toFixed(1)
              return (
                <tr key={student.id}>
                  <td>
                    <span className={`rank-badge ${student.class_rank <= 3 ? 'top' : ''}`}>
                      {student.class_rank}
                    </span>
                  </td>
                  <td>{student.name}</td>
                  <td>{student.experiment}</td>
                  <td>{student.quiz}</td>
                  <td>{student.exam}</td>
                  <td>{avg}</td>
                  <td>
                    <button className="detail-btn">详情</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResourceLibrary() {
  const [resources, setResources] = useState([
    { id: 1, title: '地理课件模板', category: 'PPT', is_public: 1, created_at: '2024-01-15', size: '2.5MB' },
    { id: 2, title: '大气运动实验数据', category: 'Excel', is_public: 0, created_at: '2024-01-10', size: '1.2MB' },
    { id: 3, title: '气候类型分析案例集', category: 'Word', is_public: 1, created_at: '2024-01-08', size: '3.8MB' },
    { id: 4, title: '等高线地形图素材', category: '图片', is_public: 1, created_at: '2024-01-05', size: '5.6MB' },
    { id: 5, title: '洋流分布示意图集', category: '图片', is_public: 0, created_at: '2024-01-03', size: '4.2MB' },
    { id: 6, title: '地球运动教学PPT', category: 'PPT', is_public: 1, created_at: '2024-01-01', size: '6.1MB' },
    { id: 7, title: '自然灾害防治教案', category: 'Word', is_public: 1, created_at: '2023-12-28', size: '2.1MB' },
    { id: 8, title: '农业区位分析表格', category: 'Excel', is_public: 0, created_at: '2023-12-25', size: '856KB' },
    { id: 9, title: '区域地理复习资料', category: 'PDF', is_public: 1, created_at: '2023-12-20', size: '7.3MB' },
    { id: 10, title: '地质构造示意图', category: '图片', is_public: 1, created_at: '2023-12-18', size: '3.9MB' },
    { id: 11, title: '实验操作指南', category: 'PDF', is_public: 0, created_at: '2023-12-15', size: '1.8MB' },
    { id: 12, title: '学生成绩分析表', category: 'Excel', is_public: 0, created_at: '2023-12-12', size: '2.4MB' },
  ])

  const [activeTab, setActiveTab] = useState('mine')
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '*.*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setIsUploading(true)
        setTimeout(() => {
          const ext = file.name.split('.').pop().toLowerCase()
          let category = '其他'
          if (['pdf'].includes(ext)) category = '文档'
          else if (['doc', 'docx'].includes(ext)) category = 'Word'
          else if (['ppt', 'pptx'].includes(ext)) category = 'PPT'
          else if (['xls', 'xlsx'].includes(ext)) category = 'Excel'
          else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) category = '图片'
          else if (['mp4', 'avi', 'mov'].includes(ext)) category = '视频'
          
          const newResource = {
            id: Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            category: category,
            is_public: 0,
            created_at: new Date().toISOString().split('T')[0],
          }
          setResources([newResource, ...resources])
          setIsUploading(false)
        }, 1500)
      }
    }
    input.click()
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这个资源吗？')) {
      setResources(resources.filter(r => r.id !== id))
    }
  }

  const handleTogglePublic = (id) => {
    setResources(resources.map(r => 
      r.id === id ? { ...r, is_public: r.is_public ? 0 : 1 } : r
    ))
  }

  const displayedResources = activeTab === 'mine' 
    ? resources 
    : resources.filter(r => r.is_public === 1)

  return (
    <div className="resource-library">
      <header className="panel-header">
        <h1>教学资源共享库</h1>
        <button className="upload-btn" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? '上传中...' : '+ 上传资源'}
        </button>
      </header>

      <div className="resource-tabs">
        <button className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>我的资源</button>
        <button className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>公共资源</button>
      </div>

      <div className="resource-list">
        {displayedResources.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'mine' ? '暂无资源，请点击上方按钮上传' : '暂无公共资源'}
          </div>
        ) : displayedResources.map((item) => (
          <div key={item.id} className="resource-item">
            <div className="resource-icon">📁</div>
            <div className="resource-info">
              <h4>{item.title}</h4>
              <p className="resource-meta">
                <span className="category-tag">{item.category}</span>
                <span>{item.size}</span>
                <span>{item.created_at}</span>
              </p>
            </div>
            <div className="resource-actions">
              <span className={`public-badge ${item.is_public ? 'public' : 'private'}`} onClick={() => handleTogglePublic(item.id)} style={{cursor: 'pointer'}}>
                {item.is_public ? '公开' : '私有'}
              </span>
              <button className="action-icon" onClick={() => handleDelete(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherDashboard

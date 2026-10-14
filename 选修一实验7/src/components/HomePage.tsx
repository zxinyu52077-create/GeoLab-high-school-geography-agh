import { Sun, Cloud, ArrowRight, TrendingUp, Award, BookOpen, Globe, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Globe,
      title: '科学可视化',
      description: '直观展示厄尔尼诺和拉尼娜的形成过程，通过动态地图和动画演示复杂的气候机制',
      color: 'from-blue-500 to-cyan-500',
      link: 'visualization'
    },
    {
      icon: BookOpen,
      title: '系统学习',
      description: '从基础概念到深层机制，循序渐进的知识体系，适合高中地理学习',
      color: 'from-green-500 to-emerald-500',
      link: 'concepts'
    },
    {
      icon: TrendingUp,
      title: '互动题库',
      description: '精心设计的阶段性题目，包含单选、多选和读图分析题，提升应试能力',
      color: 'from-purple-500 to-pink-500',
      link: 'quiz'
    },
    {
      icon: Award,
      title: '全球影响',
      description: '探索厄尔尼诺和拉尼娜对全球各大洲的气候影响',
      color: 'from-orange-500 to-red-500',
      link: 'impacts'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-10">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
                <Sun className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">厄尔尼诺</span>
              </div>
              <div className="text-gray-500">VS</div>
              <div className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                <Cloud className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">拉尼娜</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-elnino">洋流</span>
              <span className="text-white mx-3">与</span>
              <span className="text-gradient-lanina">水循环</span>
              <br />
              <span className="text-2xl md:text-3xl text-gray-400 font-normal">
                GEOSIM 教育系统
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              从洋流输送、水汽循环和区域气候入手，并以厄尔尼诺与拉尼娜为海气相互作用案例，追踪变量如何改变环境结果。
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => onNavigate('concepts')}
                className="group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40"
              >
                <span>开始学习</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('visualization')}
                className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-8 py-4 rounded-xl font-semibold border border-slate-600 transition-all duration-300"
              >
                <Globe className="w-5 h-5" />
                <span>查看可视化演示</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">系统特点</h2>
            <p className="text-gray-400">专为高中地理学习设计的综合性教育平台</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <button
                  key={index}
                  onClick={() => onNavigate(feature.link)}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1 text-left w-full"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                  <div className="flex items-center text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm">了解更多</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">什么是 ENSO？</h2>
              <p className="text-gray-300 mb-4">
                ENSO（厄尔尼诺-南方涛动）是地球上最重要的气候振荡现象，它通过改变太平洋的海气相互作用，对全球气候产生深远影响。
              </p>
              <p className="text-gray-300 mb-6">
                这个系统包括三个主要阶段：厄尔尼诺（暖事件）、拉尼娜（冷事件）和中性状态。理解ENSO对于预测全球气候异常至关重要。
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => onNavigate('concepts')}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >厄尔尼诺</button>
                <button 
                  onClick={() => onNavigate('concepts')}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >拉尼娜</button>
                <button 
                  onClick={() => onNavigate('concepts')}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 hover:bg-green-500/30 transition-colors"
                >中性状态</button>
                <button 
                  onClick={() => onNavigate('concepts')}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                >沃克环流</button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-900/50 to-slate-900/50 rounded-3xl border border-slate-700 p-8">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-full animate-pulse" />
                      <div className="absolute inset-4 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute inset-8 bg-slate-800 rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-white font-semibold">ENSO</p>
                          <p className="text-gray-400 text-xs">气候振荡系统</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 left-4 bg-slate-700/80 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-white text-sm font-medium">暖事件</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-slate-700/80 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-white text-sm font-medium">冷事件</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">学习路径</h2>
            <p className="text-gray-400">从基础到进阶，循序渐进掌握ENSO知识</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-red-500 hidden lg:block" />
            
            <div className="space-y-8 lg:space-y-0">
              {[
                { phase: '阶段一', title: '基础概念', desc: '了解厄尔尼诺和拉尼娜的定义与特征', color: 'blue', link: 'quiz' },
                { phase: '阶段二', title: '形成机制', desc: '深入理解沃克环流和信风的作用', color: 'purple', link: 'concepts' },
                { phase: '阶段三', title: '全球影响', desc: '掌握对各区域气候的具体影响', color: 'red', link: 'impacts' },
                { phase: '阶段四', title: '读图分析', desc: '学会解读专业气候图表', color: 'orange', link: 'visualization' },
                { phase: '阶段五', title: '综合应用', desc: '运用知识分析实际案例', color: 'green', link: 'quiz' },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate(item.link)}
                  className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-6 w-full`}
                >
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`inline-block bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-${item.color}-500/50 transition-colors w-full`}>
                      <div className={`text-${item.color}-400 font-semibold mb-2`}>{item.phase}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="relative lg:w-1/2 flex justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${
                      item.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                      item.color === 'purple' ? 'from-purple-500 to-pink-500' :
                      item.color === 'red' ? 'from-red-500 to-orange-500' :
                      item.color === 'orange' ? 'from-orange-500 to-yellow-500' :
                      'from-green-500 to-emerald-500'
                    } shadow-lg`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

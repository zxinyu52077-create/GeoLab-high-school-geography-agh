import { useState } from 'react';
import { Sun, Snowflake, Wind, Info, ChevronDown, ChevronUp, BookOpen, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { elninoDefinition, laninaDefinition, walkerCirculation, historicalEvents } from '../data/scienceData';

export default function ConceptsPage() {
  const [activeTab, setActiveTab] = useState<'elnino' | 'lanina' | 'walker' | 'history'>('elnino');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'definition': true,
    'characteristics': false,
    'mechanism': false
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      'definition': true,
      'characteristics': true,
      'mechanism': true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      'definition': false,
      'characteristics': false,
      'mechanism': false
    });
  };

  const renderDefinitionCard = (definition: typeof elninoDefinition, isElnino: boolean) => (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border ${isElnino ? 'border-red-500/30' : 'border-blue-500/30'} overflow-hidden`}>
      <div className={`p-6 ${isElnino ? 'bg-gradient-to-r from-red-500/10 to-transparent' : 'bg-gradient-to-r from-blue-500/10 to-transparent'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isElnino ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
              {isElnino ? <Sun className="w-8 h-8 text-red-400" /> : <Snowflake className="w-8 h-8 text-blue-400" />}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{definition.name}</h3>
              <p className="text-gray-400 italic">{definition.englishName}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={expandAll}
              className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors"
              title="展开全部"
            >
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={collapseAll}
              className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors"
              title="折叠全部"
            >
              <Minimize2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => toggleSection('definition')}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <span className="text-lg font-semibold text-white flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>定义</span>
            </span>
            {expandedSections['definition'] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expandedSections['definition'] && (
            <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
              <p className="text-gray-300 leading-relaxed">{definition.definition}</p>
              <p className="text-gray-400 mt-3 text-sm">{definition.origin}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => toggleSection('characteristics')}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <span className="text-lg font-semibold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>主要特征</span>
            </span>
            {expandedSections['characteristics'] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expandedSections['characteristics'] && (
            <div className="bg-slate-700/50 rounded-xl p-4">
              <ul className="space-y-2">
                {definition.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${isElnino ? 'bg-red-400' : 'bg-blue-400'}`} />
                    <span className="text-gray-300">{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection('mechanism')}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <span className="text-lg font-semibold text-white flex items-center space-x-2">
              <Wind className="w-5 h-5" />
              <span>形成机制</span>
            </span>
            {expandedSections['mechanism'] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expandedSections['mechanism'] && (
            <div className="bg-slate-700/50 rounded-xl p-4">
              <ol className="space-y-2">
                {definition.formationMechanism.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className={`font-bold ${isElnino ? 'text-red-400' : 'text-blue-400'}`}>{index + 1}.</span>
                    <span className="text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWalkerCirculation = () => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-500/10 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Wind className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">沃克环流</h3>
            <p className="text-gray-400 italic">Walker Circulation</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-300 mb-6">{walkerCirculation.description}</p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h4 className="text-green-400 font-semibold mb-3">正常状态</h4>
            <ul className="space-y-2 text-sm">
              {walkerCirculation.normalState.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 bg-green-400" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-3">厄尔尼诺状态</h4>
            <ul className="space-y-2 text-sm">
              {walkerCirculation.elninoState.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 bg-red-400" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-3">拉尼娜状态</h4>
            <ul className="space-y-2 text-sm">
              {walkerCirculation.laninaState.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 bg-blue-400" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoricalEvents = () => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-yellow-500/30 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">历史事件</h3>
            <p className="text-gray-400">重大厄尔尼诺与拉尼娜事件记录</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {historicalEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-slate-700/50 rounded-xl p-4 border ${
                event.type === 'elnino' ? 'border-red-500/30' : 'border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.type === 'elnino' ? 'bg-red-400' : 'bg-blue-400'}`} />
                  <span className="text-white font-semibold">{event.name}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.intensity === 'very_strong' ? 'bg-red-500/20 text-red-400' :
                  event.intensity === 'strong' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {event.intensity === 'very_strong' ? '极强' : event.intensity === 'strong' ? '强' : '中等'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{event.description}</p>
              <div className="flex flex-wrap gap-2">
                {event.impacts.map((impact, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-600/50 rounded-full text-xs text-gray-300">
                    {impact}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">知识讲解</h1>
          <p className="text-gray-400">系统学习厄尔尼诺与拉尼娜的科学知识</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setActiveTab('elnino'); setExpandedSections({}); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'elnino'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>厄尔尼诺</span>
          </button>
          <button
            onClick={() => { setActiveTab('lanina'); setExpandedSections({}); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'lanina'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Snowflake className="w-4 h-4" />
            <span>拉尼娜</span>
          </button>
          <button
            onClick={() => { setActiveTab('walker'); setExpandedSections({}); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'walker'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>沃克环流</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>历史事件</span>
          </button>
        </div>

        {activeTab === 'elnino' && renderDefinitionCard(elninoDefinition, true)}
        {activeTab === 'lanina' && renderDefinitionCard(laninaDefinition, false)}
        {activeTab === 'walker' && renderWalkerCirculation()}
        {activeTab === 'history' && renderHistoricalEvents()}
      </div>
    </div>
  );
}

import { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ConceptsPage from './components/ConceptsPage';
import VisualizationPage from './components/VisualizationPage';
import ImpactsPage from './components/ImpactsPage';
import QuizPage from './components/QuizPage';

function App() {
  const [activeTab, setActiveTab] = useState('visualization');

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'concepts':
        return <ConceptsPage />;
      case 'visualization':
        return <VisualizationPage />;
      case 'impacts':
        return <ImpactsPage />;
      case 'quiz':
        return <QuizPage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderPage()}
      </main>
      <footer className="bg-slate-900/50 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            GEOSIM教育系统 - 洋流、水循环与 ENSO 学习平台
          </p>
          <p className="text-gray-600 text-xs mt-2">
            基于科学数据，面向高中地理教育设计
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

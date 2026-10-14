import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, Trophy, Target, Clock, BookOpen, RotateCcw, Play, Lightbulb, ChevronLeft } from 'lucide-react';
import { questions, learningStages } from '../data/questions';
import { Question } from '../data/questions';

export default function QuizPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && !showResults) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, showResults]);

  const currentQuestions = selectedStage === 'all'
    ? questions
    : selectedStage
    ? questions.filter(q => learningStages.find(s => s.id === selectedStage)?.questionIds.includes(q.id))
    : questions;

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleOptionSelect = (optionLabel: string) => {
    if (!currentQuestion || showResults) return;

    if (currentQuestion.type === 'multiple') {
      const current = (selectedAnswers[currentQuestion.id] as string[]) || [];
      if (current.includes(optionLabel)) {
        setSelectedAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: current.filter(a => a !== optionLabel)
        }));
      } else {
        setSelectedAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: [...current, optionLabel].sort()
        }));
      }
    } else {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionLabel
      }));
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setShowResults(true);
      setIsTimerRunning(false);
    }
  };

  const handlePrevious = () => {
    setShowExplanation(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    currentQuestions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      if (Array.isArray(q.correctAnswer)) {
        if (Array.isArray(userAnswer) && 
            userAnswer.length === q.correctAnswer.length &&
            userAnswer.every(a => q.correctAnswer.includes(a))) {
          correct++;
        }
      } else {
        if (userAnswer === q.correctAnswer) {
          correct++;
        }
      }
    });
    setScore(currentQuestions.length > 0 ? Math.round((correct / currentQuestions.length) * 100) : 0);
  };

  const handleStartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setTimeSpent(0);
    setIsTimerRunning(true);
    setShowExplanation(false);
  };

  const handleRestart = () => {
    setSelectedStage(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setTimeSpent(0);
    setIsTimerRunning(false);
    setShowExplanation(false);
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getProgressPercentage = () => {
    if (currentQuestions.length === 0) return 0;
    const answeredCount = currentQuestions.filter((question) => {
      const answer = selectedAnswers[question.id];
      return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
    }).length;
    return Math.round((answeredCount / currentQuestions.length) * 100);
  };

  const hasAnswer = (question: Question) => {
    const answer = selectedAnswers[question.id];
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
  };

  const isCorrect = (question: Question) => {
    const userAnswer = selectedAnswers[question.id];
    if (Array.isArray(question.correctAnswer)) {
      return Array.isArray(userAnswer) && 
             userAnswer.length === question.correctAnswer.length &&
             userAnswer.every(a => question.correctAnswer.includes(a));
    }
    return userAnswer === question.correctAnswer;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedStage) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">互动题库</h1>
            <p className="text-gray-400">通过阶段性题目巩固所学知识</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningStages.map((stage) => {
              const stageQuestions = questions.filter(q => stage.questionIds.includes(q.id));
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all hover:transform hover:-translate-y-1 text-left"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{stage.id.replace('stage', '')}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{stage.name}</h3>
                      <p className="text-gray-400 text-sm">{stage.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400 flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        {stageQuestions.length} 题
                      </span>
                      <span className="text-gray-400 flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        {stage.requiredScore}分通过
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">综合测试</h3>
            <p className="text-gray-400 mb-4">包含所有阶段的题目，全面测试知识掌握程度</p>
            <button
              onClick={() => {
                setSelectedStage('all');
                handleStartQuiz();
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              <span>开始综合测试 ({questions.length}题)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              score >= 80 ? 'bg-green-500/20' : score >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              {score >= 80 ? (
                <Trophy className="w-12 h-12 text-green-400" />
              ) : score >= 60 ? (
                <Target className="w-12 h-12 text-yellow-400" />
              ) : (
                <XCircle className="w-12 h-12 text-red-400" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">测试完成！</h2>
            <p className="text-gray-400 mb-6">
              {selectedStage === 'all' ? '综合测试' : learningStages.find(s => s.id === selectedStage)?.name}
            </p>
            
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className={`text-4xl font-bold ${
                  score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {score}
                </div>
                <div className="text-gray-400 text-sm">得分</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {currentQuestions.filter(isCorrect).length}/{currentQuestions.length}
                </div>
                <div className="text-gray-400 text-sm">正确题数</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{formatTime(timeSpent)}</div>
                <div className="text-gray-400 text-sm">用时</div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">答题详情</h3>
              <div className="space-y-3">
                {currentQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isCorrect(q) ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    {isCorrect(q) ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-gray-300 text-sm flex-1">{index + 1}. {q.content.substring(0, 50)}...</span>
                    <span className={`text-sm font-medium ${isCorrect(q) ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect(q) ? '正确' : '错误'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleStartQuiz}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>重新测试</span>
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>选择其他阶段</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">互动题库</h1>
            <p className="text-gray-400">
              {selectedStage === 'all' ? '综合测试' : learningStages.find(s => s.id === selectedStage)?.name}
            </p>
          </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-mono">{formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{currentQuestionIndex + 1}/{currentQuestions.length}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{getProgressPercentage()}%</span>
                </div>
              </div>
            </div>
        </div>

        {currentQuestion && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.type === 'single' ? 'bg-blue-500/20 text-blue-400' :
                currentQuestion.type === 'multiple' ? 'bg-purple-500/20 text-purple-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {currentQuestion.type === 'single' ? '单选题' : 
                 currentQuestion.type === 'multiple' ? '多选题' : '读图题'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentQuestion.difficulty === 'easy' ? '简单' : 
                 currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="text-gray-500 text-sm">{currentQuestion.chapter}</span>
            </div>

            <h2 className="text-xl font-semibold text-white mb-6">{currentQuestion.content}</h2>

            {currentQuestion.graphData && (
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <h4 className="text-white font-medium mb-2">{currentQuestion.graphData.title}</h4>
                <p className="text-gray-400 text-sm">{currentQuestion.graphData.description}</p>
                <div className="mt-4 bg-slate-900/50 rounded-lg h-64 flex items-center justify-center overflow-hidden p-2">
                  {currentQuestion.graphPaths && currentQuestion.graphPaths.length > 0 ? (
                    <div className="flex gap-4 w-full h-full">
                      {currentQuestion.graphPaths.map((path, index) => (
                        <div key={index} className="flex-1 flex items-center justify-center">
                          <img 
                            src={path} 
                            alt={`${currentQuestion.graphData?.title} - 图${String.fromCharCode(65 + index)}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  ) : currentQuestion.graphPath ? (
                    <img 
                      src={currentQuestion.graphPath} 
                      alt={currentQuestion.graphData.title}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className={`w-24 h-24 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                        currentQuestion.graphData.type === 'temperature' ? 'bg-gradient-to-br from-red-500/20 to-blue-500/20' :
                        'bg-gradient-to-br from-purple-500/20 to-cyan-500/20'
                      }`}>
                        <Target className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm">图表展示区域</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3 mb-8">
              {currentQuestion.options?.map((option) => {
                const isSelected = Array.isArray(selectedAnswers[currentQuestion.id])
                  ? (selectedAnswers[currentQuestion.id] as string[]).includes(option.label)
                  : selectedAnswers[currentQuestion.id] === option.label;

                return (
                  <button
                    key={option.label}
                    onClick={() => handleOptionSelect(option.label)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? currentQuestion.type === 'multiple'
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-blue-500/20 border-blue-500 text-white'
                        : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-slate-500'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isSelected
                        ? currentQuestion.type === 'multiple'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500 text-white'
                        : 'bg-slate-600 text-gray-400'
                    }`}>
                      {option.label}
                    </span>
                    <span>{option.value}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-600 text-white rounded-xl font-semibold transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>上一题</span>
              </button>
              
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl font-semibold transition-all"
              >
                <Lightbulb className="w-5 h-5" />
                <span>{showExplanation ? '隐藏解析' : '查看解析'}</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={!hasAnswer(currentQuestion)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-gray-400 text-white rounded-xl font-semibold transition-all"
              >
                <span>{currentQuestionIndex < currentQuestions.length - 1 ? '下一题' : '提交答案'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {showExplanation && (
              <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>题目解析</span>
                </h4>
                <p className="text-gray-300 mb-4">{currentQuestion.explanation}</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.relatedKnowledge.map((knowledge, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {knowledge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 bg-slate-700/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">题目导航</h4>
              <div className="flex flex-wrap gap-2">
                {currentQuestions.map((q, index) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        isCurrent
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : isAnswered
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                      }`}
                      title={`第${index + 1}题`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

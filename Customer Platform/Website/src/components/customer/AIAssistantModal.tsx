import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Bot, 
  Send, 
  Mic, 
  Camera, 
  Sparkles, 
  Volume2,
  Plus
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const { 
    isAIModalOpen, 
    setIsAIModalOpen, 
    aiChatMessages, 
    sendAIMessage,
    addToCart,
    healthProfile
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isScanningImage, setIsScanningImage] = useState(false);

  if (!isAIModalOpen) return null;

  const quickPrompts = [
    "What should I eat for lunch to manage my PCOS?",
    "Recommend a zero-carb keto dinner meal",
    "How many calories should I eat post-workout?",
    "Explain why salmon is safe for my glucose levels",
  ];

  const handleSend = () => {
    if (!inputQuery.trim()) return;
    sendAIMessage(inputQuery);
    setInputQuery('');
  };

  const handleVoiceSim = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      sendAIMessage("Recommend a high protein PCOS lunch for me");
    }, 2000);
  };

  const handleImageScanSim = () => {
    setIsScanningImage(true);
    setTimeout(() => {
      setIsScanningImage(false);
      sendAIMessage("I scanned my meal plate: Grilled Avocado Salmon Bowl. Is this macro compliant?");
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base font-['Outfit']">Wellora AI Clinical Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">LIVE</span>
              </div>
              <p className="text-xs text-blue-100">Personalized for {healthProfile.name} • {healthProfile.fitnessGoal}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
          
          {aiChatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-3.5 h-3.5" /> NutriMind Engine
                    </span>
                    <button className="text-slate-400 hover:text-blue-500">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p>{msg.text}</p>

                {/* AI Health Insight Tag */}
                {msg.healthInsight && (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                    ⚡ {msg.healthInsight}
                  </div>
                )}

                {/* AI Meal Recommendation Card inside chat */}
                {msg.mealRecommendation && (
                  <div className="mt-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <img
                      src={msg.mealRecommendation.image}
                      alt={msg.mealRecommendation.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {msg.mealRecommendation.name}
                      </h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {msg.mealRecommendation.aiMatchScore}% Match • {msg.mealRecommendation.macros.calories} kcal
                      </p>
                      <button
                        onClick={() => addToCart(msg.mealRecommendation!)}
                        className="mt-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add to Order (₹{msg.mealRecommendation.price})
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 px-2">{msg.timestamp}</span>
            </div>
          ))}

          {/* Simulated Loading Animations */}
          {isRecordingVoice && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-3 animate-pulse">
              <Mic className="w-5 h-5 text-emerald-500 animate-bounce" />
              <span>Listening to voice health prompt... speak now...</span>
            </div>
          )}

          {isScanningImage && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3 animate-pulse">
              <Camera className="w-5 h-5 text-blue-500 animate-spin" />
              <span>Scanning food plate imagery for macro recognition...</span>
            </div>
          )}

        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => sendAIMessage(qp)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          
          <button
            onClick={handleImageScanSim}
            title="Scan Food Image"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            onClick={handleVoiceSim}
            title="Voice Input"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about meals, PCOS diet rules, macros..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSend}
            className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { API_BASE } from '../../utils/api';

export default function AdaptiveQuiz({ videoId, onNavigate }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);         //option explanation
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 1. Fetch First Question on Mount
  useEffect(() => {
    fetchNextQuestion();
  }, [videoId]);

  const fetchNextQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE}/api/adaptive-next?videoId=${videoId}`,{
        headers:{
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await res.json();

      if(data.completed) {
        setIsCompleted(true);
      } else {
        if(data.data?.question){
          const rawOptions = data.data.question.options;
          // Parse stringified options from database if necessary
          const parsedOptions = typeof rawOptions === 'string' ? JSON.parse(rawOptions) : rawOptions;
          setCurrentQuestion({
            ...data.data.question,
            concept_title:data.data.concept_name,
            options: parsedOptions,
          })
        }
      }
    } catch (err) {
      console.error("Error fetching next question:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Current Answer
  const handleSubmitChoice = async () => {
    if (selectedOption === null) return;
    setSubmitting(true);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_BASE}/api/submit-choice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
                questionId: currentQuestion.id,
                selectedOption: selectedOption // Index (0, 1, 2, 3)
            }),
        });

        const data = await res.json();

        if (data.success) {
            const chosenOptionObj = currentQuestion.options[selectedOption];
            const correctOptionObj = currentQuestion.options[data.correct_option];

            const explanationText = chosenOptionObj?.explanation || correctOptionObj?.explanation || "";

            setFeedback({
                isCorrect: data.is_correct,
                correctOptionIndex: data.correct_option,
                explanation: explanationText
            });
        }
    }catch(err){
      console.error("Error submitting choice:", err);
    }finally{
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-12 bg-white shadow-lg rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">AI Selecting Next Optimal Question...</h3>
        <p className="text-xs text-slate-400 mt-1">Adapting difficulty to your knowledge graph mastery</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-10 bg-white shadow-xl rounded-2xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Adaptive Quiz Completed!</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Great job! You have successfully completed the adaptive assessment for this topic. Your knowledge graph mastery has been updated.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onNavigate && onNavigate('graph')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
          >
            📊 Return to Knowledge Graph
          </button>
          <button
            onClick={() => onNavigate && onNavigate('lectures')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          >
            📚 My Lectures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl border border-slate-100 mt-8">
      {/* ── ENHANCEMENT 1: EXIT / BACK HEADER BAR ───────────────────────── */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <button
          onClick={() => onNavigate && onNavigate('graph')}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
        >
          ← Leave Quiz
        </button>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-semibold tracking-wide uppercase">
          ⚡ Adaptive Engine Active
        </span>
      </div>

      {/* Concept Header */}
      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
        Concept: {currentQuestion?.concept_title || 'Adaptive Tracking'}
      </div>

      {/* Question Text */}
      <h2 className="text-xl font-bold text-slate-900 mb-6 leading-snug">{currentQuestion?.question_text}</h2>

      {/* ── ENHANCEMENT 2: OPTIONS LIST WITH LETTER PILLS (A, B, C, D) ── */}
      <div className="space-y-3 mb-6">
        {currentQuestion?.options.map((opt, idx) => {
          const letter = ['A', 'B', 'C', 'D'][idx] || (idx + 1);
          let style = "border-slate-200 hover:border-blue-400 bg-white";
          let pillStyle = "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600";

          if (selectedOption === idx) {
            style = "border-indigo-600 bg-indigo-50/50 shadow-sm";
            pillStyle = "bg-indigo-600 text-white";
          }

          // Reveal correct/incorrect styling post-submission
          if (feedback) {
            if (idx === feedback.correctOptionIndex) {
              style = "border-emerald-500 bg-emerald-50 text-emerald-950";
              pillStyle = "bg-emerald-600 text-white";
            } else if (selectedOption === idx && !feedback.isCorrect) {
              style = "border-rose-500 bg-rose-50 text-rose-950";
              pillStyle = "bg-rose-600 text-white";
            }
          }

          return (
            <button
              key={idx}
              disabled={!!feedback}
              onClick={() => setSelectedOption(idx)}
              className={`group w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center cursor-pointer disabled:cursor-default ${style}`}
            >
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs mr-3 flex-shrink-0 transition-colors ${pillStyle}`}>
                {letter}
              </span>
              <span className="text-sm font-medium flex-1">{opt.option_text}</span>
            </button>
          );
        })}
      </div>

      {/* Immediate Explanation Box */}
      {feedback && (
        <div className={`p-4 rounded-xl mb-6 border ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          <p className="font-bold text-sm">{feedback.isCorrect ? '✨ Correct!' : '❌ Incorrect'}</p>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{feedback.explanation}</p>
        </div>
      )}

      {/* Action Controls */}
      {!feedback ? (
        <button
          disabled={selectedOption === null || submitting}
          onClick={handleSubmitChoice}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Checking...' : 'Submit Choice'}
        </button>
      ) : (
        <button
          onClick={fetchNextQuestion}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
        >
          Continue to Next Adapted Question ➔
        </button>
      )}
    </div>
  );
}
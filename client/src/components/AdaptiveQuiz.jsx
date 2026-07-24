import React, { useState, useEffect } from 'react';

export default function AdaptiveQuiz({ videoId }) {
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
      const res = await fetch(`/api/adaptive-next?videoId=${videoId}`,{
        headers:{
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();

      if(data.completed) {
        setIsCompleted(true);
      } else {
        setCurrentQuestion(data.question);
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
        const res = await fetch('/api/submit-choice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  if(loading) return <div className="p-8 text-center">Loading baseline question...</div>;
  if(isCompleted) return <div className="p-8 text-center font-bold">Quiz Completed! Generating Assessment Breakdown...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8">
      {/* Concept Header */}
      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
        Concept: {currentQuestion?.concept_title || 'Adaptive Tracking'}
      </div>

      {/* Question Text */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">{currentQuestion?.question_text}</h2>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {currentQuestion?.options.map((opt,idx) => {
          let style = "border-gray-200 hover:border-indigo-400";
          if (selectedOption === idx) style = "border-indigo-600 bg-indigo-50";

          // Reveal correct/incorrect styling post-submission
          if (feedback) {
            if (idx === feedback.correctOptionId) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (selectedOption === idx && !feedback.isCorrect) style = "border-rose-500 bg-rose-50 text-rose-900";
          }

          return (
            <button
              key={idx}
              disabled={!!feedback}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${style}`}
            >
              {opt.option_text}
            </button>
          );
        })}
      </div>

      {/* Immediate Explanation Box */}
      {feedback && (
        <div className={`p-4 rounded-lg mb-6 ${feedback.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
          <p className="font-bold">{feedback.isCorrect ? '✨ Correct!' : '❌ Incorrect'}</p>
          <p className="text-sm mt-1">{feedback.explanation}</p>
        </div>
      )}

      {/* Action Controls */}
      {!feedback ? (
        <button
          disabled={!selectedOption || submitting}
          onClick={handleSubmitChoice}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Checking...' : 'Submit Choice'}
        </button>
      ) : (
        <button
          onClick={fetchNextQuestion}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
        >
          Continue to Next Adapted Question ➔
        </button>
      )}
    </div>
  );
}
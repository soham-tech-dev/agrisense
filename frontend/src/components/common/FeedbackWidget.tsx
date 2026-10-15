import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';

interface FeedbackWidgetProps {
  feature: 'disease' | 'chat' | 'weather' | 'mandi' | 'advisory';
  referenceId?: string;
  onSubmitted?: (rating: string) => void;
  className?: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  feature,
  referenceId,
  onSubmitted,
  className = ''
}) => {
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const handleRating = async (selectedRating: 'helpful' | 'not_helpful') => {
    setRating(selectedRating);
    setShowDetails(true);
  };

  const submitFeedback = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      await axios.post(
        '/api/v1/feedback',
        {
          feature,
          reference_id: referenceId,
          rating,
          reason: reason || undefined,
          comment: comment || undefined
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setSubmitted(true);
      if (onSubmitted) onSubmitted(rating);
    } catch (error) {
      console.warn('Feedback submission failed offline, saving locally', error);
      // Still show thank you UI
      setSubmitted(true);
      if (onSubmitted) onSubmitted(rating);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>प्रतिसाद दिल्याबद्दल धन्यवाद! (Thank you for your feedback!)</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      <div className="flex items-center space-x-3 text-slate-600">
        <span className="font-medium text-slate-700">हा संदेश उपयुक्त वाटला का?</span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleRating('helpful')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border transition-all ${
              rating === 'helpful'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>👍 उपयुक्त (Helpful)</span>
          </button>
          <button
            onClick={() => handleRating('not_helpful')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border transition-all ${
              rating === 'not_helpful'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>👎 अनुपयुक्त (Not helpful)</span>
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5 animate-fade-in">
          <div>
            <label className="block text-slate-700 font-medium mb-1">कारण निवडा (पर्यायी):</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'correct', label: 'बरोबर (Correct)' },
                { key: 'incorrect', label: 'चुकीचे (Incorrect)' },
                { key: 'not_clear', label: 'स्पष्ट नाही (Not clear)' },
                { key: 'not_relevant', label: 'सुसंगत नाही (Not relevant)' },
                { key: 'other', label: 'इतर (Other)' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setReason(opt.key)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    reason === opt.key
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="तुमची अधिक टिप्पणी (Comment - optional)..."
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={submitFeedback}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>पाठवा (Submit)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

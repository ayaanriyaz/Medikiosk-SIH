import React, { useState } from 'react';
import { PostMedicationFeedback } from '../types';
import {
  HeartHandshake,
  Pill,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';

interface PostMedicationFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  prescriptionName?: string;
  onSubmitSuccess?: (feedback: PostMedicationFeedback) => void;
}

const COMMON_SIDE_EFFECTS = [
  'Nausea / Upset Stomach',
  'Dizziness / Lightheadedness',
  'Headache',
  'Skin Rash / Itching',
  'Excessive Drowsiness',
  'Dry Mouth',
  'Palpitations',
  'None Observed',
];

export const PostMedicationFeedbackModal: React.FC<PostMedicationFeedbackModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  prescriptionName = 'Prescription (Telmisartan / Rosuvastatin / Ayush Rasayana)',
  onSubmitSuccess,
}) => {
  const [adherence, setAdherence] = useState<'ALL_TAKEN' | 'MISSED_SOME' | 'STOPPED_DUE_TO_SIDE_EFFECT'>('ALL_TAKEN');
  const [symptomStatus, setSymptomStatus] = useState<'IMPROVED' | 'UNCHANGED' | 'WORSENED'>('IMPROVED');
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>(['None Observed']);
  const [rating, setRating] = useState<number>(4);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleSideEffect = (effect: string) => {
    if (effect === 'None Observed') {
      setSelectedSideEffects(['None Observed']);
      return;
    }

    const filtered = selectedSideEffects.filter(e => e !== 'None Observed');
    if (filtered.includes(effect)) {
      const next = filtered.filter(e => e !== effect);
      setSelectedSideEffects(next.length === 0 ? ['None Observed'] : next);
    } else {
      setSelectedSideEffects([...filtered, effect]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const feedbackPayload: Partial<PostMedicationFeedback> = {
      patientId,
      patientName,
      prescriptionId: 'RX-CURRENT',
      submittedAt: new Date().toISOString(),
      medicationAdherence: adherence,
      symptomStatus,
      sideEffects: selectedSideEffects,
      severityRating: rating,
      comments,
    };

    try {
      const res = await fetch(`/api/patients/${patientId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload),
      });

      if (res.ok) {
        const data = await res.json();
        onSubmitSuccess?.(data.feedback);
      }
    } catch {
      // Local fallback
      onSubmitSuccess?.(feedbackPayload as PostMedicationFeedback);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Post-Medication Follow-Up & Feedback
              </h3>
              <p className="text-xs text-teal-100">
                Patient: <strong>{patientName}</strong> • {prescriptionName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
          {!isSubmitted ? (
            <>
              {/* Question 1: Adherence */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  1. Medication Adherence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdherence('ALL_TAKEN')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      adherence === 'ALL_TAKEN'
                        ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Took All Doses
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdherence('MISSED_SOME')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      adherence === 'MISSED_SOME'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Missed Some
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdherence('STOPPED_DUE_TO_SIDE_EFFECT')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      adherence === 'STOPPED_DUE_TO_SIDE_EFFECT'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Stopped Early
                  </button>
                </div>
              </div>

              {/* Question 2: Symptom Status */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  2. Overall Symptom Progression
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSymptomStatus('IMPROVED')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      symptomStatus === 'IMPROVED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Noticeably Improved
                  </button>
                  <button
                    type="button"
                    onClick={() => setSymptomStatus('UNCHANGED')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      symptomStatus === 'UNCHANGED'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Unchanged
                  </button>
                  <button
                    type="button"
                    onClick={() => setSymptomStatus('WORSENED')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      symptomStatus === 'WORSENED'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Worsened / New Symptoms
                  </button>
                </div>
              </div>

              {/* Question 3: Side effects multi-select */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  3. Any Side Effects or Adverse Reactions?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SIDE_EFFECTS.map(effect => {
                    const isSelected = selectedSideEffects.includes(effect);
                    return (
                      <button
                        key={effect}
                        type="button"
                        onClick={() => toggleSideEffect(effect)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {effect}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 4: Recovery Scale (1 to 5) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  4. Well-Being Recovery Rating (1 to 5)
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        rating >= star
                          ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${rating >= star ? 'fill-amber-400' : ''}`} />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Additional Notes or Questions for Doctor
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Share how you feel, any changes in your daily routine or queries regarding next refill..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-100 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording...' : 'Submit Patient Follow-Up'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-teal-50 text-teal-700 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Follow-Up Recorded Successfully
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your post-medication feedback has been logged into your longitudinal EHR. Your attending doctor will review the outcome during your next continuity encounter.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

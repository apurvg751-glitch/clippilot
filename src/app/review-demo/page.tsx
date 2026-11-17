'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

export default function SmartReviewDemoPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Demo Google Maps link (can be replaced with any real business link)
  const googleReviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4';

  const handleStarClick = (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      // For 4-5 stars, automatically prompt to open Google Maps after 800ms
      setTimeout(() => {
        window.open(googleReviewUrl, '_blank');
      }, 900);
    }
  };

  const handlePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setRating(null);
    setHoverRating(null);
    setFeedbackText('');
    setContactInfo('');
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Phone Mockup Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 backdrop-blur-xl relative overflow-hidden">
        {/* Top Business Banner */}
        <div className="text-center pb-5 border-b border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 text-2xl font-black text-white">
            RS
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">The Royal Spice Restaurant</h1>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>M.I. Road, Jaipur, Rajasthan</span>
          </p>
        </div>

        {/* Dynamic State 1: Rating Selection */}
        {rating === null && (
          <div className="py-8 text-center space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-white">How was your dining experience?</h2>
              <p className="text-xs text-slate-400 mt-1">Tap a star to leave your honest rating</p>
            </div>

            {/* Big Interactive Stars */}
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-2 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      (hoverRating !== null ? star <= hoverRating : false)
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                        : 'text-slate-600 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Customer Feedback Stand</span>
            </div>
          </div>
        )}

        {/* Dynamic State 2: 4 or 5 Stars (Instant Google Maps Redirect) */}
        {rating !== null && rating >= 4 && (
          <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">We're Thrilled You Loved It! 🎉</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xs mx-auto">
                Your <strong>{rating}-Star rating</strong> was recorded! Would you take 5 seconds to post it on Google to support our team?
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Write Quick Review on Google Maps</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-slate-400">Opening Google Review tab automatically...</p>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2"
            >
              Test Another Rating
            </button>
          </div>
        )}

        {/* Dynamic State 3: 1 to 3 Stars (Private Internal Feedback Form) */}
        {rating !== null && rating < 4 && !isSubmitted && (
          <form onSubmit={handlePrivateSubmit} className="py-6 space-y-4 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 mb-2">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">We are deeply sorry for letting you down.</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rated: <span className="text-amber-400 font-semibold">{rating} Stars</span>. Please tell our manager what went wrong so we can fix it immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                  <span>What was the issue? (e.g. rude service, delayed food)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="The waiter was rude and our main course arrived 40 minutes late..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Your Mobile or Email (For the owner to apologize & resolve):
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="+91 98765 43210 or yourname@gmail.com"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Send Privately to Restaurant Owner</span>
            </button>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-center">
              🛡️ <strong>Zero Public Damage:</strong> This complaint is delivered directly to management and will <strong>not</strong> be published on Google Maps.
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Reset Rating
              </button>
            </div>
          </form>
        )}

        {/* Dynamic State 4: Private Feedback Successfully Submitted */}
        {rating !== null && rating < 4 && isSubmitted && (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Private Feedback Delivered!</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xs mx-auto">
                Thank you for letting us know. The owner of <strong>The Royal Spice</strong> has received your message and will reach out to <strong>{contactInfo}</strong> to make things right.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">What the Owner Received:</div>
              <div className="text-amber-300 font-mono text-[11px]">"{feedbackText}"</div>
              <div className="text-[11px] text-slate-400">Customer Contact: {contactInfo}</div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2"
            >
              Test Again (Reset Demo)
            </button>
          </div>
        )}
      </div>

      {/* Agency Explainer Box Below Phone */}
      <div className="w-full max-w-md mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-200 flex items-center justify-between">
          <span>Agency Operations Blueprint</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Live System</span>
        </div>
        <p>
          This is the exact screen a customer sees when scanning the acrylic counter stand. <strong>4–5 stars boost Google rankings</strong>, while <strong>1–3 stars protect the owner's reputation</strong>.
        </p>
      </div>
    </div>
  );
}

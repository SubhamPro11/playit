import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What is Airwaves?",
    answer: "Airwaves is an open-source, hand-curated catalog of indie music streams, interactive audio experiments, cultural audio archives, and retro ambient radio broadcasts from around the world and across Indian regional cultures."
  },
  {
    question: "How are stations selected and curated?",
    answer: "Every stream is manually discovered, tested for playback stability, and cataloged based on originality, audio-visual quality, and cultural atmosphere. We prioritize standalone creator projects, community radio, and vintage audio restorations over generic commercial streams."
  },
  {
    question: "How can I submit or suggest a new station?",
    answer: "Click the '+ Suggest' button in the navigation header or footer. Provide the station name, destination URL, and preferred category. Submissions are reviewed regularly for inclusion."
  },
  {
    question: "Why do some external stations open in a new tab?",
    answer: "Airwaves is a direct directory rather than an iframe proxy. To give you the full interactive experience designed by each individual audio creator, stations launch directly on their original domains."
  },
  {
    question: "Why is Airwaves free and without ads?",
    answer: "Airwaves is built as a labor of love for music lovers and open-web explorers. It has no tracking cookies, paywalls, or sponsored ad banners. If you love the directory, you can support hosting costs via the voluntary support section."
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-surface-800" aria-label="Frequently Asked Questions">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need Help?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Everything you need to know about the Airwaves audio directory and curation process.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const contentId = `faq-content-${index}`;
          const buttonId = `faq-btn-${index}`;

          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-surface-850 border-accent-500/30 shadow-lg shadow-accent-500/5'
                  : 'bg-surface-900/60 border-surface-800 hover:border-surface-700 hover:bg-surface-850/60'
              }`}
            >
              <button
                id={buttonId}
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left gap-4 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <span className="font-sans font-medium text-slate-100 text-sm sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-accent-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-surface-800/50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

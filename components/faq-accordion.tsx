'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="divide-y divide-charcoal/8">
      {items.map(({ q, a }) => {
        const isOpen = open === q;
        return (
          <div key={q}>
            <button
              onClick={() => setOpen(isOpen ? null : q)}
              className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
              aria-expanded={isOpen}
            >
              <span className={`text-sm font-medium transition-colors duration-200 ${isOpen ? 'text-burgundy' : 'text-charcoal/80 group-hover:text-charcoal'}`}>
                {q}
              </span>
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className={`shrink-0 ml-4 transition-colors duration-200 ${isOpen ? 'text-burgundy' : 'text-charcoal/35 group-hover:text-charcoal/60'}`}
              >
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </motion.svg>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm text-charcoal/60 leading-relaxed">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

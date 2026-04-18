import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const Countdown: React.FC = () => {
  const targetDate = new Date('2026-06-11T20:00:00Z').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 justify-center">
      {[
        { label: 'Jours', value: timeLeft.days },
        { label: 'Heures', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Secondes', value: timeLeft.seconds }
      ].map((item, i) => (
        <motion.div 
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="flex flex-col items-center group"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative glass-dark w-16 h-16 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-2xl md:text-4xl font-black text-primary shadow-2xl border border-white/10 group-hover:border-primary/40 transition-all duration-500">
              <span className="drop-shadow-[0_0_10px_rgba(163,230,53,0.4)]">
                {item.value.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <span className="text-[9px] md:text-[11px] uppercase font-black tracking-[0.3em] mt-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

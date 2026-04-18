import React from 'react';
import { motion } from 'motion/react';

export const SkeletonMatch = () => (
  <div className="glass-dark rounded-[2rem] p-8 space-y-8 animate-pulse border border-white/5">
    <div className="flex justify-between items-center">
      <div className="h-4 w-24 bg-white/5 rounded-full" />
      <div className="h-5 w-16 bg-white/5 rounded-full" />
    </div>
    <div className="flex justify-between items-center gap-6">
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-[2rem] bg-white/5" />
        <div className="h-3 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-12 bg-white/5 rounded-xl" />
        <div className="h-3 w-12 bg-white/5 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-[2rem] bg-white/5" />
        <div className="h-3 w-16 bg-white/5 rounded-full" />
      </div>
    </div>
    <div className="h-10 w-full bg-white/5 rounded-2xl" />
  </div>
);

export const SkeletonGroup = () => (
  <div className="glass-dark rounded-[2rem] h-[200px] flex animate-pulse border border-white/5 overflow-hidden">
    <div className="w-16 bg-white/5" />
    <div className="flex-1 p-6 space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/5" />
            <div className="h-3 w-20 bg-white/5 rounded-full" />
          </div>
          <div className="h-3 w-8 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

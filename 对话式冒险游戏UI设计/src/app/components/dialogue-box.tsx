import React from "react";
import { Choice } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";

interface DialogueBoxProps {
  title: string;
  description: string;
  choices: Choice[];
  onSelect: (choice: Choice) => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ title, description, choices, onSelect }) => {
  return (
    <div className="bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-6 pb-10 md:p-12 w-full flex flex-col gap-6 md:gap-8 shadow-2xl relative overflow-hidden">
      {/* Narrative Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={description}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 max-w-2xl mx-auto w-full z-10"
        >
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-rose-500 rounded-full" />
            <h2 className="text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
              {title}
            </h2>
          </div>
          <p className="text-lg md:text-2xl leading-relaxed text-slate-100 font-light selection:bg-rose-500/30">
            {description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Choice Section */}
      <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full z-10 pt-2">
        {choices.map((choice, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(choice)}
            className="group relative flex items-center justify-between p-4 px-5 rounded-xl bg-slate-800/60 hover:bg-rose-950/20 border border-slate-700/50 hover:border-rose-500/40 transition-all duration-300 text-left backdrop-blur-sm"
          >
            <span className="text-slate-200 group-hover:text-white text-sm md:text-base font-medium pr-6 leading-tight">
              {choice.text}
            </span>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0" />
            <div className="absolute left-0 w-1 h-0 group-hover:h-full bg-rose-500/60 transition-all top-0 rounded-l-xl" />
          </motion.button>
        ))}
      </div>

      {/* Atmospheric Background Decorations */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-rose-600/5 blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
};

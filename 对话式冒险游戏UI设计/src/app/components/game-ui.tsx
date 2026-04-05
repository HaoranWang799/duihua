import React, { useState, useCallback } from "react";
import { STORY } from "../data/story";
import { GameStats, Choice, Scene } from "../types";
import { CharacterSheet } from "./character-sheet";
import { DialogueBox } from "./dialogue-box";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, History, ScrollText, Map, Info, User, ChevronRight } from "lucide-react";
import { toast, Toaster } from "sonner";

export const GameUI: React.FC = () => {
  const [currentSceneId, setCurrentSceneId] = useState<string>("start");
  const [stats, setStats] = useState<GameStats>({
    name: "无名旅者",
    health: 100,
    gold: 0,
    inventory: ["简单的行囊"],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentScene: Scene = STORY[currentSceneId] || STORY["start"];

  const handleChoice = useCallback((choice: Choice) => {
    // Apply stats changes if any
    if (choice.onSelect) {
      const newStats = choice.onSelect(stats);
      
      // Notify if inventory changed
      if (newStats.inventory.length > stats.inventory.length) {
        toast.success(`获得了新物品：${newStats.inventory[newStats.inventory.length - 1]}`);
      }
      
      // Notify if gold changed
      if (newStats.gold > stats.gold) {
        toast.success(`获得了 ${newStats.gold - stats.gold} 枚金币`);
      }
      
      // Notify if health changed
      if (newStats.health < stats.health) {
        toast.error(`你受到了伤害！剩余生命：${newStats.health}`);
      }
      
      setStats(newStats);
    }
    
    // Move to next scene
    setCurrentSceneId(choice.nextSceneId);
  }, [stats]);

  return (
    <div className="flex h-[100dvh] bg-black text-slate-100 overflow-hidden font-sans selection:bg-rose-500/40 relative">
      <Toaster position="top-center" expand={true} richColors theme="dark" />
      
      {/* Sidebar for Desktop */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:block border-r border-slate-800 shrink-0"
          >
            <CharacterSheet stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Floating Header for Mobile */}
        <header className="absolute top-0 left-0 right-0 h-14 px-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-40 lg:relative lg:h-16 lg:px-6 lg:bg-slate-950/40 lg:backdrop-blur-sm lg:border-b lg:border-slate-800/50">
          <div className="flex items-center gap-2 md:gap-3">
            <Sparkles className="text-rose-500" size={18} />
            <h1 className="font-bold tracking-widest text-sm md:text-lg uppercase bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              欲望之扉
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-300 hover:text-white transition-colors bg-black/20 backdrop-blur-md rounded-full lg:bg-transparent lg:rounded-lg">
              <History size={18} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-rose-400 hover:text-white transition-colors bg-black/20 backdrop-blur-md rounded-full lg:hidden"
            >
              <User size={18} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-800/50 rounded-lg lg:flex items-center gap-2 hidden"
            >
              <Info size={18} />
              <span className="text-xs uppercase font-medium tracking-tighter">
                {isSidebarOpen ? "隐藏状态" : "显示状态"}
              </span>
            </button>
          </div>
        </header>

        {/* Visual Content - Full Screen Background */}
        <main className="flex-1 absolute inset-0 z-0 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSceneId}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={currentScene.imageUrl}
                alt={currentScene.title}
                className="w-full h-full object-cover brightness-[0.5] md:brightness-[0.4]"
              />
              {/* Vertical Gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
              
              {/* Tone Indicator */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-20 right-6 flex flex-col items-end gap-1 pointer-events-none"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-rose-500/60 font-bold">Vocal Tone</span>
                <span className="text-xs text-rose-200/40 italic bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
                  {currentScene.tone || "Normal"}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-[40%] left-6 flex items-center gap-2 text-slate-500/30 text-[10px] uppercase tracking-[0.2em] pointer-events-none">
            <ScrollText size={12} />
            <span>SCENE {Object.keys(STORY).indexOf(currentSceneId) + 1}</span>
          </div>
        </main>

        {/* Dialogue and Action Section - Fixed at Bottom */}
        <div className="mt-auto relative z-10 w-full">
          <DialogueBox
            title={currentScene.title}
            description={currentScene.description}
            choices={currentScene.choices}
            onSelect={handleChoice}
          />
        </div>
      </div>

      {/* Mobile Overlay Sidebar - Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[60] flex justify-end"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[280px] h-full shadow-2xl"
            >
               <CharacterSheet stats={stats} />
               <button 
                 onClick={() => setIsSidebarOpen(false)}
                 className="absolute top-4 right-4 p-2 text-slate-400"
               >
                 <ChevronRight size={24} className="rotate-180" />
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

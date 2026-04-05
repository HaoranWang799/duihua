import React from "react";
import { GameStats } from "../types";
import { Heart, Coins, Shield, User } from "lucide-react";
import { motion } from "motion/react";

interface CharacterSheetProps {
  stats: GameStats;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ stats }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border-l border-slate-700 p-6 h-full text-slate-100 flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600">
          <User size={24} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight uppercase text-slate-300">冒险者</h3>
          <p className="text-sm text-slate-400">{stats.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium uppercase text-slate-400">
            <span className="flex items-center gap-1"><Heart size={12} className="text-red-500" /> 生命值</span>
            <span>{stats.health}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.health}%` }}
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-yellow-500" />
            <span className="text-sm font-medium uppercase text-slate-400">金币</span>
          </div>
          <span className="text-lg font-bold text-yellow-400">{stats.gold}</span>
        </div>

        {/* Inventory */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-400">
            <Shield size={14} className="text-emerald-500" />
            <span>行囊物品</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {stats.inventory.length > 0 ? (
              stats.inventory.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className="px-3 py-2 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300"
                >
                  {item}
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic px-1">你的行囊是空的...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

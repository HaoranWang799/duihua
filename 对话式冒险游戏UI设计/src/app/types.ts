export interface Choice {
  text: string;
  nextSceneId: string;
  onSelect?: (stats: GameStats) => GameStats;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tone?: string;
  choices: Choice[];
}

export interface GameStats {
  health: number;
  gold: number;
  inventory: string[];
  name: string;
}

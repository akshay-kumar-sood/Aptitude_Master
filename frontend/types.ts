export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: number;
  code: string; // Unique identifier like RT1, STD1
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: 'a' | 'b' | 'c' | 'd';
  topic: string;
  module: string;
  level: Difficulty;
  hints: string[];
  explanation: string;
  exam?: string; // Optional: Exam source like "CDS 2025", "GATE 2025", etc.
}

export interface SolvedQuestionData {
  correct: boolean;
  date: string; // YYYY-MM-DD
  attemptedOption: string;
  usedHint: boolean;
}

export interface UserProgress {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  points: number; // Also serves as "Paisa" balance
  solvedQuestions: Record<number, SolvedQuestionData>; // map id -> data
  activityByDate: Record<string, number>; // date -> count
  inventory: string[]; // List of purchased item IDs
  
  // New fields for Profile
  maxStreak: number;
  profileName: string;
  profileImage: string | null; // base64 string
  profileBio: string;
  socialLinks: {
    linkedin: string;
    instagram: string;
    github: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  condition: (progress: UserProgress) => boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  type: 'badge' | 'theme' | 'consumable';
}
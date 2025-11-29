import { StoreItem } from '../types';

export const storeItems: StoreItem[] = [
  // Beginner / Milestones
  {
    id: 'badge_first_step',
    name: 'First Step',
    description: 'Your journey begins here. For Day 1 solvers.',
    price: 1,
    icon: '👣',
    type: 'badge'
  },
  {
    id: 'badge_rookie',
    name: 'Rookie Solver',
    description: 'Awarded to those who are just warming up.',
    price: 30,
    icon: '🌱',
    type: 'badge'
  },
  {
    id: 'Pusher',
    name: 'Bronze Warrior',
    description: 'Survived a whole week of practice.',
    price: 28,
    icon: '⚔️',
    type: 'badge'
  },
  
  // Streaks
  {
    id: 'badge_streak_silver',
    name: 'Silver Streak',
    description: 'Celebrating 50 days of consistency.',
    price: 100,
    icon: '🥈',
    type: 'badge'
  },
  {
    id: 'badge_streak_gold',
    name: 'Gold Streak',
    description: 'Celebrating 60 days of pure dedication.',
    price: 240,
    icon: '🥇',
    type: 'badge'
  },
  {
    id: 'badge_streak_diamond',
    name: 'Diamond Streak',
    description: 'The elite 200-day consistency club.',
    price: 5000,
    icon: '💎',
    type: 'badge'
  },

  // Skill Based
  {
    id: 'badge_titan_slayer',
    name: 'Titan Slayer',
    description: 'For those who conquer the hardest questions.',
    price: 600,
    icon: '🛡️',
    type: 'badge'
  },
  {
    id: 'badge_math_wizard',
    name: 'Math Wizard',
    description: 'You see numbers where others see chaos.',
    price: 1500,
    icon: '🧙‍♂️',
    type: 'badge'
  },

  {
    id: 'badge_verbal_virtuoso',
    name: 'Verbal Virtuoso',
    description: 'Words are your weapons.',
    price: 500,
    icon: '🗣️',
    type: 'badge'
  },

  // Speed & Time
  {
    id: 'badge_speed_demon',
    name: 'Speed Demon',
    description: 'Fastest solver in the west.',
    price: 200,
    icon: '⚡',
    type: 'badge'
  },
  // Habits
  {
    id: 'badge_night_owl',
    name: 'Night Owl',
    description: 'Burning the midnight oil.',
    price: 200,
    icon: '🦉',
    type: 'badge'
  },

  // Fun / Prestige
  {
    id: 'badge_ninja',
    name: 'Shadow Ninja',
    description: 'Silent but accurate.',
    price: 300,
    icon: '🥷',
    type: 'badge'
  },
  {
    id: 'badge_detective',
    name: 'Sherlock',
    description: 'No detail escapes your eye.',
    price: 700,
    icon: '🔎',
    type: 'badge'
  },
  {
    id: 'badge_wealthy',
    name: 'Tycoon',
    description: 'You have more Paisa than you can count.',
    price: 4000,
    icon: '💰',
    type: 'badge'
  },
  {
    id: 'badge_unicorn',
    name: 'Rare Unicorn',
    description: 'The most legendary status symbol.',
    price: 1000,
    icon: '🦄',
    type: 'badge'
  },
  {
    id: 'goodie_coffee',
    name: 'Virtual Coffee',
    description: 'Fuel for your brain cells.',
    price: 50,
    icon: '☕',
    type: 'consumable'
  }
];
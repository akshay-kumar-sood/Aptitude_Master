import React from 'react';
import { Badge as BadgeType, UserProgress } from '../types';
import { Award, Zap, Target, Star, Trophy, Grid, Shield } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { storeItems } from '../data/storeItems';

// Automatic Achievement Badges
const achievementBadges: BadgeType[] = [
  {
    id: 'starter_badge',
    name: 'Starter',
    description: 'Welcome to Aptitude Master!',
    icon: 'star',
    achieved: true, // Always true logic handled in helper
    condition: () => true
  },
  {
    id: 'beginner_solver',
    name: 'Beginner',
    description: 'Solve your first question',
    icon: 'star',
    achieved: false,
    condition: (p) => p.totalSolved >= 1
  },
  {
    id: 'bronze_solver',
    name: 'Bronze Solver',
    description: 'Solve 5 questions',
    icon: 'award',
    achieved: false,
    condition: (p) => p.totalSolved >= 5
  },
  {
    id: 'silver_solver',
    name: 'Silver Solver',
    description: 'Solve 10 questions',
    icon: 'award',
    achieved: false,
    condition: (p) => p.totalSolved >= 10
  },
  {
    id: 'streak_master',
    name: 'Consistent',
    description: 'Earn 20 points',
    icon: 'zap',
    achieved: false,
    condition: (p) => p.points >= 20
  },
  {
    id: 'hard_hitter',
    name: 'Hard Hitter',
    description: 'Solve 2 Hard questions',
    icon: 'target',
    achieved: false,
    condition: (p) => p.hardSolved >= 2
  }
];

export const getEarnedBadges = (progress: UserProgress) => {
    // 1. Get Store Badges owned in inventory
    const ownedStoreBadges = storeItems
        .filter(item => item.type === 'badge' && progress.inventory.includes(item.id))
        .map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon, // Store items use emojis usually, handled in display
            isStoreItem: true
        }));

    // 2. Get Achievement Badges where condition is met
    const earnedAchievements = achievementBadges
        .filter(badge => badge.condition(progress))
        .map(badge => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            isStoreItem: false
        }));

    // 3. Special case: Starter badge is effectively an achievement but might be in inventory logic
    // We dedup based on ID just in case
    const all = [...earnedAchievements, ...ownedStoreBadges];
    const unique = new Map();
    all.forEach(b => unique.set(b.id, b));
    return Array.from(unique.values());
};

const Badges: React.FC = () => {
  const { progress } = useProgress();
  const earnedBadges = getEarnedBadges(progress);

  const renderIcon = (badge: any) => {
      if (badge.isStoreItem) {
          return <div className="text-3xl mb-2 filter drop-shadow-sm">{badge.icon}</div>;
      }
      
      const className = "w-8 h-8 text-yellow-600";
      switch (badge.icon) {
        case 'star': return <Star className={className} />;
        case 'zap': return <Zap className={className} />;
        case 'target': return <Target className={className} />;
        default: return <Award className={className} />;
      }
  };

  return (
    <div>
        {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {earnedBadges.map((badge) => (
                    <div 
                        key={badge.id} 
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl flex flex-col items-center text-center shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="absolute top-0 right-0 p-1 opacity-10">
                            <Shield className="h-10 w-10" />
                        </div>
                        <div className="mb-2 bg-white/50 p-2 rounded-full shadow-inner">
                            {renderIcon(badge)}
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{badge.name}</h4>
                        <p className="text-[10px] text-gray-600 line-clamp-2">{badge.description}</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Start solving questions to earn badges!
            </div>
        )}
    </div>
  );
};

export default Badges;
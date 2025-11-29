import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { UserProgress, Question } from '../types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'aptitude_master_progress';
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface StoredProgressPayload {
  owner: string;
  progress: UserProgress;
}

const getStoredProgress = (): StoredProgressPayload | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.progress && parsed.owner) {
      return parsed as StoredProgressPayload;
    }
    // Backward compatibility with old format (progress object only)
    return {
      owner: 'guest',
      progress: parsed as UserProgress
    };
  } catch (err) {
    console.error('Failed to parse stored progress', err);
    return null;
  }
};

const initialProgress: UserProgress = {
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  points: 0,
  solvedQuestions: {},
  activityByDate: {},
  inventory: ['starter_badge'],
  maxStreak: 0,
  profileName: 'Guest User',
  profileImage: null,
  profileBio: 'Aspiring Aptitude Master',
  socialLinks: {
    linkedin: '',
    instagram: '',
    github: ''
  }
};

interface ProgressContextType {
  progress: UserProgress;
  streak: number;
  submitAnswer: (question: Question, selectedOption: string, usedHint: boolean, isRetry?: boolean) => void;
  resetProgress: () => void;
  buyItem: (itemId: string, cost: number) => boolean;
  updateProfile: (name: string, image: string | null, bio: string, links: { linkedin: string; instagram: string; github: string }) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [streak, setStreak] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Use a ref to prevent syncing initial load of empty state back to DB
  const isInitialLoad = useRef(true);

  // 1. LOAD DATA (On Mount or Auth Change)
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        // If user is from DB, they usually have progress fields attached
        // In our auth flow, `user` object contains the full profile from DB

        // Ensure defaults if fields are missing in DB
        const storedPayload = getStoredProgress();
        const storedProgress = storedPayload && storedPayload.owner === user.email
          ? storedPayload.progress
          : null;
        const mergedProgress = {
          ...initialProgress,
          ...user,
          ...(storedProgress || {}),
          solvedQuestions: (storedProgress?.solvedQuestions) || user.solvedQuestions || {},
          activityByDate: (storedProgress?.activityByDate) || user.activityByDate || {},
          inventory: (storedProgress?.inventory) || user.inventory || ['starter_badge'],
          socialLinks: (storedProgress?.socialLinks) || user.socialLinks || initialProgress.socialLinks
        };

        // Remove DB specific fields that don't belong in UserProgress if needed
        // but Typescript might complain if we aren't careful. For now, strict mapping:

        setProgress(mergedProgress);
      } else {
        // Fallback to LocalStorage for Guest
        const storedPayload = getStoredProgress();
        if (storedPayload) {
          setProgress(prev => ({
            ...initialProgress,
            ...storedPayload.progress
          }));
        }
      }
      isInitialLoad.current = false;
    };
    loadData();
  }, [isAuthenticated, user]);

  // 2. SYNC DATA (When Progress Changes)
  useEffect(() => {
    if (isInitialLoad.current) return;

    // Save to LocalStorage always (as backup/cache)
    const owner = (isAuthenticated && user?.email) ? user.email : 'guest';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ owner, progress }));

    // If Authenticated, Sync to Backend
    if (isAuthenticated && user?.email) {
      // Ensure all fields are included in sync
      const syncData = {
        email: user.email,
        progress: {
          totalSolved: progress.totalSolved ?? 0,
          easySolved: progress.easySolved ?? 0,
          mediumSolved: progress.mediumSolved ?? 0,
          hardSolved: progress.hardSolved ?? 0,
          points: progress.points ?? 0,
          solvedQuestions: progress.solvedQuestions || {},
          activityByDate: progress.activityByDate || {},
          inventory: Array.isArray(progress.inventory) && progress.inventory.length > 0 
            ? progress.inventory 
            : ['starter_badge'],
          maxStreak: progress.maxStreak ?? 0,
          profileName: progress.profileName || user.name || 'User',
          profileImage: progress.profileImage ?? null,
          profileBio: progress.profileBio || 'Aspiring Aptitude Master',
          socialLinks: {
            linkedin: progress.socialLinks?.linkedin || '',
            instagram: progress.socialLinks?.instagram || '',
            github: progress.socialLinks?.github || ''
          }
        }
      };
      
      fetch(`${API_URL}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          // Update local user data with server response
          const { password: _, ...userData } = data.user;
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      })
      .catch(err => {
        console.error("Sync failed", err);
      });
    }
  }, [progress, isAuthenticated, user]);

  // Keep auth_user in sync so refresh restores latest inventory/points
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    try {
      const storedUserRaw = localStorage.getItem('auth_user');
      const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : user;
      const updatedUser = {
        ...storedUser,
        ...progress
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to sync auth user with progress', err);
    }
  }, [progress, isAuthenticated, user]);

  // Streak Calculation
  useEffect(() => {
    const activity = progress.activityByDate || {};
    let currentStreak = 0;

    const todayDate = new Date();
    const todayStr = todayDate.toLocaleDateString('en-CA');

    let pointerDate = new Date(todayDate);

    if (activity[todayStr] && activity[todayStr] > 0) {
      currentStreak++;
    }

    pointerDate.setDate(pointerDate.getDate() - 1); // Yesterday

    while (true) {
      const dStr = pointerDate.toLocaleDateString('en-CA');
      if (activity[dStr] && activity[dStr] > 0) {
        currentStreak++;
        pointerDate.setDate(pointerDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);

    if (currentStreak > progress.maxStreak) {
      setProgress(prev => ({ ...prev, maxStreak: currentStreak }));
    }
  }, [progress.activityByDate, progress.maxStreak]);


  const submitAnswer = (question: Question, selectedOption: string, usedHint: boolean, isRetry: boolean = false) => {
    const existingAttempt = progress.solvedQuestions[question.id];
    
    // If question is already correctly answered, don't allow re-attempt
    if (existingAttempt && existingAttempt.correct && !isRetry) {
      return;
    }

    const isCorrect = selectedOption === question.answer;
    const today = new Date().toLocaleDateString('en-CA');

    setProgress((prev) => {
      const previousAttempt = prev.solvedQuestions[question.id];
      const wasPreviouslyIncorrect = previousAttempt && !previousAttempt.correct;
      
      // If retrying an incorrect answer, we need to adjust the counts
      let totalSolvedChange = 0;
      let easySolvedChange = 0;
      let mediumSolvedChange = 0;
      let hardSolvedChange = 0;
      
      if (!previousAttempt) {
        // First attempt
        totalSolvedChange = 1;
        easySolvedChange = question.level === 'easy' ? 1 : 0;
        mediumSolvedChange = question.level === 'medium' ? 1 : 0;
        hardSolvedChange = question.level === 'hard' ? 1 : 0;
      } else if (wasPreviouslyIncorrect && isCorrect) {
        // Retrying and now correct - don't increment solved counts again, but update the status
        totalSolvedChange = 0;
        easySolvedChange = 0;
        mediumSolvedChange = 0;
        hardSolvedChange = 0;
      }

      const newSolvedQuestions = {
        ...prev.solvedQuestions,
        [question.id]: {
          correct: isCorrect,
          date: today,
          attemptedOption: selectedOption,
          usedHint: usedHint
        }
      };

      const newActivityByDate = { ...prev.activityByDate };
      // Only increment activity if this is a new attempt (not a retry of the same day)
      if (!previousAttempt || previousAttempt.date !== today) {
        newActivityByDate[today] = (newActivityByDate[today] || 0) + 1;
      }

      let pointsChange = 0;
      if (isCorrect) {
        // If previously incorrect, we need to adjust points
        if (wasPreviouslyIncorrect) {
          // Remove the -1 penalty from previous incorrect attempt (add 1 back)
          pointsChange = 1;
          // Add points for correct answer
          pointsChange += usedHint ? 0 : 4;
        } else {
          // First time correct
          pointsChange = usedHint ? 0 : 4;
        }
      } else {
        // Only deduct points on first incorrect attempt
        if (!previousAttempt) {
          pointsChange = -1;
        }
        // If retrying and still incorrect, don't deduct again
      }

      const newPoints = Math.max(0, prev.points + pointsChange);

      return {
        ...prev,
        totalSolved: prev.totalSolved + totalSolvedChange,
        easySolved: prev.easySolved + easySolvedChange,
        mediumSolved: prev.mediumSolved + mediumSolvedChange,
        hardSolved: prev.hardSolved + hardSolvedChange,
        points: newPoints,
        solvedQuestions: newSolvedQuestions,
        activityByDate: newActivityByDate
      };
    });
  };

  const buyItem = (itemId: string, cost: number): boolean => {
    if (progress.points >= cost && !progress.inventory.includes(itemId)) {
      setProgress(prev => ({
        ...prev,
        points: prev.points - cost,
        inventory: [...prev.inventory, itemId]
      }));
      return true;
    }
    return false;
  };

  const updateProfile = (name: string, image: string | null, bio: string, links: { linkedin: string; instagram: string; github: string }) => {
    setProgress(prev => ({
      ...prev,
      profileName: name,
      profileImage: image,
      profileBio: bio,
      socialLinks: links
    }));
  };

  const resetProgress = () => {
    setProgress(initialProgress);
  };

  return (
    <ProgressContext.Provider value={{ progress, streak, submitAnswer, resetProgress, buyItem, updateProfile }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
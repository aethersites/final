import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';

const RATE_LIMIT_KEY = 'ai_generation_usage';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface UsageRecord {
  flashcards: number | null; // timestamp of last use
  quiz: number | null; // timestamp of last use
}

export const useAIRateLimit = () => {
  const { isProUser } = useSubscription();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const getUsageRecord = useCallback((): UsageRecord => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading rate limit:', e);
    }
    return { flashcards: null, quiz: null };
  }, []);

  const setUsageRecord = useCallback((record: UsageRecord) => {
    try {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(record));
    } catch (e) {
      console.error('Error saving rate limit:', e);
    }
  }, []);

  const canUseFeature = useCallback((feature: 'flashcards' | 'quiz'): boolean => {
    // Pro users have unlimited access
    if (isProUser) return true;

    const usage = getUsageRecord();
    const lastUsed = usage[feature];

    // Never used before - allow
    if (!lastUsed) return true;

    // Check if a week has passed
    const now = Date.now();
    return now - lastUsed >= ONE_WEEK_MS;
  }, [isProUser, getUsageRecord]);

  const recordUsage = useCallback((feature: 'flashcards' | 'quiz') => {
    const usage = getUsageRecord();
    usage[feature] = Date.now();
    setUsageRecord(usage);
  }, [getUsageRecord, setUsageRecord]);

  const getTimeUntilReset = useCallback((feature: 'flashcards' | 'quiz'): string | null => {
    if (isProUser) return null;

    const usage = getUsageRecord();
    const lastUsed = usage[feature];

    if (!lastUsed) return null;

    const now = Date.now();
    const timeSinceUse = now - lastUsed;
    
    if (timeSinceUse >= ONE_WEEK_MS) return null;

    const timeRemaining = ONE_WEEK_MS - timeSinceUse;
    const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }, [isProUser, getUsageRecord]);

  const checkAndShowUpgrade = useCallback((feature: 'flashcards' | 'quiz'): boolean => {
    if (canUseFeature(feature)) {
      return true; // Can proceed
    }
    setShowUpgradePopup(true);
    return false; // Cannot proceed, show popup
  }, [canUseFeature]);

  return {
    canUseFeature,
    recordUsage,
    getTimeUntilReset,
    checkAndShowUpgrade,
    showUpgradePopup,
    setShowUpgradePopup,
  };
};

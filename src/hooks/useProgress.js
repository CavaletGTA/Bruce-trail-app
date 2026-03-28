import { useState, useEffect, useCallback } from 'react';
import { trailSegments, getTrailStats } from '../data/bruceTrail';

const STORAGE_KEY = 'bruce-trail-progress';

export function useProgress() {
  // Progress is stored as { segmentId: { completed: true, date: '2024-03-15' } }
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [progress]);

  // Toggle a segment's completion status
  const toggleSegment = useCallback((segmentId, date = null) => {
    setProgress(prev => {
      if (prev[segmentId]) {
        // Remove completion
        const { [segmentId]: removed, ...rest } = prev;
        return rest;
      } else {
        // Mark as complete with date
        return {
          ...prev,
          [segmentId]: {
            completed: true,
            date: date || new Date().toISOString().split('T')[0],
          },
        };
      }
    });
  }, []);

  // Mark segment complete with specific date
  const completeSegment = useCallback((segmentId, date) => {
    setProgress(prev => ({
      ...prev,
      [segmentId]: {
        completed: true,
        date: date || new Date().toISOString().split('T')[0],
      },
    }));
  }, []);

  // Remove completion
  const uncompleteSegment = useCallback((segmentId) => {
    setProgress(prev => {
      const { [segmentId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Check if a segment is completed
  const isCompleted = useCallback((segmentId) => {
    return !!progress[segmentId]?.completed;
  }, [progress]);

  // Get completion date for a segment
  const getCompletionDate = useCallback((segmentId) => {
    return progress[segmentId]?.date || null;
  }, [progress]);

  // Calculate statistics
  const stats = useCallback(() => {
    const baseStats = getTrailStats();
    const completedSegments = trailSegments.filter(s => progress[s.id]?.completed);

    const mainCompleted = completedSegments.filter(s => s.type === 'main');
    const sideCompleted = completedSegments.filter(s => s.type === 'side');

    const mainDistanceCompleted = mainCompleted.reduce((sum, s) => sum + s.distance, 0);
    const sideDistanceCompleted = sideCompleted.reduce((sum, s) => sum + s.distance, 0);
    const totalDistanceCompleted = mainDistanceCompleted + sideDistanceCompleted;

    return {
      ...baseStats,
      completedSegments: completedSegments.length,
      mainCompleted: mainCompleted.length,
      sideCompleted: sideCompleted.length,
      mainDistanceCompleted,
      sideDistanceCompleted,
      totalDistanceCompleted,
      mainPercentage: baseStats.mainTrailDistance > 0
        ? (mainDistanceCompleted / baseStats.mainTrailDistance) * 100
        : 0,
      sidePercentage: baseStats.sideTrailDistance > 0
        ? (sideDistanceCompleted / baseStats.sideTrailDistance) * 100
        : 0,
      totalPercentage: baseStats.totalDistance > 0
        ? (totalDistanceCompleted / baseStats.totalDistance) * 100
        : 0,
    };
  }, [progress]);

  // Get progress by club
  const getClubProgress = useCallback((clubId) => {
    const clubSegments = trailSegments.filter(s => s.club === clubId);
    const completed = clubSegments.filter(s => progress[s.id]?.completed);
    const totalDistance = clubSegments.reduce((sum, s) => sum + s.distance, 0);
    const completedDistance = completed.reduce((sum, s) => sum + s.distance, 0);

    return {
      total: clubSegments.length,
      completed: completed.length,
      totalDistance,
      completedDistance,
      percentage: totalDistance > 0 ? (completedDistance / totalDistance) * 100 : 0,
    };
  }, [progress]);

  // Export progress as JSON
  const exportProgress = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      progress,
      stats: stats(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bruce-trail-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [progress, stats]);

  // Import progress from JSON
  const importProgress = useCallback((jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (data.progress) {
        setProgress(data.progress);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Clear all progress
  const clearProgress = useCallback(() => {
    setProgress({});
  }, []);

  return {
    progress,
    toggleSegment,
    completeSegment,
    uncompleteSegment,
    isCompleted,
    getCompletionDate,
    stats,
    getClubProgress,
    exportProgress,
    importProgress,
    clearProgress,
  };
}

export default useProgress;

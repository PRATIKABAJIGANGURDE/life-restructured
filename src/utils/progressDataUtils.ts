
import { loadProgressHistory } from "@/services/progressService";

/**
 * Common interface for progress history data used across components
 */
export interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

/**
 * Hook to load progress history from Supabase
 */
export const fetchProgressData = async (userId: string): Promise<ProgressHistoryItem[]> => {
  if (!userId) return [];
  
  try {
    // Load actual data from Supabase
    const progressData = await loadProgressHistory(userId);
    return progressData;
  } catch (error) {
    console.error("Error fetching progress data:", error);
    return [];
  }
};

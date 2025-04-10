
import { supabase } from "@/integrations/supabase/client";

// Casting supabase client to any to avoid type errors
// This is necessary because the types don't yet include the daily_progress table
const supabaseClient = supabase as any;

interface ProgressHistoryItem {
  date: string;
  completionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

/**
 * Save daily progress to Supabase
 */
export const saveDailyProgress = async (
  userId: string,
  progressData: ProgressHistoryItem
): Promise<boolean> => {
  try {
    if (!userId) return false;

    const { date, completionRate, tasksCompleted, totalTasks } = progressData;
    
    // Format date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Check if entry already exists for this date
    const { data: existingEntry } = await supabaseClient
      .from('daily_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .maybeSingle();
    
    if (existingEntry) {
      // Update existing entry
      const { error } = await supabaseClient
        .from('daily_progress')
        .update({
          completion_rate: completionRate,
          tasks_completed: tasksCompleted,
          total_tasks: totalTasks,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);
      
      if (error) throw error;
    } else {
      // Insert new entry
      const { error } = await supabaseClient
        .from('daily_progress')
        .insert({
          user_id: userId,
          date: formattedDate,
          completion_rate: completionRate,
          tasks_completed: tasksCompleted,
          total_tasks: totalTasks
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

/**
 * Load progress history from Supabase
 */
export const loadProgressHistory = async (userId: string): Promise<ProgressHistoryItem[]> => {
  try {
    if (!userId) return [];
    
    const { data, error } = await supabaseClient
      .from('daily_progress')
      .select('date, completion_rate, tasks_completed, total_tasks')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Transform data to match the ProgressHistoryItem interface
    return data.map((item: any) => ({
      date: item.date,
      completionRate: item.completion_rate,
      tasksCompleted: item.tasks_completed,
      totalTasks: item.total_tasks
    }));
  } catch (error) {
    console.error('Error loading progress history:', error);
    return [];
  }
};

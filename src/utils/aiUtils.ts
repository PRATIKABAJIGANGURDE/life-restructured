
import { supabase } from '@/integrations/supabase/client';

export const generateAIResponse = async (prompt: string): Promise<{ text: string } | { error: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('deepseek', {
      body: { prompt },
    });

    if (error) throw new Error(error.message);
    
    return { text: data.response };
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return { error: error.message || 'Failed to generate AI response' };
  }
};

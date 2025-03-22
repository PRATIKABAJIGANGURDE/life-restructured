
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

export const generatePersonalPlan = async (
  userInputs: { [key: string]: string }
): Promise<{ dailySchedule: any[]; recoverySteps: string[]; motivationalMessage: string } | { error: string }> => {
  try {
    const promptTemplate = `
      Based on the following information about a person, create a detailed daily schedule and personalized recovery plan:
      
      Daily Routine: ${userInputs.routine || 'Not provided'}
      Goals: ${userInputs.goals || 'Not provided'}
      Challenges: ${userInputs.challenges || 'Not provided'}
      Habits: ${userInputs.habits || 'Not provided'}
      
      Response Format (JSON):
      {
        "dailySchedule": [
          {"time": "HH:MM AM/PM", "task": "Task description", "completed": false},
          // more schedule items...
        ],
        "recoverySteps": [
          "Step 1 description",
          // more steps...
        ],
        "motivationalMessage": "A personalized motivational message"
      }
    `;

    const response = await generateAIResponse(promptTemplate);
    
    if ('error' in response) {
      return { error: response.error };
    }
    
    try {
      // Find the JSON in the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response.text;
      
      // Parse the JSON response
      const planData = JSON.parse(jsonStr);
      
      return {
        dailySchedule: planData.dailySchedule || [],
        recoverySteps: planData.recoverySteps || [],
        motivationalMessage: planData.motivationalMessage || 'Stay consistent with your plan!'
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return { error: 'Failed to parse AI-generated plan' };
    }
  } catch (error: any) {
    console.error('Error generating personal plan:', error);
    return { error: error.message || 'Failed to generate personal plan' };
  }
};

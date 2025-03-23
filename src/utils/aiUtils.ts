
import { supabase } from '@/integrations/supabase/client';

export const generateAIResponse = async (prompt: string): Promise<{ text: string } | { error: string }> => {
  try {
    console.log("Sending prompt to DeepSeek function:", prompt.substring(0, 50) + "...");
    
    const { data, error } = await supabase.functions.invoke('deepseek', {
      body: { prompt },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message);
    }
    
    if (!data || !data.response) {
      console.error("Empty response from DeepSeek function");
      throw new Error("Failed to get a valid response from the AI");
    }
    
    console.log("Received response from DeepSeek function");
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
    console.log("Generating personal plan with inputs:", Object.keys(userInputs));
    
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
      console.error("Error in AI response:", response.error);
      return { error: response.error };
    }
    
    try {
      console.log("Parsing AI response");
      // Find the JSON in the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response.text;
      
      console.log("JSON string to parse:", jsonStr.substring(0, 150) + "...");
      
      // Parse the JSON response
      const planData = JSON.parse(jsonStr);
      
      // Validate the plan data
      if (!planData.dailySchedule || !planData.recoverySteps || !planData.motivationalMessage) {
        console.error("Invalid plan data structure:", planData);
        throw new Error("The AI response did not contain the expected data structure");
      }
      
      console.log("Plan generated successfully");
      return {
        dailySchedule: planData.dailySchedule || [],
        recoverySteps: planData.recoverySteps || [],
        motivationalMessage: planData.motivationalMessage || 'Stay consistent with your plan!'
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, "Full response:", response.text);
      return { error: 'Failed to parse AI-generated plan. Please try again.' };
    }
  } catch (error: any) {
    console.error('Error generating personal plan:', error);
    return { error: error.message || 'Failed to generate personal plan' };
  }
};

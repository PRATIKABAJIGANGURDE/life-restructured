
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export const generateAIResponse = async (prompt: string): Promise<{ text: string } | { error: string }> => {
  try {
    console.log("Sending prompt to Gemini function:", prompt.substring(0, 50) + "...");
    
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { prompt },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message);
    }
    
    if (!data || !data.response) {
      console.error("Empty response from Gemini function");
      throw new Error("Failed to get a valid response from the AI");
    }
    
    console.log("Received response from Gemini function");
    
    // If the response is already a string, return it, otherwise stringify it
    if (typeof data.response === 'string') {
      return { text: data.response };
    } else {
      return { text: JSON.stringify(data.response) };
    }
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return { error: error.message || 'Failed to generate AI response' };
  }
};

export const updateMotivationalMessage = async (
  userId: string, 
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Store the motivational message in the onboarding_data JSON field
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('onboarding_data')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Create or update the onboarding data with the motivational message
    const onboardingData = 
      (data?.onboarding_data && typeof data.onboarding_data === 'object' && !Array.isArray(data.onboarding_data))
        ? { ...(data.onboarding_data as Record<string, any>) }
        : {};
    
    onboardingData.motivationalMessage = message;
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_data: onboardingData 
      })
      .eq('id', userId);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating motivational message:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update motivational message' 
    };
  }
};

// Define proper interfaces for the plan data
interface ScheduleItem {
  time: string;
  task: string;
  completed: boolean;
}

interface PlanData {
  dailySchedule: ScheduleItem[];
  recoverySteps: string[];
  motivationalMessage: string;
}

export const generatePersonalPlan = async (
  userInputs: { [key: string]: any }
): Promise<PlanData | { error: string }> => {
  try {
    console.log("Generating personal plan with inputs:", Object.keys(userInputs));
    
    // Enhanced prompt template with more specific instructions for better AI responses
    const promptTemplate = `
      You are a life coach AI assistant. Create a highly personalized daily plan and recovery strategy based on the following user information:
      
      DAILY ROUTINE:
      ${userInputs.routine || 'Not provided'}
      
      PERSONAL GOALS:
      ${userInputs.goals || 'Not provided'}
      
      CHALLENGES FACED:
      ${userInputs.challenges || 'Not provided'}
      
      HABITS TO BUILD OR BREAK:
      ${userInputs.habits || 'Not provided'}
      
      INSTRUCTIONS:
      1. Create a realistic daily schedule with specific times that aligns with their current routine but introduces positive changes.
      2. Suggest practical steps for recovery that directly address their stated challenges.
      3. Write a personalized motivational message that references their specific goals and challenges.
      4. Format your response ONLY as a valid JSON object with these fields:
         - dailySchedule: Array of objects with {time, task, completed: false}
         - recoverySteps: Array of strings with actionable advice
         - motivationalMessage: A single motivational string personalized to them
      
      Make your response detailed and tailored to their specific situation. Use a supportive, encouraging tone.
      DO NOT include any explanations or text outside the JSON structure.
    `;

    console.log("Using enhanced prompt template for better personalization");
    const response = await generateAIResponse(promptTemplate);
    
    if ('error' in response) {
      console.error("Error in AI response:", response.error);
      throw new Error(response.error || "Failed to generate AI response");
    }
    
    try {
      console.log("Parsing AI response");
      
      // The response should be a JSON object, either as a string or already parsed
      let planData: PlanData;
      
      // If the response is a string, try to parse it as JSON
      if (typeof response.text === 'string') {
        try {
          // Try to parse the response as JSON directly
          planData = JSON.parse(response.text);
        } catch (parseError) {
          // If direct parsing fails, try to find JSON in the text
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error("No JSON found in response:", response.text);
            throw new Error("Could not find valid JSON in the AI response");
          }
          
          const jsonStr = jsonMatch[0];
          console.log("JSON string to parse:", jsonStr.substring(0, 150) + "...");
          planData = JSON.parse(jsonStr);
        }
      } else {
        // If it's already an object, use it directly
        planData = response.text as unknown as PlanData;
      }
      
      // Validate the plan data
      if (!planData.dailySchedule || !planData.recoverySteps || !planData.motivationalMessage) {
        console.error("Invalid plan data structure:", planData);
        throw new Error("The AI response did not contain the expected data structure");
      }
      
      // Ensure tasks have the completed property set to false
      const dailySchedule = planData.dailySchedule.map(task => ({
        ...task,
        completed: false
      }));
      
      console.log("Plan generated successfully");
      return {
        dailySchedule: dailySchedule,
        recoverySteps: planData.recoverySteps || [],
        motivationalMessage: planData.motivationalMessage || 'Stay consistent with your plan!'
      };
    } catch (parseError: any) {
      console.error('Error parsing AI response:', parseError, "Full response:", response.text);
      throw new Error("Failed to parse AI response: " + parseError.message);
    }
  } catch (error: any) {
    console.error('Error generating personal plan:', error);
    return { error: error.message || 'Failed to generate personal plan' };
  }
};

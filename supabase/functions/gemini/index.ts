
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback function to generate a response locally
function generateFallbackResponse(prompt: string) {
  console.log("Using fallback response generator");
  
  // Extract any information about routine, goals, challenges, and habits from the prompt
  const routineMatch = prompt.match(/Daily Routine: ([^\n]+)/);
  const goalsMatch = prompt.match(/Goals: ([^\n]+)/);
  const challengesMatch = prompt.match(/Challenges: ([^\n]+)/);
  const habitsMatch = prompt.match(/Habits: ([^\n]+)/);
  
  const routine = routineMatch ? routineMatch[1] : 'Not provided';
  const goals = goalsMatch ? goalsMatch[1] : 'Not provided';
  const challenges = challengesMatch ? challengesMatch[1] : 'Not provided';
  const habits = habitsMatch ? habitsMatch[1] : 'Not provided';
  
  // Generate a simple but personalized response
  const dailySchedule = [
    {"time": "06:00 AM", "task": "Wake up & Morning Routine", "completed": false},
    {"time": "06:30 AM", "task": "Meditation / Mindfulness", "completed": false},
    {"time": "07:00 AM", "task": "Healthy breakfast", "completed": false},
    {"time": "08:00 AM", "task": "Exercise / Physical Activity", "completed": false},
    {"time": "09:30 AM", "task": "Work/Study Session 1", "completed": false},
    {"time": "12:00 PM", "task": "Lunch & short walk", "completed": false},
    {"time": "01:00 PM", "task": "Work/Study Session 2", "completed": false},
    {"time": "03:30 PM", "task": "Break - Healthy snack", "completed": false},
    {"time": "04:00 PM", "task": "Work/Study Session 3", "completed": false},
    {"time": "06:00 PM", "task": "Dinner preparation and eating", "completed": false},
    {"time": "07:30 PM", "task": "Personal time / Hobby", "completed": false},
    {"time": "09:30 PM", "task": "Evening wind down routine", "completed": false},
    {"time": "10:30 PM", "task": "Sleep", "completed": false}
  ];
  
  // Adjust first few tasks based on user input
  if (routine.toLowerCase().includes("sleep") && routine.toLowerCase().includes("4")) {
    dailySchedule[0].time = "08:00 AM";
    dailySchedule[1].time = "08:30 AM";
    dailySchedule[2].time = "09:00 AM";
    dailySchedule[3].time = "10:00 AM";
  }
  
  // Add a task related to habit
  if (habits.toLowerCase().includes("movie")) {
    dailySchedule[10].task = "Watch a movie / TV show (limited time)";
  }
  
  if (habits.toLowerCase().includes("walk")) {
    dailySchedule[7].task = "Go for a 30-minute walk";
  }
  
  // Generate recovery steps
  const recoverySteps = [
    "Establish a consistent sleep schedule - aim to be in bed by 10:30 PM and wake up at 6:30 AM.",
    "Ensure you eat regular, nutritious meals throughout the day.",
    "Schedule time for physical activity - even a 30-minute walk makes a difference.",
    "Set aside specific times for study/work with scheduled breaks.",
    "Limit screen time, especially before bed.",
    "Take time for activities you enjoy, but set clear boundaries.",
    "Practice mindfulness or meditation for at least 10 minutes each day.",
    "Connect with supportive friends or family regularly."
  ];
  
  // Add specific recovery steps based on challenges
  if (challenges.toLowerCase().includes("college")) {
    recoverySteps.push("Create a realistic college attendance schedule - commit to attending at least 3 days a week initially.");
  }
  
  if (challenges.toLowerCase().includes("meals")) {
    recoverySteps.push("Prepare simple meals in advance for days when motivation is low.");
  }
  
  // Generate motivational message
  let motivationalMessage = "You've taken the first step toward improving your life by seeking help. Each small change you make builds momentum toward a better future.";
  
  if (goals.includes("retrack")) {
    motivationalMessage = "Getting your life back on track starts with small daily actions. Each positive choice you make today is reshaping your future. You have the strength to rebuild your routine and reclaim your potential.";
  }
  
  return {
    dailySchedule,
    recoverySteps,
    motivationalMessage
  };
}

async function fetchGeminiResponse(prompt: string, apiKey: string) {
  console.log("Sending prompt to Gemini:", prompt.substring(0, 100) + "...");
  
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set or is empty");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    console.log("Making request to Gemini API...");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an AI life coach assistant for the FixYourLife app. You help users improve their daily routines, habits, and productivity.
                
                Based on the following information about a person, create a detailed daily schedule and personalized recovery plan:
                
                ${prompt}
                
                Respond with ONLY a valid JSON object containing:
                1. dailySchedule: An array of schedule items with time, task, and completed (boolean) fields
                2. recoverySteps: An array of string steps to follow for improving life quality
                3. motivationalMessage: A personalized motivational message
                
                Format your response as a proper JSON object without any explanation or additional text.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    console.log("Response received from Gemini API");
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
      console.error("Invalid response structure from Gemini:", JSON.stringify(data).substring(0, 200));
      throw new Error("Invalid response structure from Gemini");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response
    try {
      // Find JSON part of the response (Gemini might wrap it in explanation)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        return JSON.parse(jsonString);
      } else {
        console.error("No valid JSON found in response:", text);
        throw new Error("No valid JSON found in response");
      }
    } catch (jsonError) {
      console.error("Failed to parse JSON from response:", jsonError, text);
      throw new Error("Failed to parse JSON from response");
    }
  } catch (error) {
    console.error("Error in fetchGeminiResponse:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Gemini API key - using your provided key
    const apiKey = "AIzaSyC-oF2BLC-mm1r1eBFePxizWlHBTQrNEEU";
    
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    const { prompt } = requestData;
    
    if (!prompt) {
      console.error("No prompt provided in request");
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log("Processing prompt:", prompt.substring(0, 100) + "...");

    // Try to use the Gemini API
    let result;
    try {
      result = await fetchGeminiResponse(prompt, apiKey);
      console.log("Gemini response processed successfully");
    } catch (error) {
      // If API call fails, use the fallback function instead
      console.log("Using fallback response due to API error:", error.message);
      result = generateFallbackResponse(prompt);
    }

    // Return the result
    return new Response(
      JSON.stringify({ response: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    // In case of any other error, use the fallback and return it
    try {
      console.log("Using fallback response due to unhandled error");
      const requestData = await req.json();
      const fallbackData = generateFallbackResponse(requestData?.prompt || "");
      return new Response(
        JSON.stringify({ response: fallbackData }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (fallbackError) {
      // If even the fallback fails, return a clear error
      return new Response(
        JSON.stringify({ 
          error: error.message || 'An unknown error occurred',
          message: "Failed to generate response. Please try again later."
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  }
});

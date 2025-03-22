
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to fetch from openrouter.ai for DeepSeek model
async function fetchDeepSeekResponse(prompt: string, apiKey: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://fixyourlife.app',
      'X-Title': 'FixYourLife App',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1-zero',
      messages: [
        {
          role: 'system',
          content: `You are an AI life coach assistant for the FixYourLife app. You help users improve their daily routines, habits, and productivity.
          
          When asked to create a personalized plan, respond with a valid JSON object containing:
          1. dailySchedule: An array of schedule items with time, task, and completed (boolean) fields
          2. recoverySteps: An array of string steps to follow for improving life quality
          3. motivationalMessage: A personalized motivational message
          
          Format your response as a proper JSON object without markdown formatting, explanations or any other text.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter API error:', error);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the DeepSeek API key from environment variables
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set');
    }

    // Parse the request body
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log("Processing prompt:", prompt.substring(0, 100) + "...");

    // Fetch response from DeepSeek
    const response = await fetchDeepSeekResponse(prompt, apiKey);

    console.log("Response received, length:", response.length);

    // Return the response
    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

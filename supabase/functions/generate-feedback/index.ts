import { corsHeaders } from "../_shared/cors.ts";
import Together from "npm:together-ai@0.1.0";

// Constants for logging
const LOG_PREFIX = '[Edge Function]';

// Enhanced retry function with exponential backoff
async function retry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, initialDelay * Math.pow(2, attempt))
        );
      }
    }
  }
  
  throw lastError;
}

// Logging helper
function log(level: string, message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    prefix: LOG_PREFIX,
    message,
    ...data
  }));
}

// Validate response text
function isValidResponse(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  const placeholderPatterns = [
    /lorem ipsum/i,
    /\[.*\]/,
    /example/i,
    /placeholder/i,
    /your response/i,
    /your answer/i
  ];
  
  return !placeholderPatterns.some(pattern => pattern.test(text));
}

// Local feedback generator as fallback
function generateLocalFeedback(requestData: any) {
  const responses = Object.values(requestData.framework_steps_with_responses);
  const totalLength = responses.reduce((acc: number, curr: string) => acc + curr.length, 0);
  const avgLength = totalLength / responses.length;
  
  const score = Math.min(Math.max(Math.floor(avgLength / 50), 1), 5);
  
  return {
    overall_score: score,
    strengths: avgLength > 100 
      ? ["Provided detailed responses"] 
      : ["Attempted to answer the question"],
    areas_to_improve: avgLength < 100 
      ? ["Provide more detailed responses"] 
      : ["Continue practicing with more complex scenarios"],
    example_improvement: "Try to include specific examples and metrics in your responses",
    interview_readiness: score >= 4 
      ? "Ready for interviews - keep practicing to maintain skills"
      : "Need more practice - focus on thoroughly addressing each part of the framework"
  };
}

// Main handler
Serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Validate request data
    if (!requestData.question_text || !requestData.framework_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Check for invalid responses
    const hasInvalidResponses = Object.values(requestData.framework_steps_with_responses)
      .some(response => !isValidResponse(response));
    
    if (hasInvalidResponses) {
      return new Response(
        JSON.stringify({
          overall_score: 1,
          strengths: ["None - invalid response"],
          areas_to_improve: ["Provide actual answers instead of placeholder text"],
          example_improvement: "Replace placeholder text with real examples from your experience",
          interview_readiness: "Not ready - submit actual responses first"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Format responses for prompt
    const responsesText = Object.entries(requestData.framework_steps_with_responses)
      .map(([step, response]) => `${step}: "${response}"`)
      .join('\n');

    const prompt = `
Analyze this interview response and provide feedback in JSON format:

QUESTION: "${requestData.question_text}"
Framework: ${requestData.framework_name}
Category: ${requestData.category}
Difficulty: ${requestData.difficulty}

Responses:
${responsesText}

Be brutally honest and return ONLY valid JSON with this structure:
{
  "overall_score": number,
  "strengths": string[],
  "areas_to_improve": string[],
  "example_improvement": string,
  "interview_readiness": string
}`;

    try {
      const togetherApiKey = Deno.env.get("TOGETHER_LLM_API");
      if (!togetherApiKey) {
        throw new Error('Together AI API key not found');
      }

      const together = new Together(togetherApiKey);
      
      const response = await retry(async () => {
        return await together.chat.completions.create({
          model: "meta-llama/Llama-2-70b-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 800
        });
      });

      const content = response.choices[0].message.content;
      if (content) {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const feedback = JSON.parse(jsonMatch[0]);
            return new Response(
              JSON.stringify(feedback),
              {
                status: 200,
                headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json"
                }
              }
            );
          }
        } catch (parseError) {
          log('ERROR', 'Failed to parse Together AI response', { content });
          throw parseError;
        }
      }
      throw new Error('Invalid response from Together AI');
    } catch (error) {
      // If Together AI fails, use local feedback
      log('ERROR', 'Together AI request failed, using local feedback', { error: String(error) });
      const localFeedback = generateLocalFeedback(requestData);
      
      return new Response(
        JSON.stringify(localFeedback),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  } catch (error) {
    log('ERROR', 'Fatal error in edge function', { error: String(error) });
    
    // Final fallback - return a basic feedback response
    return new Response(
      JSON.stringify(generateLocalFeedback({
        question_text: "",
        framework_name: "",
        framework_steps_with_responses: {}
      })),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
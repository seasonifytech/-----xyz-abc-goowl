// Follow the edge function requirement to use correct imports
import { corsHeaders } from "../_shared/cors.ts";
import Together from "npm:together-ai@0.1.0";
import OpenAI from "npm:openai@4.28.0";

// Constants for logging
const LOG_PREFIX = '[Edge Function]';
const LOG_LEVELS = {
  INFO: '📝',
  WARN: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅'
} as const;

// Enhanced logging function
function log(level: keyof typeof LOG_LEVELS, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${LOG_LEVELS[level]} ${LOG_PREFIX} ${message}`);
  if (data) {
    console.log('Data:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  }
}

// Interface definitions
interface FeedbackRequest {
  question_text: string;
  framework_name: string;
  category: string;
  difficulty: string;
  framework_steps_with_responses: Record<string, string>;
}

interface FeedbackResponse {
  overall_score: number;
  strengths: string[];
  areas_to_improve: string[];
  example_improvement: string;
  interview_readiness: string;
}

// Local feedback generator as fallback
function generateFeedbackLocally(request: FeedbackRequest): FeedbackResponse {
  log('INFO', 'Generating local feedback', {
    question: request.question_text,
    framework: request.framework_name,
    category: request.category
  });
  
  // Calculate word count stats
  const wordCounts = Object.values(request.framework_steps_with_responses)
    .map(text => text.split(/\s+/).length);
  
  const avgWordCount = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
  
  log('INFO', 'Response statistics', {
    averageWords: avgWordCount.toFixed(1),
    totalWords,
    stepCount: Object.keys(request.framework_steps_with_responses).length
  });
  
  // Enhanced scoring based on word count and completeness
  let score = 3; // Default score
  const hasAllSteps = Object.values(request.framework_steps_with_responses).every(step => step.trim().length > 0);
  
  if (avgWordCount > 50 && hasAllSteps) {
    score = 5;
  } else if (avgWordCount > 30 && hasAllSteps) {
    score = 4;
  } else if (!hasAllSteps) {
    score = Math.max(2, score - 1); // Penalize for missing steps
  }
  
  // Framework-specific feedback
  const frameworkSpecificStrengths = {
    "STAR": [
      "Good use of the STAR framework with clear Situation, Task, Action, and Result sections",
      "Well-structured narrative that's easy to follow",
      "Effective demonstration of your skills through the STAR method"
    ],
    "PARADE": [
      "Comprehensive breakdown using the PARADE framework",
      "Thorough analysis of the problem and decision-making process",
      "Excellent reflection on your experience and learning"
    ],
    "CAR": [
      "Clear Context-Action-Result structure that highlights your contributions",
      "Concise and focused storytelling using the CAR framework",
      "Strong emphasis on measurable results"
    ],
    "CIRCLE": [
      "Methodical approach using the CIRCLE framework",
      "Detailed identification and reporting of the issue",
      "Well-evaluated solution with clear learnings"
    ]
  };
  
  const strengths = frameworkSpecificStrengths[request.framework_name as keyof typeof frameworkSpecificStrengths] || [
    "Clear structure using the framework",
    "Well-articulated response",
    "Addressed the key challenges in the question"
  ];
  
  return {
    overall_score: score,
    strengths: strengths,
    areas_to_improve: [
      "Could provide more specific examples",
      "Consider adding measurable outcomes",
      "Expand on technical details where appropriate"
    ],
    example_improvement: "When discussing the solution, include specific metrics or KPIs that would measure success. For example: 'I would track user engagement through daily active users and session duration to measure the effectiveness of the redesign.'",
    interview_readiness: "Your response shows good preparation and would likely be well-received in an actual interview. Continue practicing with varied questions to build confidence."
  };
}

// Enhanced retry function with exponential backoff and jitter
async function retry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3, 
  initialDelay = 1000,
  maxDelay = 10000
): Promise<T> {
  let lastError: Error | null = null;
  
  log('INFO', `Starting retry operation with max ${maxRetries} attempts`);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      log('WARN', `Retry attempt ${attempt + 1}/${maxRetries} failed`, {
        error: lastError.message,
        attempt: attempt + 1,
        maxRetries
      });
      
      if (attempt === maxRetries - 1) {
        log('ERROR', 'All retry attempts failed', {
          lastError: lastError.message,
          totalAttempts: maxRetries
        });
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const jitter = Math.random() * 200;
      const delay = Math.min(initialDelay * Math.pow(2, attempt) + jitter, maxDelay);
      log('INFO', `Waiting before next retry`, { delayMs: delay.toFixed(0) });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// Validate API keys before making requests
function validateApiKeys(): { togetherApiKey: string; openaiApiKey: string; } {
  log('INFO', 'Validating API keys');
  
  const togetherApiKey = Deno.env.get("TOGETHER_LLM_API");
  const openaiApiKey = Deno.env.get("OPEN_AI_API");
  
  log('INFO', 'API key status', {
    togetherApiAvailable: !!togetherApiKey,
    openaiApiAvailable: !!openaiApiKey
  });
  
  if (!togetherApiKey && !openaiApiKey) {
    log('ERROR', 'No API keys available for external LLM services');
    throw new Error("No API keys available for external LLM services");
  }
  
  return { togetherApiKey, openaiApiKey };
}

Deno.serve(async (req) => {
  log('INFO', 'Request received', {
    method: req.method,
    url: req.url,
    headers: {
      ...Object.fromEntries(req.headers.entries()),
      // Redact sensitive headers
      authorization: req.headers.get('authorization') ? '[REDACTED]' : undefined
    }
  });
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    log('INFO', 'Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        // Add Vary header to help with caching
        'Vary': 'Origin, Access-Control-Request-Headers'
      }
    });
  }
  
  try {
    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      log('WARN', 'Invalid content type', { contentType });
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        {
          status: 415,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Parse and validate request data
    const requestData: FeedbackRequest = await req.json();
    
    if (!requestData.question_text || !requestData.framework_name) {
      log('WARN', 'Invalid request data', {
        hasQuestion: !!requestData.question_text,
        hasFramework: !!requestData.framework_name
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          feedback: generateFeedbackLocally(requestData) // Provide fallback feedback
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Format responses for AI prompt
    const responsesText = Object.entries(requestData.framework_steps_with_responses)
      .map(([step, response]) => `${step}: ${response}`)
      .join('\n\n');
    
    // Create the prompt
    const prompt = `
You are a professional interview coach analyzing a user's response to an interview question.

QUESTION: "${requestData.question_text}"
FRAMEWORK USED: ${requestData.framework_name}
CATEGORY: ${requestData.category}
DIFFICULTY: ${requestData.difficulty}

USER RESPONSES:
${responsesText}

Based on the user's responses, provide feedback in the following JSON format:
{
  "overall_score": [number between 1-5, with 5 being the best],
  "strengths": [array of 2-3 specific strengths in their response],
  "areas_to_improve": [array of 2-3 specific areas to improve],
  "example_improvement": [a brief, specific example of how they could improve one point],
  "interview_readiness": [a 1-2 sentence assessment of how well this response would work in a real interview]
}

Ensure your feedback is constructive, specific to their responses, and focuses on both content and framework usage.
You MUST respond ONLY with valid JSON matching the format above.
`;
    
    try {
      // Validate API keys
      const { togetherApiKey, openaiApiKey } = validateApiKeys();
      
      let feedbackData: FeedbackResponse | null = null;
      
      // Try Together AI first if available
      if (togetherApiKey) {
        try {
          log('INFO', 'Attempting Together AI request');
          
          const together = new Together({ apiKey: togetherApiKey });
          
          const response = await retry(async () => {
            return await together.chat.completions.create({
              model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 800
            });
          });
          
          const content = response.choices[0].message.content;
          const jsonMatch = content.match(/({[\s\S]*})/);
          const jsonString = jsonMatch ? jsonMatch[0] : content;
          feedbackData = JSON.parse(jsonString);
        } catch (togetherError) {
          console.error("Together AI request failed:", togetherError);
          log('ERROR', 'Together AI request failed', {
            error: togetherError instanceof Error ? togetherError.message : String(togetherError)
          });
        }
      }
      
      // Try OpenAI if Together AI failed or wasn't available
      if (!feedbackData && openaiApiKey) {
        try {
          log('INFO', 'Attempting OpenAI request');
          
          const openai = new OpenAI({ apiKey: openaiApiKey });
          
          const completion = await retry(async () => {
            return await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 800
            });
          });
          
          const content = completion.choices[0].message.content;
          if (content) {
            const jsonMatch = content.match(/({[\s\S]*})/);
            const jsonString = jsonMatch ? jsonMatch[0] : content;
            feedbackData = JSON.parse(jsonString);
          }
        } catch (openaiError) {
          console.error("OpenAI request failed:", openaiError);
          log('ERROR', 'OpenAI request failed', {
            error: openaiError instanceof Error ? openaiError.message : String(openaiError)
          });
        }
      }
      
      // If both API calls failed or no APIs were available, use local feedback
      if (!feedbackData) {
        log('WARN', 'Using local feedback generation as fallback');
        feedbackData = generateFeedbackLocally(requestData);
      }
      
      // Validate and sanitize the feedback data
      const validatedFeedback: FeedbackResponse = {
        overall_score: Math.min(5, Math.max(1, feedbackData.overall_score)),
        strengths: Array.isArray(feedbackData.strengths) ? 
          feedbackData.strengths.slice(0, 3) : 
          generateFeedbackLocally(requestData).strengths,
        areas_to_improve: Array.isArray(feedbackData.areas_to_improve) ? 
          feedbackData.areas_to_improve.slice(0, 3) : 
          generateFeedbackLocally(requestData).areas_to_improve,
        example_improvement: typeof feedbackData.example_improvement === 'string' ? 
          feedbackData.example_improvement : 
          generateFeedbackLocally(requestData).example_improvement,
        interview_readiness: typeof feedbackData.interview_readiness === 'string' ? 
          feedbackData.interview_readiness : 
          generateFeedbackLocally(requestData).interview_readiness
      };

      log('SUCCESS', 'Generated feedback successfully', {
        score: validatedFeedback.overall_score,
        strengthsCount: validatedFeedback.strengths.length,
        areasToImproveCount: validatedFeedback.areas_to_improve.length
      });
      
      return new Response(
        JSON.stringify(validatedFeedback),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
      
    } catch (error) {
      log('ERROR', 'Error generating feedback', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Always return a valid response with fallback feedback
      const fallbackFeedback = generateFeedbackLocally(requestData);
      
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
          feedback: fallbackFeedback
        }),
        {
          status: 200, // Still return 200 to ensure the client gets usable feedback
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    log('ERROR', 'Fatal error in edge function', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return a safe response even if we can't parse the request
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        feedback: {
          overall_score: 3,
          strengths: ["Unable to generate detailed feedback at this time"],
          areas_to_improve: ["Please try again later"],
          example_improvement: "Service temporarily unavailable",
          interview_readiness: "We're experiencing technical difficulties with our feedback system."
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
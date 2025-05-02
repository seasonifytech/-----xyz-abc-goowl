import { supabase } from '../lib/supabase';

// Maximum retries for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Timeout for edge function calls (15 seconds)
const EDGE_FUNCTION_TIMEOUT = 15000;

export interface FeedbackRequest {
  question_text: string;
  framework_name: string;
  category: string;
  difficulty: string;
  framework_steps_with_responses: Record<string, string>;
}

export interface FeedbackResponse {
  overall_score: number;
  strengths: string[];
  areas_to_improve: string[];
  example_improvement: string;
  interview_readiness: string;
}

// Enhanced local feedback generator
function generateLocalFeedback(request: FeedbackRequest): FeedbackResponse {
  console.log('Generating local feedback for:', {
    question: request.question_text,
    framework: request.framework_name,
    category: request.category,
    steps: Object.keys(request.framework_steps_with_responses)
  });
  
  // Calculate feedback score based on response length and completeness
  const responses = request.framework_steps_with_responses;
  const totalWords = Object.values(responses).reduce((sum, text) => {
    return sum + (text.trim().split(/\s+/).length || 0);
  }, 0);
  const avgWords = totalWords / Object.keys(responses).length;
  const hasAllSteps = Object.values(responses).every(step => step.trim().length > 0);
  
  let score = 3;
  if (avgWords > 60 && hasAllSteps) score = 5;
  else if (avgWords > 40 && hasAllSteps) score = 4;
  else if (!hasAllSteps) score = Math.max(2, score - 1);
  
  console.log(`Local feedback generated with score ${score} (avg words: ${avgWords.toFixed(1)}, all steps completed: ${hasAllSteps})`);
  
  // Framework-specific strengths
  const frameworkSpecificStrengths: Record<string, string[]> = {
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
  
  const strengths = frameworkSpecificStrengths[request.framework_name] || [
    "Clear structure using the framework",
    "Well-articulated response",
    "Addressed the key challenges in the question"
  ];
  
  return {
    overall_score: score,
    strengths: strengths,
    areas_to_improve: [
      "Add more specific examples from your experience",
      "Quantify your achievements with metrics",
      "Be more concise in your explanations"
    ],
    example_improvement: "When describing your actions, include the specific steps you took and why you chose them. For example: 'I decided to implement A/B testing because it would allow us to validate our hypothesis with real user data before committing to a full rollout.'",
    interview_readiness: "Your response is structured well and shows good preparation. Continue practicing with varied questions to build confidence and improve your storytelling."
  };
}

export async function generateFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
  try {
    console.log('Generating feedback for request:', {
      question: request.question_text,
      framework: request.framework_name,
      category: request.category,
      steps: Object.keys(request.framework_steps_with_responses)
    });
    
    // Generate local feedback first as a reliable fallback
    console.log('Generating feedback locally first...');
    const localFeedback = generateLocalFeedback(request);
    
    // Check for network connectivity before trying to call the Edge Function
    if (!navigator.onLine) {
      console.log('No network connection detected. Using local feedback.');
      return localFeedback;
    }
    
    // Try to use Supabase Edge Function but handle network errors gracefully
    try {
      console.log('Trying to call Supabase Edge Function...');
      
      // Validate Supabase client and configuration
      if (!supabase || !supabase.functions) {
        throw new Error('Supabase client not properly initialized');
      }
      
      let retryCount = 0;
      let lastError: Error | null = null;
      
      // Add custom headers for better error tracking
      const customHeaders = {
        'x-client-info': 'feedbackService/1.0',
        'Content-Type': 'application/json'
      };
      
      while (retryCount < MAX_RETRIES) {
        try {
          const { data, error } = await Promise.race([
            supabase.functions.invoke('generate-feedback', {
              body: request,
              headers: customHeaders
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Edge function timeout')), EDGE_FUNCTION_TIMEOUT)
            )
          ]);
          
          if (error) {
            console.error('Edge function error:', {
              message: error.message,
              status: error.status,
              statusText: error.statusText,
              details: error.details
            });
            throw error;
          }
          
          if (!data) {
            throw new Error('Edge function returned no data');
          }
          
          // Validate the response data
          const feedback = data as FeedbackResponse;
          if (
            typeof feedback.overall_score !== 'number' ||
            !Array.isArray(feedback.strengths) ||
            !Array.isArray(feedback.areas_to_improve) ||
            typeof feedback.example_improvement !== 'string' ||
            typeof feedback.interview_readiness !== 'string'
          ) {
            throw new Error('Invalid feedback data structure received from edge function');
          }
          
          console.log('Edge function returned valid feedback with score:', feedback.overall_score);
          return feedback;
          
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`Attempt ${retryCount + 1} failed:`, lastError);
          
          if (retryCount < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
          } else {
            break;
          }
        }
      }
      
      // If we get here, all retries failed
      if (lastError) {
        throw lastError;
      }
      
    } catch (fetchError) {
      // Handle any fetch errors and return local feedback
      console.error('Fetch error when calling edge function:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      console.error('Network error details:', errorMessage);
      
      // Log more details if it's a TypeError (which "Failed to fetch" is)
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        console.error('This appears to be a network connectivity issue or CORS problem.');
        console.log('Edge function may not be properly deployed or accessible.');
      }
      
      console.log('Using locally generated feedback due to fetch error');
      return localFeedback;
    }
    
    // Fallback to local feedback if we somehow get here
    return localFeedback;
    
  } catch (error) {
    // Catch any other errors in the overall function
    console.error('Error in feedback service:', error);
    return {
      overall_score: 3,
      strengths: ["Unable to generate detailed feedback at this time"],
      areas_to_improve: ["Please try again later"],
      example_improvement: "Service temporarily unavailable",
      interview_readiness: "We're experiencing technical difficulties with our feedback system."
    };
  }
}
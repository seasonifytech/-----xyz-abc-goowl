import { supabase } from '../lib/supabase';
 
const EDGE_FUNCTION_TIMEOUT = 15000;
const TOGETHER_API_KEY = 'c4e4469e10b25ba1fff80ddd5f4db2747b10e95daf4def5019ac43fd9818fda6';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Keywords for different categories
const KEYWORDS = {
  teamwork: ['team', 'collaborate', 'coordinate', 'communicate', 'delegate', 'lead'],
  problemSolving: ['solve', 'analyze', 'solution', 'resolve', 'implement', 'improve'],
  leadership: ['lead', 'guide', 'mentor', 'manage', 'direct', 'initiative'],
  technical: ['develop', 'code', 'design', 'architect', 'test', 'debug'],
  communication: ['present', 'explain', 'discuss', 'negotiate', 'document', 'share']
};

// Sentiment words
const SENTIMENT = {
  positive: ['successful', 'improved', 'achieved', 'effective', 'efficient', 'beneficial'],
  negative: ['failed', 'difficult', 'problem', 'challenge', 'issue', 'mistake'],
  learning: ['learned', 'discovered', 'realized', 'understood', 'gained', 'adapted']
};

// Log feedback attempt to Supabase
async function logFeedbackAttempt(
  request: FeedbackRequest,
  source: 'edge' | 'api' | 'local',
  response?: FeedbackResponse,
  error?: Error
): Promise<void> {
  try {
    await supabase.from('feedback_logs').insert({
      request_data: request,
      response_data: response || null,
      error: error?.message || null,
      source,
      success: !error && !!response
    });
  } catch (logError) {
    console.error('Failed to log feedback attempt:', logError);
  }
}
 
export interface FeedbackRequest {
  question_text: string;
  framework_name: string;
  framework_steps_with_responses: Record<string, string>;
}

export interface FeedbackResponse {
  overall_score: number;
  strengths: string[];
  areas_to_improve: string[];
  example_improvement: string;
  interview_readiness: string;
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Rate feedback
export async function rateFeedback(feedbackLogId: string, helpful: boolean): Promise<void> {
  try {
    await supabase.from('feedback_ratings').insert({
      feedback_log_id: feedbackLogId,
      helpful
    });
  } catch (error) {
    console.error('Failed to save feedback rating:', error);
  }
}

// Analyze response content
function analyzeContent(text: string, category?: string): {
  keywordMatches: string[];
  sentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
  hasExamples: boolean;
  specificity: number;
} {
  const lowerText = text.toLowerCase();
  
  // Check for keywords based on category
  const relevantKeywords = category ? 
    KEYWORDS[category as keyof typeof KEYWORDS] || Object.values(KEYWORDS).flat() :
    Object.values(KEYWORDS).flat();
  
  const keywordMatches = relevantKeywords.filter(word => lowerText.includes(word));
  
  // Analyze sentiment
  const positiveCount = SENTIMENT.positive.filter(word => lowerText.includes(word)).length;
  const negativeCount = SENTIMENT.negative.filter(word => lowerText.includes(word)).length;
  const learningCount = SENTIMENT.learning.filter(word => lowerText.includes(word)).length;
  
  let sentiment: 'positive' | 'negative' | 'mixed' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  else if (positiveCount > 0 && negativeCount > 0) sentiment = 'mixed';
  
  // Check for examples (looking for phrases that often introduce examples)
  const hasExamples = /for (example|instance)|such as|like when|specifically|in particular/i.test(text);
  
  // Calculate specificity score based on presence of numbers, dates, and proper nouns
  const specificity = (
    (text.match(/\d+/g)?.length || 0) + // Numbers
    (text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g)?.length || 0) + // Months
    (text.match(/[A-Z][a-z]+/g)?.length || 0) // Proper nouns (simplified check)
  );
  
  return {
    keywordMatches,
    sentiment,
    hasExamples,
    specificity
  };
}

// Local feedback generator as final fallback
function generateLocalFeedback(request: FeedbackRequest): FeedbackResponse {
  console.log('Generating local feedback for request:', request);
  
  const responses = Object.values(request.framework_steps_with_responses);
  let scores = {
    contentQuality: 0,
    relevance: 0,
    specificity: 0,
    framework: 0
  };
  const strengths: string[] = [];
  const areasToImprove: string[] = [];
  
  // Analyze each response
  responses.forEach((response, index) => {
    const analysis = analyzeContent(response, request.category);
    
    // Content Quality (0-5 points)
    const contentScore = response.length > 200 ? 5 : 
                        response.length > 150 ? 4 :
                        response.length > 100 ? 3 :
                        response.length > 50 ? 2 : 1;
    scores.contentQuality += contentScore;
    
    // Relevance Score (0-5 points)
    const relevanceScore = analysis.keywordMatches.length >= 5 ? 5 :
                          analysis.keywordMatches.length >= 4 ? 4 :
                          analysis.keywordMatches.length >= 3 ? 3 :
                          analysis.keywordMatches.length >= 2 ? 2 : 1;
    scores.relevance += relevanceScore;
    
    // Specificity Score (0-5 points)
    const specificityScore = (analysis.hasExamples && analysis.specificity >= 5) ? 5 :
                           (analysis.hasExamples && analysis.specificity >= 3) ? 4 :
                           (analysis.hasExamples && analysis.specificity >= 1) ? 3 :
                           analysis.hasExamples ? 2 : 1;
    scores.specificity += specificityScore;
    
    // Framework Usage Score (0-5 points)
    // Check if response is unique and relevant to its section
    const otherResponses = responses.filter((_, i) => i !== index);
    const isUnique = !otherResponses.some(other => 
      response.toLowerCase().includes(other.toLowerCase()) ||
      other.toLowerCase().includes(response.toLowerCase())
    );
    scores.framework += isUnique ? 5 : 1;
    
    // Add specific feedback
    if (analysis.keywordMatches.length > 2) {
      strengths.push(`Good use of relevant terms in step ${index + 1}`);
    }
    if (analysis.hasExamples) {
      strengths.push(`Provided concrete examples in step ${index + 1}`);
    }
    if (response.length < 100) {
      areasToImprove.push(`Expand your response in step ${index + 1}`);
    }
    if (!analysis.hasExamples) {
      areasToImprove.push(`Include specific examples in step ${index + 1}`);
    }
  });
  
  // Calculate weighted average score (1-5 scale)
  const weights = {
    contentQuality: 0.25,
    relevance: 0.25,
    specificity: 0.25,
    framework: 0.25
  };

  const avgScores = {
    contentQuality: scores.contentQuality / responses.length,
    relevance: scores.relevance / responses.length,
    specificity: scores.specificity / responses.length,
    framework: scores.framework / responses.length
  };

  const finalScore = Math.round(
    (avgScores.contentQuality * weights.contentQuality +
     avgScores.relevance * weights.relevance +
     avgScores.specificity * weights.specificity +
     avgScores.framework * weights.framework)
  );
  
  return {
    overall_score: finalScore,
    strengths: strengths.length > 0 ? strengths : ["Attempted to answer all parts of the question"],
    areas_to_improve: areasToImprove.length > 0 ? areasToImprove : ["Focus on providing more detailed responses"],
    example_improvement: finalScore < 4 ?
      "Instead of saying 'I led the team', say 'I led a team of 5 developers to deliver a critical payment feature, resulting in 20% faster transaction processing'" :
      "Your responses are good, but try quantifying your impact even more, e.g., 'Reduced system latency by 35% by implementing Redis caching'",
    interview_readiness: finalScore >= 4 ?
      "You're well-prepared for interviews. Keep practicing to maintain this level." :
      finalScore >= 3 ?
      "You're on the right track. Focus on adding more specific examples and metrics." :
      "More practice needed. Try to structure your responses with concrete examples and measurable outcomes."
  };
}

async function callTogetherAPI(request: FeedbackRequest): Promise<FeedbackResponse> {
  console.log('Calling Together API with request:', request);
  
  const responsesText = Object.entries(request.framework_steps_with_responses)
    .map(([step, response]) => `${step}: "${response}"`)
    .join('\n');

  const prompt = `
Analyze this interview response and provide feedback in JSON format:

QUESTION: "${request.question_text}"
Framework: ${request.framework_name}

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

  const response = await retryWithBackoff(async () => {
    const result = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-235B-A22B-fp8-tput',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!result.ok) {
      throw new Error(`Together API request failed: ${result.status}`);
    }

    return result;
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    throw new Error('Failed to parse Together API response');
  }
}

export async function generateFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
  // Validate input
  console.log('Starting feedback generation for request:', request);
  
  if (!request.question_text?.trim() || !request.framework_name?.trim()) {
    const invalidResponse = {
      overall_score: 1,
      strengths: ["None - invalid submission"],
      areas_to_improve: ["Submit a valid response that actually answers the question"],
      example_improvement: "You need to provide an actual answer before getting feedback",
      interview_readiness: "Not ready for interviews - no valid response provided"
    };
    
    await logFeedbackAttempt(request, 'local', invalidResponse);
    return invalidResponse;
  }

  try {
    // Try Supabase Edge Function with retries
    if (supabase?.functions) {
      try {
        console.log('Attempting to use Supabase Edge Function');
        
        const { data, error } = await retryWithBackoff(async () => {
          const result = await Promise.race([
            supabase.functions.invoke('generate-feedback', {
              body: request
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Feedback generation timeout')), EDGE_FUNCTION_TIMEOUT)
            )
          ]);
          
          if (error) {
            console.warn('Edge function error:', error);
            throw error;
          }
          
          return result;
        });

        if (data) {
          const feedback = data as FeedbackResponse;
          if (
            typeof feedback.overall_score === 'number' &&
            Array.isArray(feedback.strengths) &&
            Array.isArray(feedback.areas_to_improve) &&
            typeof feedback.example_improvement === 'string' &&
            typeof feedback.interview_readiness === 'string'
          ) {
            console.log('Successfully generated feedback using Edge Function');
            await logFeedbackAttempt(request, 'edge', feedback);
            return feedback;
          }
        }
        throw new Error('Invalid feedback response format');
      } catch (error) {
        console.warn('Supabase Edge Function failed after retries, falling back to direct API call:', error);
      }
    }

    // Try direct Together API call as fallback
    try {
      console.log('Attempting to call Together API directly');
      const feedback = await callTogetherAPI(request);
      console.log('Successfully generated feedback using Together API');
      await logFeedbackAttempt(request, 'api', feedback);
      return feedback;
    } catch (error) {
      console.warn('Together API call failed, falling back to local feedback:', error);
    }

    // Use local feedback as final fallback
    const localFeedback = generateLocalFeedback(request);
    await logFeedbackAttempt(request, 'local', localFeedback);
    return localFeedback;

  } catch (error) {
    console.error('All feedback generation methods failed:', error);
    return generateLocalFeedback(request);
  }
}
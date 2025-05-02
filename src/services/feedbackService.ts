import { supabase } from '../lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
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

// 🔧 Together API fallback
async function generateTogetherAIResponse(request: FeedbackRequest): Promise<FeedbackResponse> {
  const prompt = `You are an expert interviewer. Based on the following behavioral interview question and candidate's responses, analyze and return:

- overall_score: number out of 5
- strengths: array of 3 strings
- areas_to_improve: array of 3 strings
- example_improvement: one specific sentence
- interview_readiness: one sentence

Question: ${request.question_text}
Framework: ${request.framework_name}
Category: ${request.category}
Difficulty: ${request.difficulty}
Responses:\n${Object.entries(request.framework_steps_with_responses)
    .map(([step, response]) => `${step}: ${response}`)
    .join('\n')}

Return only JSON with keys: overall_score, strengths, areas_to_improve, example_improvement, interview_readiness.`;

  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer c4e4469e10b25ba1fff80ddd5f4db2747b10e95daf4def5019ac43fd9818fda6',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen3-235B-A22B-fp8-tput',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) throw new Error(`Together API failed with status ${res.status}`);

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from Together API');

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse Together API JSON:', content);
    throw new Error('Invalid JSON from Together API');
  }
}

// 🧠 Local fallback (no static responses)
function generateLocalFeedback(request: FeedbackRequest): FeedbackResponse {
  const responses = request.framework_steps_with_responses;
  const nonEmpty = Object.values(responses).filter(r => r.trim().length > 0);
  const totalWords = nonEmpty.reduce((sum, r) => sum + r.trim().split(/\s+/).length, 0);
  const avgWords = nonEmpty.length ? totalWords / nonEmpty.length : 0;
  const complete = Object.values(responses).every(r => r.trim().length > 0);

  let score = 3;
  if (avgWords > 60 && complete) score = 5;
  else if (avgWords > 40 && complete) score = 4;
  else if (!complete) score = Math.max(2, score - 1);

  return {
    overall_score: score,
    strengths: [
      `Responses are clear and average around ${avgWords.toFixed(1)} words.`,
      complete ? "All framework steps were addressed." : "Some steps may be missing.",
      avgWords > 50 ? "Detailed storytelling shows thoughtfulness." : "Concise but may lack depth."
    ],
    areas_to_improve: [
      "Consider using specific examples to demonstrate impact.",
      "Try to quantify outcomes where possible.",
      "Ensure each framework step is clearly answered."
    ],
    example_improvement: "Include metrics like 'reduced onboarding time by 30%' to show impact.",
    interview_readiness: `You are ${score >= 4 ? 'well' : 'moderately'} prepared. Continue practicing for stronger results.`
  };
}

// 🎯 Main generator
export async function generateFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
  console.log('Generating feedback for:', request);

  const localFallback = () => generateLocalFeedback(request);

  if (!navigator.onLine) {
    console.warn('Offline: using local feedback.');
    return localFallback();
  }

  // First try Supabase
  try {
    if (!supabase || !supabase.functions) throw new Error('Supabase client missing');
    const headers = { 'x-client-info': 'feedbackService/1.0', 'Content-Type': 'application/json' };
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const { data, error } = await Promise.race([
          supabase.functions.invoke('generate-feedback', { body: request, headers }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), EDGE_FUNCTION_TIMEOUT))
        ]);

        if (error) throw error;
        if (!data) throw new Error('No data from edge function');

        const feedback = data as FeedbackResponse;
        if (typeof feedback.overall_score === 'number' && Array.isArray(feedback.strengths)) {
          return feedback;
        }
        throw new Error('Invalid feedback structure');

      } catch (err) {
        console.error(`Supabase try ${attempt + 1} failed:`, err);
        if (++attempt < MAX_RETRIES) await new Promise(res => setTimeout(res, RETRY_DELAY * 2 ** attempt));
      }
    }
  } catch (supabaseErr) {
    console.error('Supabase call failed completely:', supabaseErr);
  }

  // Fallback to Together API
  try {
    console.log('Trying Together API fallback...');
    return await generateTogetherAIResponse(request);
  } catch (togetherErr) {
    console.error('Together API failed:', togetherErr);
  }

  // Final fallback to local heuristic
  console.warn('All remote services failed. Using local feedback.');
  return localFallback();
}

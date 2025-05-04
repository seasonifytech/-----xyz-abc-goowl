import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type CommunityAnswer = Database['public']['Tables']['community_answers']['Row'];

// Constants
const FETCH_MULTIPLIER = 3; // Fetch more questions for better randomization

export type Question = Database['public']['Tables']['interview_questions']['Row'];

// Mock data in case the API fails or returns empty
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'Design an alarm clock for blind people',
    category: 'Behavioral',
    difficulty: 'medium',
    created_at: new Date().toISOString(),
    created_by: null,
    job_role: 'Product Management',
    company: 'Google',
    answer_brief: null,
    prompt_answer: null
  },
  {
    id: '2',
    question: 'Tell me about a time you failed and what you learned from it',
    category: 'Behavioral',
    difficulty: 'easy',
    created_at: new Date().toISOString(),
    created_by: null,
    job_role: 'Software Engineering',
    company: 'Apple',
    answer_brief: null,
    prompt_answer: null
  },
  {
    id: '3',
    question: 'How would you design a recommendation system for a streaming platform?',
    category: 'Technical',
    difficulty: 'hard',
    created_at: new Date().toISOString(),
    created_by: null,
    job_role: 'Data Science',
    company: 'Netflix',
    answer_brief: null,
    prompt_answer: null
  }
];

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function fetchAndFilterQuestions(
  query: any,
  limit: number,
  excludeIds: string[] = []
): Promise<Question[]> {
  // Fetch more questions than needed for better randomization
  const fetchLimit = limit * FETCH_MULTIPLIER;
  
  // Exclude already seen questions
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(fetchLimit);
  
  if (error || !data || data.length === 0) {
    return MOCK_QUESTIONS;
  }
  
  // Shuffle and trim to requested limit
  return shuffleArray(data).slice(0, limit);
}

export async function getRandomQuestions(limit = 10, excludeIds: string[] = []): Promise<Question[]> {
  try {
    console.log(`Fetching random questions (excluding ${excludeIds.length} seen questions)...`);

    let query = supabase
      .from('interview_questions')
      .select('*');

    const questions = await fetchAndFilterQuestions(query, limit, excludeIds);
    console.log(`Successfully fetched ${questions.length} random questions`);
    return questions;
  } catch (err) {
    console.error('Unexpected error fetching questions:', err);
    return MOCK_QUESTIONS;
  }
}

export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    console.log(`Fetching question with ID: ${id}`);
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching question with ID ${id}:`, error);
      // Return first mock question if ID is not found
      return MOCK_QUESTIONS[0];
    }

    console.log('Successfully fetched question details');
    return data;
  } catch (err) {
    console.error(`Unexpected error fetching question ${id}:`, err);
    return MOCK_QUESTIONS[0];
  }
}

export async function getCompanyQuestions(
  company: string, 
  limit = 10, 
  excludeIds: string[] = []
): Promise<Question[]> {
  try {
    console.log(`Fetching questions for company: ${company} (excluding ${excludeIds.length} seen questions)`);
    
    let query = supabase
      .from('interview_questions')
      .select('*')
      .eq('company', company)
      .order('created_at', { ascending: false });

    const questions = await fetchAndFilterQuestions(query, limit, excludeIds);
    console.log(`Successfully fetched ${questions.length} questions for company ${company}`);
    return questions;
  } catch (err) {
    console.error(`Unexpected error fetching company questions for ${company}:`, err);
    return MOCK_QUESTIONS;
  }
}

export async function getFilteredQuestions(
  filters: {
    category?: string;
    difficulty?: string;
    company?: string;
  },
  limit = 10,
  excludeIds: string[] = []
): Promise<Question[]> {
  try {
    console.log(`Fetching filtered questions with filters: ${JSON.stringify(filters)} (excluding ${excludeIds.length} seen questions)`);
    
    // If company filter is present, use the dedicated company function
    if (filters.company && Object.keys(filters).length === 1) {
      return await getCompanyQuestions(filters.company, limit, excludeIds);
    }
    
    let query = supabase.from('interview_questions').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.company) {
      query = query.eq('company', filters.company);
    }

    const questions = await fetchAndFilterQuestions(query, limit, excludeIds);
    
    // If no results with strict filters, try with looser criteria
    if (questions.length === 0) {
      console.log('No questions found with strict filters, trying looser criteria...');
      
      // Try with just company if specified
      if (filters.company) {
        console.log(`Trying with just company filter: ${filters.company}`);
        return await getCompanyQuestions(filters.company, limit, excludeIds);
      }
      
      // Try with just category if specified
      if (filters.category) {
        console.log(`Trying with just category filter: ${filters.category}`);
        
        let categoryQuery = supabase
          .from('interview_questions')
          .select('*')
          .eq('category', filters.category)
          .order('created_at', { ascending: false });

        return await fetchAndFilterQuestions(categoryQuery, limit, excludeIds);
      }
      return MOCK_QUESTIONS;
    }

    console.log(`Successfully fetched ${data.length} filtered questions`);
    return data;
  } catch (err) {
    console.error('Unexpected error fetching filtered questions:', err);
    return MOCK_QUESTIONS;
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    console.log('Fetching categories...');
    const { data, error } = await supabase
      .from('interview_questions')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', error);
      return ['Behavioral', 'Technical', 'Product Management'];
    }

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
    console.log(`Successfully fetched ${categories.length} categories`);
    
    if (categories.length === 0) {
      return ['Behavioral', 'Technical', 'Product Management'];
    }
    
    return categories as string[];
  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    return ['Behavioral', 'Technical', 'Product Management'];
  }
}

export async function getCompanies(): Promise<string[]> {
  try {
    console.log('Fetching companies...');
    const { data, error } = await supabase
      .from('interview_questions')
      .select('company')
      .not('company', 'is', null);

    if (error) {
      console.error('Error fetching companies:', error);
      return ['Google', 'Apple', 'Meta', 'Amazon', 'Microsoft', 'Netflix'];
    }

    // Extract unique companies
    const companies = [...new Set(data.map(item => item.company).filter(Boolean))];
    console.log(`Successfully fetched ${companies.length} companies`);
    
    if (companies.length === 0) {
      return ['Google', 'Apple', 'Meta', 'Amazon', 'Microsoft', 'Netflix'];
    }
    
    return companies as string[];
  } catch (err) {
    console.error('Unexpected error fetching companies:', err);
    return ['Google', 'Apple', 'Meta', 'Amazon', 'Microsoft', 'Netflix'];
  }
}

export async function incrementViewCount(questionId: string): Promise<void> {
  try {
    console.log(`Incrementing view count for question ${questionId}`);
    await supabase.rpc('increment_views', { question_id: questionId });
  } catch (err) {
    console.error(`Error incrementing view count for question ${questionId}:`, err);
  }
}

export async function getCommunityAnswers(questionId: string): Promise<CommunityAnswer[]> {
  try {
    console.log(`Fetching community answers for question ${questionId}`);
    const { data, error } = await supabase
      .from('community_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('upvotes', { ascending: false });

    if (error) {
      console.error(`Error fetching community answers for question ${questionId}:`, error);
      return [];
    }

    return data;
  } catch (err) {
    console.error(`Error fetching community answers for question ${questionId}:`, err);
    return [];
  }
}

export async function submitCommunityAnswer(
  questionId: string,
  answer: string
): Promise<CommunityAnswer | null> {
  try {
    console.log(`Submitting community answer for question ${questionId}`);
    const { data, error } = await supabase
      .from('community_answers')
      .insert([{ question_id: questionId, answer }])
      .select()
      .single();

    if (error) {
      console.error(`Error submitting community answer for question ${questionId}:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Error submitting community answer for question ${questionId}:`, err);
    return null;
  }
}

export async function upvoteAnswer(answerId: string): Promise<void> {
  try {
    console.log(`Upvoting answer ${answerId}`);
    await supabase
      .from('community_answers')
      .update({ upvotes: supabase.rpc('increment') })
      .eq('id', answerId);
  } catch (err) {
    console.error(`Error upvoting answer ${answerId}:`, err);
  }
}
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

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

export async function getRandomQuestions(limit = 10, excludeIds: string[] = []): Promise<Question[]> {
  try {
    console.log(`Fetching random questions (excluding ${excludeIds.length} seen questions)...`);
    
    // Check if we have an active session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session state:', session ? 'Active' : 'No session');
    
    let query = supabase
      .from('interview_questions')
      .select('*');
    
    // Exclude already seen questions if there are any
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    // Add randomization and limit
    query = query.order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    console.log('Random questions query result:', { data: data?.length || 0, error });

    if (error) {
      console.error('Error fetching questions:', error);
      return MOCK_QUESTIONS;
    }

    if (!data || data.length === 0) {
      console.warn('No questions found, returning mock data');
      return MOCK_QUESTIONS;
    }

    console.log(`Successfully fetched ${data.length} questions`);
    return data;
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
      .eq('company', company);
    
    // Exclude already seen questions if there are any
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    query = query.limit(limit);
    
    const { data, error } = await query;

    console.log('Company questions query result:', { company, dataLength: data?.length || 0, error });

    if (error) {
      console.error(`Error fetching questions for company ${company}:`, error);
      return MOCK_QUESTIONS;
    }

    if (!data || data.length === 0) {
      console.warn(`No questions found for company ${company}, returning mock data`);
      return MOCK_QUESTIONS;
    }

    console.log(`Successfully fetched ${data.length} questions for company ${company}`);
    return data;
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
    
    // Exclude already seen questions if there are any
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching filtered questions:', error);
      return MOCK_QUESTIONS;
    }

    // If no results with strict filters, try with just one filter
    if (!data || data.length === 0) {
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
          .eq('category', filters.category);
        
        // Exclude already seen questions if there are any
        if (excludeIds.length > 0) {
          categoryQuery = categoryQuery.not('id', 'in', `(${excludeIds.join(',')})`);
        }
        
        categoryQuery = categoryQuery.limit(limit);
        
        const { data: categoryData, error: categoryError } = await categoryQuery;

        if (!categoryError && categoryData && categoryData.length > 0) {
          console.log(`Found ${categoryData.length} questions with category filter`);
          return categoryData;
        }
      }
      
      console.log('No questions found with any filters, returning mock data');
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
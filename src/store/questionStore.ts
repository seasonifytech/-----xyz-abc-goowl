import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getFilteredQuestions, 
  getQuestionById, 
  getRandomQuestions, 
  getCompanyQuestions,
  type Question 
} from '../services/questionService';

interface QuestionState {
  currentQuestion: Question | null;
  questionList: Question[];
  loadingQuestions: boolean;
  filters: {
    category?: string;
    difficulty?: string;
    company?: string;
  };
  loadingQuestion: boolean;
  responses: Record<string, Record<string, string>>;
  error: string | null;
  seenQuestions: string[]; // Track questions that have been seen
  
  // Actions
  setFilters: (filters: QuestionState['filters']) => void;
  fetchQuestions: () => Promise<void>;
  fetchCompanyQuestions: (company: string) => Promise<void>;
  fetchQuestion: (id: string) => Promise<void>;
  setResponse: (questionId: string, step: string, response: string) => void;
  getResponsesForQuestion: (questionId: string) => Record<string, string>;
  clearResponses: (questionId: string) => void;
  clearError: () => void;
  addToSeenQuestions: (questionId: string) => void;
  clearSeenQuestions: () => void;
}

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      currentQuestion: null,
      questionList: [],
      loadingQuestions: false,
      loadingQuestion: false,
      filters: {},
      responses: {},
      error: null,
      seenQuestions: [], // Initialize empty array of seen questions
      
      setFilters: (filters) => {
        console.log('Setting filters:', filters);
        set({ filters });
      },
      
      fetchQuestions: async () => {
        try {
          console.log('Starting to fetch questions...');
          set({ loadingQuestions: true, error: null });
          const filters = get().filters;
          const seenQuestions = get().seenQuestions;
          const currentQuestion = get().currentQuestion;
          
          console.log(`Excluding ${seenQuestions.length} previously seen questions`);
          
          let questions: Question[];
          if (Object.keys(filters).length > 0) {
            console.log('Fetching filtered questions with:', filters);
            // Check if we're filtering by company only
            if (filters.company && Object.keys(filters).length === 1) {
              questions = await getCompanyQuestions(filters.company, 10, seenQuestions);
            } else {
              questions = await getFilteredQuestions(filters, 10, seenQuestions);
            }
          } else {
            console.log('Fetching random questions');
            questions = await getRandomQuestions(10, seenQuestions);
          }
          
          console.log(`Fetched ${questions.length} questions successfully`);
          
          // If we have no questions after excluding seen ones, clear the history and try again
          if (questions.length === 0 && seenQuestions.length > 0) {
            console.log('No new questions available, clearing history and fetching again');
            set({ seenQuestions: [] });
            
            // Try fetching again without the seenQuestions filter
            if (Object.keys(filters).length > 0) {
              if (filters.company && Object.keys(filters).length === 1) {
                questions = await getCompanyQuestions(filters.company);
              } else {
                questions = await getFilteredQuestions(filters);
              }
            } else {
              questions = await getRandomQuestions();
            }
            
            console.log(`Fetched ${questions.length} questions after resetting history`);
          }
          
          set({ 
            questionList: questions, 
            loadingQuestions: false,
            // Only update current question if we don't have one or if it's not in the new list
            currentQuestion: currentQuestion && questions.find(q => q.id === currentQuestion.id)
              ? currentQuestion 
              : questions.length > 0 ? questions[0] : null
          });
        } catch (error) {
          console.error('Error in fetchQuestions:', error);
          set({ 
            loadingQuestions: false, 
            error: 'Failed to load questions. Please try again.' 
          });
        }
      },

      fetchCompanyQuestions: async (company) => {
        try {
          console.log(`Fetching questions for company: ${company}`);
          set({ loadingQuestions: true, error: null });
          
          const seenQuestions = get().seenQuestions;
          console.log(`Excluding ${seenQuestions.length} previously seen questions`);
          
          // Fetch company questions
          const questions = await getCompanyQuestions(company, 10, seenQuestions);
          
          console.log(`Fetched ${questions.length} questions for company ${company}`);
          
          // If we have no questions after excluding seen ones, clear history and try again
          if (questions.length === 0 && seenQuestions.length > 0) {
            console.log('No new company questions available, clearing history and fetching again');
            set({ seenQuestions: [] });
            
            // Try fetching again without the seenQuestions filter
            const refreshedQuestions = await getCompanyQuestions(company);
            console.log(`Fetched ${refreshedQuestions.length} questions after resetting history`);
            
            set({
              questionList: refreshedQuestions,
              loadingQuestions: false,
              currentQuestion: refreshedQuestions.length > 0 ? refreshedQuestions[0] : null,
              filters: { company }
            });
          } else {
            set({
              questionList: questions,
              loadingQuestions: false,
              currentQuestion: questions.length > 0 ? questions[0] : null,
              filters: { company }
            });
          }
        } catch (error) {
          console.error(`Error fetching questions for company ${company}:`, error);
          set({ 
            loadingQuestions: false, 
            error: `Failed to load questions for ${company}. Showing other questions instead.` 
          });
          // Fall back to random questions
          await get().fetchQuestions();
        }
      },
      
      fetchQuestion: async (id) => {
        try {
          console.log(`Fetching question with ID: ${id}`);
          set({ loadingQuestion: true, error: null });
          const question = await getQuestionById(id);
          
          if (question) {
            console.log('Question fetched successfully:', question.question);
            set({ currentQuestion: question, loadingQuestion: false });
            
            // Add this question to seen questions
            get().addToSeenQuestions(id);
          } else {
            console.error('No question found with ID:', id);
            set({ 
              loadingQuestion: false, 
              error: 'Question not found' 
            });
          }
        } catch (error) {
          console.error(`Error fetching question ${id}:`, error);
          set({ 
            loadingQuestion: false, 
            error: 'Failed to load question. Please try again.' 
          });
        }
      },
      
      setResponse: (questionId, step, response) => {
        console.log(`Setting response for question ${questionId}, step ${step}`);
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: {
              ...(state.responses[questionId] || {}),
              [step]: response
            }
          }
        }));
      },
      
      getResponsesForQuestion: (questionId) => {
        return get().responses[questionId] || {};
      },
      
      clearResponses: (questionId) => {
        console.log(`Clearing responses for question ${questionId}`);
        set((state) => {
          const { [questionId]: _, ...rest } = state.responses;
          return { responses: rest };
        });
      },
      
      clearError: () => set({ error: null }),
      
      // New function to add a question to seen questions
      addToSeenQuestions: (questionId) => {
        console.log(`Adding question ${questionId} to seen questions`);
        set((state) => {
          // Only add if not already in the array
          if (!state.seenQuestions.includes(questionId)) {
            return { seenQuestions: [...state.seenQuestions, questionId] };
          }
          return state;
        });
      },
      
      // New function to clear seen questions history
      clearSeenQuestions: () => {
        console.log('Clearing seen questions history');
        set({ seenQuestions: [] });
      }
    }),
    {
      name: 'interview-questions-storage', // localStorage key
      partialize: (state) => ({ 
        // Only persist these parts of the state
        responses: state.responses,
        seenQuestions: state.seenQuestions,
        filters: state.filters
      }),
    }
  )
);
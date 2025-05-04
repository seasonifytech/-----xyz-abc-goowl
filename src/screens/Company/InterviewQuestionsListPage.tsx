import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getCompanyQuestions, type Question } from '../../services/questionService';

export const InterviewQuestionsListPage = () => {
  const { company } = useParams<{ company: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!company) return;
      
      try {
        const questionsList = await getCompanyQuestions(decodeURIComponent(company));
        setQuestions(questionsList);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [company]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b3dff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button 
          variant="outline"
          onClick={() => navigate('/companies')}
          className="mb-6 flex items-center gap-2 border rounded-full pl-4 pr-6 py-2 text-[#8b3dff] border-[#8b3dff] hover:bg-[#f9f5ff]"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-semibold">BACK</span>
        </Button>

        <h1 className="text-3xl font-bold mb-8">
          {company} Interview Questions
        </h1>

        <div className="space-y-6">
          {questions.map((question) => (
            <Card
              key={question.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/question/${question.id}`)}
            >
              <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
              
              <div className="flex flex-wrap gap-3">
                {question.category && (
                  <div className="px-3 py-1 rounded-full border border-[#8b3dff] text-[#8b3dff] text-sm">
                    {question.category}
                  </div>
                )}
                {question.job_role && (
                  <div className="px-3 py-1 rounded-full border border-[#8b3dff] text-[#8b3dff] text-sm">
                    {question.job_role}
                  </div>
                )}
                {question.difficulty && (
                  <div className="px-3 py-1 rounded-full border border-gray-300 text-[#ff9b00] text-sm">
                    {question.difficulty}
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {question.answer_count || 0} answers · {question.views || 0} views
              </div>
            </Card>
          ))}

          {questions.length === 0 && (
            <Card className="p-6 text-center text-gray-500">
              No questions found for {company}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
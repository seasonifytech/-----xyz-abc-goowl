import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ThumbsUpIcon, MessageSquareIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { 
  getQuestionById, 
  getCommunityAnswers,
  incrementViewCount,
  upvoteAnswer,
  submitCommunityAnswer,
  type Question,
  type CommunityAnswer
} from '../../services/questionService';

export const QuestionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<CommunityAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Increment view count
        await incrementViewCount(id);
        
        // Fetch question and answers
        const [questionData, answersData] = await Promise.all([
          getQuestionById(id),
          getCommunityAnswers(id)
        ]);
        
        setQuestion(questionData);
        setAnswers(answersData);
      } catch (error) {
        console.error('Error loading question data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleUpvote = async (answerId: string) => {
    try {
      await upvoteAnswer(answerId);
      // Refresh answers after upvote
      if (id) {
        const updatedAnswers = await getCommunityAnswers(id);
        setAnswers(updatedAnswers);
      }
    } catch (error) {
      console.error('Error upvoting answer:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!id || !newAnswer.trim()) return;
    
    setSubmitting(true);
    try {
      await submitCommunityAnswer(id, newAnswer.trim());
      // Refresh answers after submission
      const updatedAnswers = await getCommunityAnswers(id);
      setAnswers(updatedAnswers);
      setNewAnswer(''); // Clear input
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b3dff]"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Question not found</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button 
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 border rounded-full pl-4 pr-6 py-2 text-[#8b3dff] border-[#8b3dff] hover:bg-[#f9f5ff]"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-semibold">BACK</span>
        </Button>

        {/* Question section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{question.question}</h1>
          
          {/* Tags/Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            {question.category && (
              <div className="px-5 py-2 rounded-full border border-[#8b3dff] text-[#8b3dff]">
                {question.category}
              </div>
            )}
            {question.job_role && (
              <div className="px-5 py-2 rounded-full border border-[#8b3dff] text-[#8b3dff]">
                {question.job_role}
              </div>
            )}
            {question.company && (
              <div className="px-5 py-2 rounded-full border border-gray-300">
                <span className="flex items-center">
                  <img src="/image.png" alt={question.company} className="w-5 h-5 mr-2" />
                  {question.company}
                </span>
              </div>
            )}
            {question.difficulty && (
              <div className="px-5 py-2 rounded-full border border-gray-300 text-[#ff9b00]">
                {question.difficulty}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5" />
              <span>{question.answer_count || 0} answers</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{question.views || 0} views</span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Community Answers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Community Answers</h2>
          
          {answers.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No answers yet. Be the first to answer!
            </Card>
          ) : (
            <div className="space-y-6">
              {answers.map((answer) => (
                <Card key={answer.id} className="p-6">
                  <p className="text-gray-800 mb-4">{answer.answer}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Posted {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpvote(answer.id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span>{answer.upvotes || 0}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submit Answer */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Add Your Answer</h3>
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Share your experience..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b3dff] focus:border-transparent resize-none"
          />
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!newAnswer.trim() || submitting}
              className="bg-[#8b3dff] text-white px-6 py-2 rounded-lg hover:bg-[#7b35e0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </div>
        </div>

        {/* Practice Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/challenge', { 
              state: { questionId: question.id } 
            })}
            className="bg-[#8b3dff] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#7b35e0] active:translate-y-1 transition-all"
          >
            Practice This Question
          </Button>
        </div>
      </div>
    </div>
  );
};
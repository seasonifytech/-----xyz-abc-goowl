import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useQuestionStore } from "../../store/questionStore";
import { generateFeedback, rateFeedback } from "../../services/feedbackService";
import { playSound } from "../../services/audioService";
import { useAudioStore } from "../../store/audioStore";
import { CloseButton } from "../../components/ui/close-button";

interface LocationState {
  framework: string;
  questionId: string;
}

export const CompletionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { framework = "STAR", questionId } = (location.state as LocationState) || {};
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    overall_score: number;
    strengths: string[];
    areas_to_improve: string[];
    example_improvement: string;
    interview_readiness: string;
  } | null>(null);
  const [feedbackLogId, setFeedbackLogId] = useState<string | null>(null);
  const [feedbackRated, setFeedbackRated] = useState(false);

  const { volume, soundEnabled } = useAudioStore();
  const { 
    currentQuestion, 
    fetchQuestion, 
    getResponsesForQuestion 
  } = useQuestionStore();

  // Play level complete sound when component mounts
  useEffect(() => {
    // Use a small timeout to ensure the component is fully mounted
    const timer = setTimeout(() => {
      console.log("Playing level complete sound");
      playSound('levelComplete', volume, soundEnabled);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [volume, soundEnabled]);

  // Load the current question if not already loaded
  useEffect(() => {
    if (questionId && (!currentQuestion || currentQuestion.id !== questionId)) {
      fetchQuestion(questionId);
    }
  }, [questionId, currentQuestion, fetchQuestion]);

  // Generate feedback once question and responses are loaded
  useEffect(() => {
    const generateUserFeedback = async () => {
      if (!currentQuestion || !questionId) return;

      const responses = getResponsesForQuestion(questionId);
      
      // Check if we have responses for all steps
      const frameworks = {
        STAR: ["Situation", "Task", "Action", "Result"],
        PARADE: ["Problem", "Action", "Result", "Analysis", "Decision", "Experience"],
        CAR: ["Context", "Action", "Result"],
        CIRCLE: ["Comprehend", "Identify", "Report", "Cut", "List", "Evaluate"]
      };
      
      const frameworkSteps = frameworks[framework as keyof typeof frameworks] || [];
      const hasAllResponses = frameworkSteps.every(step => !!responses[step]);
      
      if (!hasAllResponses) {
        console.error("Missing responses for some steps");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const feedbackRequest = {
          question_text: currentQuestion.question,
          framework_name: framework,
          category: currentQuestion.category || "General",
          difficulty: currentQuestion.difficulty || "Medium",
          framework_steps_with_responses: responses
        };
        
        const result = await generateFeedback(feedbackRequest);
        
        setFeedback(result);
        
        // Get the feedback log ID from the response
        const { data } = await supabase
          .from('feedback_logs')
          .select('id')
          .eq('request_data', feedbackRequest)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          setFeedbackLogId(data.id);
        }
        
        // Play correct or incorrect sound based on score
        if (result.overall_score >= 4) {
          playSound('correct', volume, soundEnabled);
        } else if (result.overall_score <= 2) {
          playSound('incorrect', volume, soundEnabled);
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateUserFeedback();
  }, [currentQuestion, questionId, framework, getResponsesForQuestion, volume, soundEnabled]);

  const handleReadyForMore = () => {
    // Play click sound and redirect
    playSound('click', volume, soundEnabled);
    navigate("/challenge");
  };

  const handleFeedbackRating = async (helpful: boolean) => {
    if (feedbackLogId) {
      await rateFeedback(feedbackLogId, helpful);
      setFeedbackRated(true);
      playSound('click', volume, soundEnabled);
    }
  };

  return (
    <div className="bg-white min-h-screen w-full p-6 md:p-10">
      {/* Close Button - Fixed Position */}
      <CloseButton />
      
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button 
          variant="outline"
          onClick={() => navigate("/challenge")}
          className="mb-6 flex items-center gap-2 border rounded-full pl-4 pr-6 py-2 text-[#8b3dff] border-[#8b3dff] hover:bg-[#f9f5ff]"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-semibold">BACK</span>
        </Button>
        
        {/* Challenge title */}
        <h1 className="text-3xl font-bold mb-6">
          {currentQuestion?.question || "Loading question..."}
        </h1>
        
        {/* Tags/Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {currentQuestion?.category && (
            <div className="px-5 py-2 rounded-full border border-[#8b3dff] text-[#8b3dff]">
              {currentQuestion.category}
            </div>
          )}
          {currentQuestion?.job_role && (
            <div className="px-5 py-2 rounded-full border border-[#8b3dff] text-[#8b3dff]">
              {currentQuestion.job_role}
            </div>
          )}
          {currentQuestion?.company && (
            <div className="px-5 py-2 rounded-full border border-gray-300">
              <span className="flex items-center">
                <img src="/image.png" alt={currentQuestion.company} className="w-5 h-5 mr-2" />
                {currentQuestion.company}
              </span>
            </div>
          )}
          {currentQuestion?.difficulty && (
            <div className="px-5 py-2 rounded-full border border-gray-300 text-[#ff9b00]">
              {currentQuestion.difficulty}
            </div>
          )}
        </div>
        
        {/* Mascot with feedback message */}
        <div className="flex items-start mb-8">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="Happy Mascot" 
              className="w-16 h-16 object-cover animate-bounce" 
              style={{ animation: "bounce 2s infinite" }}
            />
            <span className="absolute -top-1 -right-1 text-yellow-400 text-2xl">✨</span>
            <span className="absolute -bottom-1 -left-1 text-yellow-400 text-2xl">✨</span>
          </div>
          <div className="ml-4 bg-gray-100 p-4 rounded-xl rounded-tl-none max-w-xl">
            <p>{loading ? "Generating your feedback..." : "Your feedback is now ready"}</p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b3dff]"></div>
          </div>
        )}
        
        {/* Feedback content - only shown when feedback is available */}
        {!loading && feedback && (
          <>
            {/* Rating section */}
            <div className="mb-8 flex items-center gap-4">
              <h2 className="text-xl font-semibold text-[#8b3dff]">Good job, you have earned</h2>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`text-yellow-400 text-2xl ${star > feedback.overall_score ? 'opacity-50' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            {/* Feedback sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Strengths section */}
              <div className="bg-[#f5ecff] rounded-xl p-6 h-auto min-h-40">
                <h3 className="text-xl font-semibold text-[#8b3dff] mb-3">Strengths</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              
              {/* Areas to improve section */}
              <div className="bg-[#e6fafc] rounded-xl p-6 h-auto min-h-40">
                <h3 className="text-xl font-semibold text-[#00c4cc] mb-3">Areas to improve</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {feedback.areas_to_improve.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Example improvement section */}
            <div className="bg-[#f7f7f7] rounded-xl p-6 mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Example Improvement</h3>
              <p className="text-gray-700">{feedback.example_improvement}</p>
            </div>
            
            {/* Interview readiness section */}
            <div className="bg-[#fff9e6] rounded-xl p-6 mb-10">
              <h3 className="text-xl font-semibold text-[#fda337] mb-3">Interview Readiness</h3>
              <p className="text-gray-700">{feedback.interview_readiness}</p>
            </div>
            
            {/* Feedback Rating */}
            {!feedbackRated && feedbackLogId && (
              <div className="bg-gray-50 rounded-xl p-6 mb-10 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Was this feedback helpful?</h3>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleFeedbackRating(true)}
                    className="bg-[#8b3dff] text-white px-6 py-2 rounded-lg hover:bg-[#7b35e0]"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => handleFeedbackRating(false)}
                    variant="outline"
                    className="px-6 py-2 rounded-lg"
                  >
                    No
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Ready for one more button */}
        <div className="flex justify-end">
          <Button 
            className="bg-[#8b3dff] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#7b35e0] active:translate-y-1 transition-all"
            onClick={handleReadyForMore}
          >
            READY FOR ONE MORE
          </Button>
        </div>
      </div>
    </div>
  );
}
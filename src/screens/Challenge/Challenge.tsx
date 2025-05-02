import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useQuestionStore } from "../../store/questionStore";
import { useAudioStore } from "../../store/audioStore";
import { playSound } from "../../services/audioService";
import { CloseButton } from "../../components/ui/close-button";
import { ResetQuestionsButton } from "../../components/ui/reset-questions-button";

export const Challenge = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedFramework, setSelectedFramework] = useState<string>("STAR");
  const { 
    currentQuestion, 
    fetchQuestion, 
    fetchQuestions, 
    questionList, 
    loadingQuestions,
    error,
    seenQuestions
  } = useQuestionStore();
  
  const { volume, soundEnabled } = useAudioStore();
  
  useEffect(() => {
    // Fetch questions when the component mounts
    console.log("Challenge component mounted, fetching questions");
    fetchQuestions();
  }, [fetchQuestions]);
  
  useEffect(() => {
    // Set the current question to the first question in the list
    if (questionList.length > 0 && !currentQuestion) {
      console.log("Setting current question from question list", questionList[0]);
      fetchQuestion(questionList[0].id);
    }
  }, [questionList, currentQuestion, fetchQuestion]);

  const handleContinue = () => {
    if (currentQuestion) {
      console.log(`Continuing with framework: ${selectedFramework} and question: ${currentQuestion.id}`);
      playSound('click', volume, soundEnabled);
      navigate("/input", { 
        state: { 
          framework: selectedFramework, 
          step: 0,
          questionId: currentQuestion.id
        } 
      });
    }
  };

  const handleFrameworkSelect = (framework: string) => {
    playSound('click', volume, soundEnabled);
    setSelectedFramework(framework);
  };

  const handleRetry = () => {
    playSound('click', volume, soundEnabled);
    fetchQuestions();
  };

  return (
    <div className="bg-white min-h-screen w-full p-6 md:p-10">
      {/* Close Button - Fixed Position */}
      <CloseButton />
      
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
        
        {/* Challenge title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {loadingQuestions ? "Loading question..." : currentQuestion?.question || "Select a question to practice"}
          </h1>
          
          {/* Show the ResetQuestionsButton if there are seen questions */}
          {seenQuestions.length > 0 && (
            <ResetQuestionsButton />
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <Button 
              onClick={() => handleRetry()}
              className="mt-2 bg-red-700 text-white hover:bg-red-800"
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Question Counter */}
        {seenQuestions.length > 0 && (
          <div className="mb-4 text-sm text-gray-500">
            {seenQuestions.length} questions completed in this session
          </div>
        )}
        
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
        
        {/* Mascot with tip */}
        <div className="flex items-start mb-12">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="Mascot" 
              className="w-16 h-16 object-cover"
            />
          </div>
          <div className="ml-4 bg-gray-100 p-4 rounded-xl rounded-tl-none max-w-xl">
            <p>Try breaking this problem into smaller steps</p>
          </div>
        </div>
        
        {/* Framework selection */}
        <h3 className="text-xl font-semibold text-[#8b3dff] mb-4">Select best framework</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div 
            className={`border rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFramework === "PARADE" 
                ? "bg-[#00c4cc] text-white border-transparent" 
                : "border-gray-300 hover:border-[#00c4cc]"
            }`}
            onClick={() => handleFrameworkSelect("PARADE")}
          >
            <span className="text-xl font-semibold">PARADE</span>
          </div>
          
          <div 
            className={`border rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFramework === "STAR" 
                ? "bg-[#00c4cc] text-white border-transparent" 
                : "border-gray-300 hover:border-[#00c4cc]"
            }`}
            onClick={() => handleFrameworkSelect("STAR")}
          >
            <span className="text-xl font-semibold">STAR</span>
          </div>
          
          <div 
            className={`border rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFramework === "CAR" 
                ? "bg-[#00c4cc] text-white border-transparent" 
                : "border-gray-300 hover:border-[#00c4cc]"
            }`}
            onClick={() => handleFrameworkSelect("CAR")}
          >
            <span className="text-xl font-semibold">CAR</span>
          </div>
          
          <div 
            className={`border rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFramework === "CIRCLE" 
                ? "bg-[#00c4cc] text-white border-transparent" 
                : "border-gray-300 hover:border-[#00c4cc]"
            }`}
            onClick={() => handleFrameworkSelect("CIRCLE")}
          >
            <span className="text-xl font-semibold">CIRCLE</span>
          </div>
        </div>

        {/* Continue button */}
        <div className="flex justify-end mb-8">
          <Button 
            className="bg-[#8b3dff] text-white px-8 py-2 rounded-lg hover:bg-[#7b35e0] active:translate-y-1 transition-all"
            onClick={handleContinue}
            disabled={!currentQuestion || loadingQuestions}
          >
            {loadingQuestions ? "Loading..." : "CONTINUE"}
          </Button>
        </div>
        
        {/* Framework tabs */}
        {selectedFramework === "STAR" && (
          <div className="bg-[#8b3dff] rounded-t-xl text-white">
            <div className="flex justify-between text-xl font-semibold">
              <div className="flex-1 p-4 text-center border-r border-purple-400">
                S-Situation
              </div>
              <div className="flex-1 p-4 text-center border-r border-purple-400">
                T-Task
              </div>
              <div className="flex-1 p-4 text-center border-r border-purple-400">
                A-Action
              </div>
              <div className="flex-1 p-4 text-center">
                R-Result
              </div>
            </div>
          </div>
        )}
        
        {selectedFramework === "PARADE" && (
          <div className="bg-[#8b3dff] rounded-t-xl text-white">
            <div className="grid grid-cols-6 text-lg font-semibold">
              <div className="p-4 text-center border-r border-purple-400">P-Problem</div>
              <div className="p-4 text-center border-r border-purple-400">A-Action</div>
              <div className="p-4 text-center border-r border-purple-400">R-Result</div>
              <div className="p-4 text-center border-r border-purple-400">A-Analysis</div>
              <div className="p-4 text-center border-r border-purple-400">D-Decision</div>
              <div className="p-4 text-center">E-Experience</div>
            </div>
          </div>
        )}
        
        {selectedFramework === "CAR" && (
          <div className="bg-[#8b3dff] rounded-t-xl text-white">
            <div className="flex justify-between text-xl font-semibold">
              <div className="flex-1 p-4 text-center border-r border-purple-400">
                C-Context
              </div>
              <div className="flex-1 p-4 text-center border-r border-purple-400">
                A-Action
              </div>
              <div className="flex-1 p-4 text-center">
                R-Result
              </div>
            </div>
          </div>
        )}
        
        {selectedFramework === "CIRCLE" && (
          <div className="bg-[#8b3dff] rounded-t-xl text-white">
            <div className="grid grid-cols-6 text-lg font-semibold">
              <div className="p-4 text-center border-r border-purple-400">C-Comprehend</div>
              <div className="p-4 text-center border-r border-purple-400">I-Identify</div>
              <div className="p-4 text-center border-r border-purple-400">R-Report</div>
              <div className="p-4 text-center border-r border-purple-400">C-Cut</div>
              <div className="p-4 text-center border-r border-purple-400">L-List</div>
              <div className="p-4 text-center">E-Evaluate</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
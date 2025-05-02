import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon, XIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useQuestionStore } from "../../store/questionStore";
import { playSound } from "../../services/audioService";
import { useAudioStore } from "../../store/audioStore";
import { CloseButton } from "../../components/ui/close-button";

interface LocationState {
  framework: string;
  step?: number;
  questionId: string;
}

export const InputPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { framework = "STAR", step = 0, questionId } = (location.state as LocationState) || {};
  
  const [inputText, setInputText] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [isMinWordsReached, setIsMinWordsReached] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTime = useRef<number>(0);
  
  const { volume, soundEnabled } = useAudioStore();
  const { 
    currentQuestion, 
    fetchQuestion, 
    setResponse, 
    getResponsesForQuestion 
  } = useQuestionStore();

  // Framework definitions
  const frameworks = {
    STAR: {
      name: "STAR",
      steps: ["Situation", "Task", "Action", "Result"],
      abbr: ["S", "T", "A", "R"]
    },
    PARADE: {
      name: "PARADE",
      steps: ["Problem", "Action", "Result", "Analysis", "Decision", "Experience"],
      abbr: ["P", "A", "R", "A", "D", "E"]
    },
    CAR: {
      name: "CAR",
      steps: ["Context", "Action", "Result"],
      abbr: ["C", "A", "R"]
    },
    CIRCLE: {
      name: "CIRCLE",
      steps: ["Comprehend", "Identify", "Report", "Cut", "List", "Evaluate"],
      abbr: ["C", "I", "R", "C", "L", "E"]
    }
  };

  // Load the current question if not already loaded
  useEffect(() => {
    if (questionId && (!currentQuestion || currentQuestion.id !== questionId)) {
      fetchQuestion(questionId);
    }
  }, [questionId, currentQuestion, fetchQuestion]);

  const currentFramework = frameworks[framework as keyof typeof frameworks];
  const totalSteps = currentFramework.steps.length;
  const currentStep = Math.min(step, totalSteps - 1);
  const nextStep = (currentStep + 1) % totalSteps;
  const currentStepName = currentFramework.steps[currentStep];
  const currentStepAbbr = currentFramework.abbr[currentStep];
  const nextStepName = currentFramework.steps[nextStep];

  const MIN_WORDS = 30;

  // Load previous response for this step if it exists
  useEffect(() => {
    if (questionId) {
      const responses = getResponsesForQuestion(questionId);
      const savedResponse = responses[currentStepName];
      
      if (savedResponse) {
        setInputText(savedResponse);
        // Recalculate word count for saved response
        const words = savedResponse.trim().split(/\s+/);
        const count = savedResponse.trim() ? words.length : 0;
        setWordCount(count);
        setIsMinWordsReached(count >= MIN_WORDS);
        setHasUnsavedChanges(false); // Initial state from saved data is not unsaved
      } else {
        setInputText("");
        setWordCount(0);
        setIsMinWordsReached(false);
        setHasUnsavedChanges(false);
      }
    }
    
    // Focus the textarea after loading
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [step, framework, questionId, currentStepName, getResponsesForQuestion]);

  // Calculate word count when input changes
  useEffect(() => {
    const words = inputText.trim().split(/\s+/);
    const count = inputText.trim() ? words.length : 0;
    setWordCount(count);
    setIsMinWordsReached(count >= MIN_WORDS);
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Get the saved response to check if there are changes
    const responses = getResponsesForQuestion(questionId);
    const savedResponse = responses[currentStepName] || '';
    
    // Set unsaved changes flag if the current input differs from saved
    setHasUnsavedChanges(newValue !== savedResponse);
    
    setInputText(newValue);
    
    // Play typing sound when the user is typing
    // Throttle sound to avoid too many sounds playing at once
    const now = Date.now();
    if (now - lastTypingTime.current > 100) { // Limit to once every 100ms
      playSound('typing', volume * 0.3, soundEnabled); // Lower volume for typing sound
      lastTypingTime.current = now;
    }
  };

  const handleContinue = () => {
    // Save the current response
    if (questionId) {
      setResponse(questionId, currentStepName, inputText);
      setHasUnsavedChanges(false);
    }
    
    // Play sound for correct answer
    playSound('correct', volume, soundEnabled);
    
    if (currentStep < totalSteps - 1) {
      navigate("/input", { 
        state: { 
          framework, 
          step: currentStep + 1,
          questionId
        } 
      });
    } else {
      // Last step completed - play lesson complete sound
      playSound('lessonComplete', volume, soundEnabled);
      
      // Last step completed
      navigate("/challenge/completed", { 
        state: { 
          framework,
          questionId 
        } 
      });
    }
  };

  return (
    <div className="bg-white min-h-screen w-full p-6 md:p-10">
      {/* Close Button - Fixed Position */}
      <CloseButton hasUnsavedChanges={hasUnsavedChanges} />
      
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
        
        {/* Mascot with tip */}
        <div className="flex items-start mb-8">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="Mascot" 
              className="w-16 h-16 object-cover"
            />
          </div>
          <div className="ml-4 bg-gray-100 p-4 rounded-xl rounded-tl-none max-w-xl">
            <p>Write about the "{currentStepAbbr}" {currentStepName}</p>
          </div>
        </div>

        {/* Word count requirement */}
        <div className="mb-2">
          <p className="text-[#8b3dff] font-medium">Write minimum 30 words for a detailed answer</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div 
            className="h-full bg-[#8b3dff] rounded-full" 
            style={{ width: `${Math.min((wordCount / MIN_WORDS) * 100, 100)}%` }}
          ></div>
        </div>
        
        {/* Word counter */}
        <div className="flex justify-end mb-2">
          <span className="text-[#8b3dff]">{wordCount} words</span>
        </div>

        {/* Textarea for user input - REDUCED HEIGHT from h-40 to h-32 */}
        <div className="mb-6">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            placeholder="Write your answer here..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b3dff] focus:border-transparent"
          ></textarea>
        </div>

        {/* Continue button */}
        <div className="flex justify-end mb-8">
          <Button 
            className={`bg-[#8b3dff] text-white px-8 py-2 rounded-lg transition-all ${
              isMinWordsReached 
                ? "hover:bg-[#7b35e0] active:translate-y-1" 
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleContinue}
            disabled={!isMinWordsReached}
          >
            CONTINUE
          </Button>
        </div>
        
        {/* Completion message - only shown when minimum words reached */}
        {isMinWordsReached && (
          <div className="bg-[#8b3dff] p-6 rounded-xl text-white text-center text-xl font-semibold">
            Great job, let's move to "{nextStepName}"
          </div>
        )}
      </div>
    </div>
  );
};
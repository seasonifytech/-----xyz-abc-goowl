import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './button';
import { useQuestionStore } from '../../store/questionStore';
import { playSound } from '../../services/audioService';
import { useAudioStore } from '../../store/audioStore';

interface ResetQuestionsButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ResetQuestionsButton({
  variant = 'outline',
  size = 'sm',
  className = ''
}: ResetQuestionsButtonProps) {
  const { clearSeenQuestions, fetchQuestions } = useQuestionStore();
  const { volume, soundEnabled } = useAudioStore();

  const handleReset = () => {
    // Play click sound
    playSound('click', volume, soundEnabled);
    
    // Show confirmation dialog
    if (window.confirm('This will reset your question history and allow previously seen questions to appear again. Continue?')) {
      // Clear seen questions and fetch new questions
      clearSeenQuestions();
      fetchQuestions();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReset}
      className={`flex items-center gap-1 ${className}`}
      title="Reset question history"
    >
      <RotateCcw className="w-4 h-4" />
      <span>Reset Questions</span>
    </Button>
  );
}
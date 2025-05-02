import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { playSound } from '../../services/audioService';
import { useAudioStore } from '../../store/audioStore';

export const Step9ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const { volume, soundEnabled } = useAudioStore();
  const { fullName, setOnboardingCompleted } = useOnboardingStore();
  
  // Display first name if full name contains a space
  const firstName = fullName.includes(' ') ? fullName.split(' ')[0] : fullName;
  const displayName = firstName || 'there';

  useEffect(() => {
    // Play a success sound when component mounts
    const timer = setTimeout(() => {
      playSound('levelComplete', volume, soundEnabled);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [volume, soundEnabled]);

  const handleStartLearning = () => {
    // Mark onboarding as completed
    setOnboardingCompleted(true);
    
    // Play click sound and navigate to Home/Dashboard page instead of Challenge
    playSound('click', volume, soundEnabled);
    navigate('/');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="GOWL Mascot" 
              className="w-32 h-32 object-contain"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#272E35] mb-4">
          Thank you, {displayName}!
        </h1>
        
        <p className="text-lg mb-16">
          Based on your profile, we'll recommend the most relevant interview questions 
          and resources to help you prepare.
        </p>

        <Button
          onClick={handleStartLearning}
          className="bg-[#8b3dff] text-white px-10 py-3 rounded-lg text-lg font-semibold hover:bg-[#7b35e0] active:translate-y-1 transition-all"
        >
          START LEARNING
        </Button>
      </div>
    </div>
  );
};
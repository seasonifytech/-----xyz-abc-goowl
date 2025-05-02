import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useOnboardingStore } from '../../store/onboardingStore';

export const Step1Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboardingStore();

  const handleContinue = () => {
    setCurrentStep(2);
    navigate('/onboarding/step2');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold text-[#272E35] mb-16">
          Welcome to your GOWL adventure
        </h1>

        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="GOWL Mascot" 
              className="w-32 h-32 object-contain"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full"></div>
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-300 rounded-full"></div>
          </div>
          
          <div className="ml-4 bg-gray-100 p-6 rounded-xl rounded-tl-none max-w-xs text-left">
            <p className="text-lg font-medium mb-3">Hi, I am your buddy</p>
            <p className="text-lg">
              I'll help you to level up your skills, earn badges, & conquer questions like a game!
            </p>
          </div>
        </div>

        <div className="mt-24">
          <Button
            onClick={handleContinue}
            className="bg-[#8b3dff] text-white px-10 py-3 rounded-lg text-lg font-semibold hover:bg-[#7b35e0] active:translate-y-1 transition-all"
          >
            CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};
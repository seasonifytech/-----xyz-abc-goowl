import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useOnboardingStore } from '../../store/onboardingStore';

export const Step3Experience: React.FC = () => {
  const navigate = useNavigate();
  const { yearsOfExperience, setYearsOfExperience, setCurrentStep } = useOnboardingStore();
  const [experience, setExperience] = useState(yearsOfExperience);
  const [isValid, setIsValid] = useState(!!yearsOfExperience);

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accept only numbers and validate
    if (/^\d*$/.test(value)) {
      setExperience(value);
      setIsValid(!!value);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      setYearsOfExperience(experience);
      setCurrentStep(4);
      navigate('/onboarding/step4');
    }
  };

  const handleSkip = () => {
    setCurrentStep(4);
    navigate('/onboarding/step4');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline"
          onClick={handleSkip}
          className="text-[#8b3dff] border-none hover:bg-transparent hover:text-[#7b35e0] font-semibold text-lg"
        >
          SKIP
        </Button>
      </div>

      <div className="w-full max-w-xl">
        <div className="flex items-start mb-16">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="GOWL Mascot" 
              className="w-24 h-24 object-contain"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full"></div>
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-300 rounded-full"></div>
          </div>
          <div className="ml-4 bg-gray-100 p-4 rounded-xl rounded-tl-none">
            <p className="text-lg font-medium">How many years of experience do you have?</p>
          </div>
        </div>

        <div className="mb-16">
          <Input
            type="text"
            placeholder="Ex: 3"
            value={experience}
            onChange={handleExperienceChange}
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!isValid}
            className={`bg-[#8b3dff] text-white px-10 py-3 rounded-lg text-lg font-semibold transition-all ${
              isValid ? "hover:bg-[#7b35e0] active:translate-y-1" : "opacity-50 cursor-not-allowed"
            }`}
          >
            CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};
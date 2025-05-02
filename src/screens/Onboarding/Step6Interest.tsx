import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useOnboardingStore } from '../../store/onboardingStore';

export const Step6Interest: React.FC = () => {
  const navigate = useNavigate();
  const { interestArea, setInterestArea, setCurrentStep } = useOnboardingStore();
  const [selected, setSelected] = useState(interestArea);

  const interestOptions = [
    "Software Engineering",
    "Product Management",
    "Data Science",
    "UX/UI Design",
    "DevOps",
    "Machine Learning",
    "Full Stack Development",
    "Other"
  ];

  const handleSelect = (interest: string) => {
    setSelected(interest);
  };

  const handleContinue = () => {
    if (selected) {
      setInterestArea(selected);
      setCurrentStep(7);
      navigate('/onboarding/step7');
    }
  };

  const handleSkip = () => {
    setCurrentStep(7);
    navigate('/onboarding/step7');
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
            <p className="text-lg font-medium">What are you interested in preparing for?</p>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-4">
          {interestOptions.map((interest) => (
            <div 
              key={interest}
              onClick={() => handleSelect(interest)}
              className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                selected === interest 
                  ? "bg-[#8b3dff] text-white border-transparent" 
                  : "border-gray-300 hover:border-[#8b3dff]"
              }`}
            >
              {interest}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!selected}
            className={`bg-[#8b3dff] text-white px-10 py-3 rounded-lg text-lg font-semibold transition-all ${
              selected ? "hover:bg-[#7b35e0] active:translate-y-1" : "opacity-50 cursor-not-allowed"
            }`}
          >
            CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};
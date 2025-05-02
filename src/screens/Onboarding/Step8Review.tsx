import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useOnboardingStore } from '../../store/onboardingStore';

export const Step8Review: React.FC = () => {
  const navigate = useNavigate();
  const { 
    fullName, 
    yearsOfExperience, 
    currentCompany, 
    currentRole, 
    interestArea, 
    linkedInProfile,
    setCurrentStep
  } = useOnboardingStore();

  const handleSubmit = () => {
    setCurrentStep(9);
    navigate('/onboarding/step9');
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    navigate(`/onboarding/step${step}`);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="flex items-start mb-8">
          <div className="relative">
            <img 
              src="/image-63.png" 
              alt="GOWL Mascot" 
              className="w-24 h-24 object-contain"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full"></div>
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-300 rounded-full"></div>
          </div>
          <div className="ml-4 bg-gray-100 p-4 rounded-xl rounded-tl-none max-w-xl">
            <p className="text-lg font-medium">Please review your details before submitting. You can update this information anytime in your profile settings.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-16">
          <h2 className="text-xl font-bold mb-4">Your Profile Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="font-medium">{fullName || 'Not provided'}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-[#8b3dff] text-sm"
                onClick={() => handleEdit(2)}
              >
                Edit
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Years of Experience</p>
                <p className="font-medium">{yearsOfExperience || 'Not provided'}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-[#8b3dff] text-sm"
                onClick={() => handleEdit(3)}
              >
                Edit
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Current Company</p>
                <p className="font-medium">{currentCompany || 'Not provided'}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-[#8b3dff] text-sm"
                onClick={() => handleEdit(4)}
              >
                Edit
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Current Role</p>
                <p className="font-medium">{currentRole || 'Not provided'}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-[#8b3dff] text-sm"
                onClick={() => handleEdit(5)}
              >
                Edit
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Interest Area</p>
                <p className="font-medium">{interestArea || 'Not provided'}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-[#8b3dff] text-sm"
                onClick={() => handleEdit(6)}
              >
                Edit
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">LinkedIn Profile</p>
                <p className="font-medium truncate max-w-[250px]">
                  {linkedInProfile || 'Not provided'}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="text-[#8b3dff] text-sm"
                onClick={() => handleEdit(7)}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            className="bg-[#8b3dff] text-white px-10 py-3 rounded-lg text-lg font-semibold hover:bg-[#7b35e0] active:translate-y-1 transition-all"
          >
            SUBMIT
          </Button>
        </div>
      </div>
    </div>
  );
};
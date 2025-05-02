import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';

export const OnboardingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onboardingCompleted, currentStep } = useOnboardingStore();
  
  useEffect(() => {
    // Skip redirect logic if:
    // 1. User is already on an onboarding page
    // 2. User has completed onboarding
    if (location.pathname.includes('/onboarding') || onboardingCompleted) {
      return;
    }
    
    // Redirect to the appropriate onboarding step based on current progress
    if (!onboardingCompleted) {
      console.log('Onboarding not completed, redirecting to step', currentStep);
      navigate(`/onboarding/step${currentStep}`);
    }
  }, [onboardingCompleted, currentStep, navigate, location.pathname]);

  // This component doesn't render anything
  return null;
};
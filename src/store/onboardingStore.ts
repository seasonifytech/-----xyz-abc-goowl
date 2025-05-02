import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingState {
  fullName: string;
  yearsOfExperience: string;
  currentCompany: string;
  currentRole: string;
  interestArea: string;
  linkedInProfile: string;
  onboardingCompleted: boolean;
  currentStep: number;
  
  // Actions
  setFullName: (name: string) => void;
  setYearsOfExperience: (years: string) => void;
  setCurrentCompany: (company: string) => void;
  setCurrentRole: (role: string) => void;
  setInterestArea: (area: string) => void;
  setLinkedInProfile: (profile: string) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      fullName: '',
      yearsOfExperience: '',
      currentCompany: '',
      currentRole: '',
      interestArea: '',
      linkedInProfile: '',
      onboardingCompleted: false,
      currentStep: 1,
      
      setFullName: (fullName) => set({ fullName }),
      setYearsOfExperience: (yearsOfExperience) => set({ yearsOfExperience }),
      setCurrentCompany: (currentCompany) => set({ currentCompany }),
      setCurrentRole: (currentRole) => set({ currentRole }),
      setInterestArea: (interestArea) => set({ interestArea }),
      setLinkedInProfile: (linkedInProfile) => set({ linkedInProfile }),
      setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      resetOnboarding: () => set({
        fullName: '',
        yearsOfExperience: '',
        currentCompany: '',
        currentRole: '',
        interestArea: '',
        linkedInProfile: '',
        onboardingCompleted: false,
        currentStep: 1
      })
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
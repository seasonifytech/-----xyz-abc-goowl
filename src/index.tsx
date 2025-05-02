import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Desktop } from "./screens/Desktop/Desktop";
import { Challenge } from "./screens/Challenge/Challenge";
import { InputPage } from "./screens/Challenge/InputPage";
import { CompletionPage } from "./screens/Challenge/CompletionPage";
import { Step1Welcome } from "./screens/Onboarding/Step1Welcome";
import { Step2FullName } from "./screens/Onboarding/Step2FullName";
import { Step3Experience } from "./screens/Onboarding/Step3Experience";
import { Step4Company } from "./screens/Onboarding/Step4Company";
import { Step5Role } from "./screens/Onboarding/Step5Role";
import { Step6Interest } from "./screens/Onboarding/Step6Interest";
import { Step7LinkedIn } from "./screens/Onboarding/Step7LinkedIn";
import { Step8Review } from "./screens/Onboarding/Step8Review";
import { Step9ThankYou } from "./screens/Onboarding/Step9ThankYou";
import { OnboardingRedirect } from "./components/ui/onboarding-redirect";
import { preloadAudio } from "./services/audioService";

// Preload audio files when app starts
preloadAudio();

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Onboarding Routes */}
        <Route path="/onboarding/step1" element={<Step1Welcome />} />
        <Route path="/onboarding/step2" element={<Step2FullName />} />
        <Route path="/onboarding/step3" element={<Step3Experience />} />
        <Route path="/onboarding/step4" element={<Step4Company />} />
        <Route path="/onboarding/step5" element={<Step5Role />} />
        <Route path="/onboarding/step6" element={<Step6Interest />} />
        <Route path="/onboarding/step7" element={<Step7LinkedIn />} />
        <Route path="/onboarding/step8" element={<Step8Review />} />
        <Route path="/onboarding/step9" element={<Step9ThankYou />} />
        
        {/* Main App Routes with Onboarding Check */}
        <Route path="/" element={<><OnboardingRedirect /><Desktop /></>} />
        <Route path="/challenge" element={<><OnboardingRedirect /><Challenge /></>} />
        <Route path="/input" element={<><OnboardingRedirect /><InputPage /></>} />
        <Route path="/challenge/completed" element={<><OnboardingRedirect /><CompletionPage /></>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
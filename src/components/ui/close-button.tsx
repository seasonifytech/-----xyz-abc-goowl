import React, { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { X as CloseIcon } from "lucide-react";
import { playSound } from "../../services/audioService";
import { useAudioStore } from "../../store/audioStore";

interface CloseButtonProps {
  onConfirm?: () => void;
  hasUnsavedChanges?: boolean;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onConfirm,
  hasUnsavedChanges = false,
}) => {
  const navigate = useNavigate();
  const { volume, soundEnabled } = useAudioStore();

  const handleClose = (event: React.MouseEvent | KeyboardEvent) => {
    // Prevent default button behavior
    event.preventDefault();
    
    // Play sound effect
    playSound('click', volume, soundEnabled);
    
    // If there are unsaved changes, show confirmation dialog
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm(
        "You have unsaved changes. Are you sure you want to exit?"
      );
      
      if (!confirmExit) return;
    }
    
    // If onConfirm callback is provided, call it
    if (onConfirm) {
      onConfirm();
    } else {
      // Otherwise navigate to dashboard
      navigate("/");
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle Enter or Space key press
    if (event.key === "Enter" || event.key === " ") {
      handleClose(event);
    }
  };

  return (
    <div
      role="button"
      aria-label="Close and return to dashboard"
      title="Return to Dashboard"
      tabIndex={0}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      className="fixed top-5 right-5 flex items-center justify-center w-8 h-8 p-2 bg-black bg-opacity-10 rounded-full cursor-pointer hover:bg-opacity-20 transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 z-50"
      style={{
        width: "32px",
        height: "32px",
      }}
    >
      <CloseIcon size={18} />
    </div>
  );
};
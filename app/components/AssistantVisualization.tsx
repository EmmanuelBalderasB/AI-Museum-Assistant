"use client";
import React, { useState, useEffect } from "react";
import VoiceAssistantVisualization from "./Sketch";

const VoiceAssistant: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(true);

  // Example: Toggle speaking state every 3 seconds (for demonstration)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setIsSpeaking((prev) => !prev);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, []);

  // In a real application, you would set isSpeaking based on your voice API
  // For example:
  // const startSpeaking = () => setIsSpeaking(true);
  // const stopSpeaking = () => setIsSpeaking(false);

  return (
    <div className="voice-assistant-container">
      <div className="visualization-wrapper">
        <VoiceAssistantVisualization
          width={600}
          height={600}
          speaking={isSpeaking}
        />
      </div>
    </div>
  );
};

export default VoiceAssistant;

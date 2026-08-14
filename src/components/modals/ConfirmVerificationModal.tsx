"use client";
import React, { useState, useRef, useEffect } from "react";
import { Mail, ArrowLeft } from "lucide-react";

const ConfirmVerificationModal = ({ onBack }: { onBack?: () => void }) => {
  const userEmail = "marysoko4@gmail.com"; // 🔹 Replace with real user email later

  // State for 6 digit inputs
  const [codes, setCodes] = useState(Array(6).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newCodes = [...codes];
      newCodes[index] = value;
      setCodes(newCodes);

      // Auto move forward
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Join all codes
  const verificationCode = codes.join("");

  // Auto-check when all 6 digits are entered
  useEffect(() => {
    if (verificationCode.length === 6) {
      console.log("Auto-verifying:", verificationCode);
      handleVerify();
    }
  }, [verificationCode]);

  const handleVerify = () => {
    console.log("Verification code entered:", verificationCode);
    // 🔹 Add API call here later
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 text-white">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-4">
        {/* Back Arrow (only left, no cancel on right) */}
        <button
          onClick={onBack}
          className="absolute left-0 p-2 text-white hover:text-gray-300"
        >
          <ArrowLeft size={22} />
        </button>

        <h3 className="text-xl sm:text-2xl font-bold">Confirm Verification Code</h3>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
          <Mail className="w-6 h-6 text-black" />
        </div>
      </div>

      {/* Subtext with Gmail */}
      <p className="text-center text-white/70 text-sm sm:text-base mb-6">
        We’ve sent a verification code to{" "}
        <span className="font-semibold text-white">{userEmail}</span>.  
        Enter it below to continue.
      </p>

      {/* Verification Code Inputs */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-6">
        {codes.map((code, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            type="text"
            value={code}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            className="w-10 h-12 sm:w-12 sm:h-14 bg-transparent border border-black/70 rounded-md font-semibold text-lg sm:text-xl text-center text-white outline-none tracking-widest"
          />
        ))}
      </div>

      {/* Help Text */}
      <div className="text-center text-white/60 text-xs sm:text-sm mt-4">
        Did not receive a code?{" "}
        <span className="font-bold cursor-pointer hover:underline">Check spam</span> or{" "}
        <span className="font-bold cursor-pointer hover:underline">Re-send Code</span>
      </div>
    </div>
  );
};

export default ConfirmVerificationModal;

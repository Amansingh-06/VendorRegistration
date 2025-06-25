import React from "react";

const TransparentLoader = ({ text = "Loading" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center fixed inset-0 bg-transparent backdrop-blur-sm z-50">
      <style>{`
        @keyframes textFade {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes dotFlicker {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .text-fade {
          animation: textFade 2s ease-in-out infinite;
        }

        .dot-flicker {
          animation: dotFlicker 1.5s infinite ease-in-out;
        }

        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.2s; }
        .dot-3 { animation-delay: 0.4s; }
      `}</style>

      <div className="text-center">
        {/* Loading Text */}
        <div className="text-fade text-orange-600 text-sm sm:text-base font-medium mb-3 tracking-wide">
          {text}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          <div className="dot-flicker dot-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          <div className="dot-flicker dot-2 w-2 h-2 bg-orange-500 rounded-full"></div>
          <div className="dot-flicker dot-3 w-2 h-2 bg-orange-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TransparentLoader;

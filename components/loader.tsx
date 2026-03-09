import React from "react";
import RAPTURES_LOGO from "@/assets/images/rapture-logo.svg";
import { CircularProgress } from "./ui/circular-progress";

interface LoaderProps {
  loadingText?: string;
}

const Loader: React.FC<LoaderProps> = ({ loadingText = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-6">
      <div className="relative inline-block">
        <CircularProgress size="3xl" strokeWidth={2} />
        <img
          src={RAPTURES_LOGO}
          className="absolute inset-0 m-auto w-14 h-14 object-contain"
          alt="logo"
        />
      </div>
      {/* Loading text */}
      {loadingText && (
        <p className="text-center text-gray-500">{loadingText}</p>
      )}
    </div>
  );
};

export default Loader;

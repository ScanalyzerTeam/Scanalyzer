"use client";

import { Loader2 } from "lucide-react";

interface AnalyzingSpinnerProps {
  imageUrl: string;
}

export function AnalyzingSpinner({ imageUrl }: AnalyzingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Captured"
        className="h-48 w-auto rounded-lg object-cover shadow-md"
      />
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#FFC107]" />
        <span className="text-sm font-medium text-gray-600">
          Analyzing image with AI...
        </span>
      </div>
    </div>
  );
}

"use client";

import { Camera, Upload } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface PhotoCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await resizeImage(file, 1920);
    onCapture(dataUrl);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-56 w-full max-w-md items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Camera className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-500">
            Take a photo or upload an image of items
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => cameraRef.current?.click()}
          className="bg-[#FFC107] text-black hover:bg-[#FFB300]"
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        <Button
          variant="outline"
          onClick={() => uploadRef.current?.click()}
          className="border-gray-300 text-black"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

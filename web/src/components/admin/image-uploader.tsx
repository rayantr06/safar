"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadImage, UploadableEntity } from "@/lib/actions/media";

interface ImageUploaderProps {
  entity: UploadableEntity;
  entityId: string;
  onUploaded: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUploader({ entity, entityId, onUploaded, className, label }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(entity, entityId, formData);
        if (result.success && result.url) {
          onUploaded(result.url);
        } else {
          setError(result.error || "Échec de l'envoi de l'image.");
        }
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant/50 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-center"
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        ) : (
          <UploadCloud className="h-6 w-6 text-on-surface-variant" />
        )}
        <span className="text-xs font-bold text-on-surface-variant">
          {isUploading ? "Envoi en cours..." : label || "Glissez une image ou cliquez pour parcourir"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="text-[10px] text-error font-semibold mt-1">{error}</p>}
    </div>
  );
}

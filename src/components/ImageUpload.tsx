import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, onClear }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      
      // Extract base64 data without prefix for API
      // Data URL format: "data:image/jpeg;base64,/9j/4AAQSk..."
      const parts = result.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const base64Data = parts[1];
      
      onImageSelect(base64Data, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {!preview ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="relative w-full h-48 sm:h-64 border-2 border-dashed border-gray-700 rounded-xl hover:border-gray-500 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center group"
        >
          <div className="p-4 rounded-full bg-surface mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium group-hover:text-gray-200">
            Click to upload photo
          </p>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 5MB)</p>
        </div>
      ) : (
        <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden group border border-gray-700">
          <img 
            src={preview} 
            alt="Upload preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
              onClick={handleClear}
              className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm"
             >
               Remove Photo
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
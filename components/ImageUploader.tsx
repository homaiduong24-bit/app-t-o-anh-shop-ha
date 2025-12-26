import React, { useRef } from 'react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  images: UploadedImage[];
  selectedId: string | null;
  onImagesAdd: (newImages: UploadedImage[]) => void;
  onImageSelect: (id: string) => void;
  onImageRemove: (id: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  images, 
  selectedId, 
  onImagesAdd, 
  onImageSelect, 
  onImageRemove 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (files: File[]) => {
    const validImages: UploadedImage[] = [];

    files.forEach(file => {
      // Validations
      if (!file.type.startsWith('image/')) {
        return; // Skip non-image files
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} quá lớn (Tối đa 10MB).`);
        return;
      }

      validImages.push({
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        file: file,
        preview: URL.createObjectURL(file)
      });
    });

    if (validImages.length > 0) {
      onImagesAdd(validImages);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-400">Ảnh sản phẩm đầu vào</label>
        <span className="text-xs text-slate-500">{images.length} ảnh đã tải lên</span>
      </div>

      {/* Main Drop Area - Always visible but smaller if images exist */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out
          ${images.length === 0 ? 'h-40 bg-slate-800/50' : 'h-24 bg-slate-800/30'}
          border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80
          flex flex-col items-center justify-center cursor-pointer overflow-hidden group mb-4`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center pointer-events-none">
           <div className={`text-slate-500 ${images.length === 0 ? 'mb-2' : 'flex items-center justify-center gap-2'}`}>
              <svg className={images.length === 0 ? "mx-auto h-8 w-8" : "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">
                {images.length === 0 ? "Nhấn để tải ảnh hoặc kéo thả" : "Thêm ảnh khác"}
              </span>
           </div>
           {images.length === 0 && <p className="text-xs text-slate-500">Hỗ trợ nhiều ảnh (PNG, JPG tối đa 10MB)</p>}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple // Allow multiple files
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div 
              key={img.id}
              onClick={() => onImageSelect(img.id)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group
                ${selectedId === img.id ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-700 hover:border-slate-500'}
              `}
            >
              <img src={img.preview} alt="Upload preview" className="w-full h-full object-cover" />
              
              {/* Selected Indicator */}
              {selectedId === img.id && (
                <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
              )}

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove(img.id);
                }}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa ảnh"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
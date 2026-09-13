import React, { useState, useRef, useEffect } from 'react';
import { CrossIcon } from '../Icons';
import { Image as ImageIcon, Upload, Link2, Check, AlertCircle } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (src: string, alt?: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        resetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (file?: File) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewSrc(result);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInsert = () => {
    if (activeTab === 'upload') {
      if (!previewSrc) {
        setError('Please choose or drop an image file first.');
        return;
      }
      onInsert(previewSrc, altText.trim() || 'Uploaded image');
      resetAndClose();
    } else {
      if (!imageUrl.trim()) {
        setError('Please enter an image URL.');
        return;
      }
      onInsert(imageUrl.trim(), altText.trim() || 'Note image');
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setImageUrl('');
    setAltText('');
    setPreviewSrc(null);
    setError(null);
    setIsDragging(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          resetAndClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
        role="dialog"
        aria-label="Insert Image"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100 font-semibold">
            <ImageIcon className="w-5 h-5 text-[#335CFF]" />
            <h3>Insert Image</h3>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
          >
            <CrossIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setError(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#335CFF] text-[#335CFF]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setError(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#335CFF] text-[#335CFF]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {previewSrc ? (
                <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-2">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSrc(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-2 text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Remove &amp; choose another
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center ${
                    isDragging
                      ? 'border-[#335CFF] bg-[#335CFF]/5 dark:bg-[#335CFF]/10'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-[#335CFF] bg-neutral-50/50 dark:bg-neutral-800/30'
                  }`}
                >
                  <div className="p-3 rounded-full bg-[#335CFF]/10 text-[#335CFF]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      Click to upload
                    </span>{' '}
                    <span className="text-neutral-500">or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">PNG, JPG, WebP, GIF or SVG (max. 5MB)</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Image Web URL
                </label>
                <input
                  type="url"
                  autoFocus
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://example.com/image.png"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF]"
                />
              </div>

              {imageUrl.trim() && (
                <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2 flex justify-center">
                  <img
                    src={imageUrl.trim()}
                    alt="Preview"
                    className="max-h-40 rounded-lg object-contain"
                    onError={() => setError('Unable to load image preview from this URL.')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Alt text field */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Alt description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive label for this image"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={resetAndClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#335CFF] text-white hover:bg-blue-600 cursor-pointer transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Insert Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};

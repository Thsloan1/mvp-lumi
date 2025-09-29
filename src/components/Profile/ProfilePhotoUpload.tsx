import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, User } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (photoUrl: string) => void;
  className?: string;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoUpdate,
  className = ''
}) => {
  const { currentUser, uploadProfilePhoto } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image must be smaller than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const photoUrl = await uploadProfilePhoto(file);
      onPhotoUpdate(photoUrl);
    } catch (error) {
      setPreviewUrl(currentPhotoUrl || null);
      // Error handled by context
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoUpdate('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
        Profile Photo
      </label>
      
      <div className="flex items-center space-x-6">
        {/* Current Photo Display */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F8F6F4] border-2 border-[#E6E2DD] flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
              ${dragOver 
                ? 'border-[#C44E38] bg-[#C44E38] bg-opacity-5' 
                : 'border-[#E6E2DD] hover:border-[#C44E38] hover:bg-[#F8F6F4]'
              }
            `}
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1A1A1A] mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>
      </div>

      {previewUrl && (
        <div className="mt-4 flex space-x-3">
          <Button
            onClick={handleRemovePhoto}
            variant="outline"
            size="sm"
            icon={X}
          >
            Remove Photo
          </Button>
        </div>
      )}
    </div>
  );
};
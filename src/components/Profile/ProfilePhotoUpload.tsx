import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, User, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { ImageUtils } from '../../utils/imageUtils';

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
  const { currentUser, uploadProfilePhoto, toast } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    const validation = ImageUtils.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      toast.error('Invalid file', validation.error || 'Please select a valid image');
      return;
    }

    // Create preview using utility
    ImageUtils.createImagePreview(file)
      .then(preview => {
        setPreviewUrl(preview);
        uploadFile(file);
      })
      .catch(err => {
        setError('Failed to read file');
        toast.error('Upload failed', 'Could not read the selected file');
      });
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoUpdate('');
    setError(null);
    toast.info('Photo removed', 'Profile photo has been removed');
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const photoUrl = await uploadProfilePhoto(file);
      onPhotoUpdate(photoUrl);
      toast.success('Photo updated!', 'Your profile photo has been saved');
    } catch (error) {
      setError('Upload failed');
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
    setError(null);
    toast.info('Photo removed', 'Profile photo has been removed');
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
              ${error 
                ? 'border-red-300 bg-red-50' 
                : dragOver 
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
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              // Reset input value to allow re-selecting same file
              e.target.value = '';
            }}
            className="hidden"
            aria-label="Upload profile photo"
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
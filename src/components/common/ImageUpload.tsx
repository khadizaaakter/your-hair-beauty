import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
    label?: string;
}

export function ImageUpload({ value, onChange, className = '', label = 'Image' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            // api.upload returns a string URL directly
            const url = await api.upload(file);
            if (url) {
                onChange(url);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            <div className="relative">
                {value ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-50 group">
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Error+Loading+Image';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed border-slate-300 rounded-lg p-6
                            flex flex-col items-center justify-center gap-2
                            cursor-pointer hover:border-neon-pink hover:bg-slate-50 transition-colors
                            aspect-video
                            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8 text-slate-400" />
                        )}
                        <p className="text-sm text-slate-500 font-medium">
                            {isUploading ? 'Uploading...' : 'Click to upload image'}
                        </p>
                        <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
}

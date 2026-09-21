import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { compressImage } from '../../lib/imageCompress';
import { removeListingImage, uploadListingImage } from '../lib/portalApi';

interface PhotoUploaderProps {
  userId: string;
  images: string[];
  onChange: (next: string[]) => void;
  /** null = no limit known/applied. The database enforces the real limit too. */
  max: number | null;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ userId, images, onChange, max }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(images);
  latest.current = images;
  const uploadedThisSession = useRef<Set<string>>(new Set());

  const remaining = max === null ? Number.POSITIVE_INFINITY : Math.max(0, max - images.length - uploading);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    let picked = Array.from(files);
    if (picked.length > remaining) {
      setError(`Your plan allows up to ${max} photos per listing, so only the first ${remaining} were added.`);
      picked = picked.slice(0, remaining);
    }
    if (picked.length === 0) return;

    setUploading((n) => n + picked.length);
    // One at a time keeps memory and mobile data usage predictable.
    for (const file of picked) {
      try {
        const blob = await compressImage(file);
        const url = await uploadListingImage(userId, blob);
        uploadedThisSession.current.add(url);
        latest.current = [...latest.current, url];
        onChange(latest.current);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'One of the photos could not be uploaded.');
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (url: string) => {
    latest.current = latest.current.filter((u) => u !== url);
    onChange(latest.current);
    if (uploadedThisSession.current.has(url)) {
      uploadedThisSession.current.delete(url);
      removeListingImage(url);
    }
  };

  const makeCover = (url: string) => {
    latest.current = [url, ...latest.current.filter((u) => u !== url)];
    onChange(latest.current);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold text-gray-700">Photos</p>
        <p className="text-[11px] text-gray-400 tabular-nums">
          {images.length}
          {max !== null ? ` of ${max}` : ''} · first photo is the cover
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50 group">
            <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            {i === 0 && (
              <span className="absolute top-1 left-1 text-[9px] font-bold bg-black text-white px-1.5 py-0.5 rounded">Cover</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-1 bg-gradient-to-t from-black/50 to-transparent">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  title="Make cover photo"
                  className="w-6 h-6 rounded bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center cursor-pointer"
                >
                  <Star className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                title="Remove photo"
                className="w-6 h-6 rounded bg-white/90 hover:bg-white text-red-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="aspect-square rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-md border border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/40 text-gray-400 hover:text-emerald-600 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-bold">Add photos</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {max !== null && remaining === 0 && uploading === 0 && (
        <p className="text-[11px] text-amber-700">You've reached the {max}-photo limit for your plan.</p>
      )}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
};

'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconWrapper from '@/components/ui/IconWrapper';
import ModalityTabs from '@/components/ui/ModalityTaps';
import { MRI_MODALITIES } from '@/lib/constants';
import { MriModality } from '@/lib/types';
import { AlertTriangle as AlertIcon, Loader2, Maximize, Minimize } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface MRIViewerProps {
  patientId: string;
  initialModality?: MriModality;
  // mriData?: Patient['mriData'];
}

const MRIViewer: React.FC<MRIViewerProps> = ({
  patientId,
  MRIThumb,
  initialModality = MRI_MODALITIES[0],
  // mriData
}) => {
  const [currentModality, setCurrentModality] = useState<MriModality>(initialModality);
  const [currentSlice, setCurrentSlice] = useState(50); // Range 0–100 (make dynamic later)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Placeholder image URL logic (replace with real image URL logic later)
    const segm = MRIThumb;

    setImageUrl(segm);

    // Simulate image loading delay
    const timer = setTimeout(() => {
      if (segm.startsWith('https://placehold.co')) {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientId, currentModality, currentSlice, zoomLevel]);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <Card className="flex flex-col">
      <h3 className="text-xl font-semibold text-gray-800 mb-1">MRI Viewer</h3>
      <p className="text-sm text-gray-500 mb-4">Patient: {patientId}</p>

      <div className="mb-4">
        <ModalityTabs currentModality={currentModality} onSelectModality={setCurrentModality} />
      </div>

      <div className="bg-gray-900 rounded-lg p-1 sm:p-2 flex-grow flex items-center justify-center relative overflow-hidden aspect-square min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-10">
            <IconWrapper icon={Loader2} className="w-12 h-12 text-white animate-spin mb-2" />
            <p className="text-white text-sm">Loading image...</p>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <IconWrapper icon={AlertIcon} className="w-12 h-12 text-red-400 mb-2" />
            <p className="text-red-400 text-sm">Error loading MRI scan.</p>
            <p className="text-xs text-gray-400 mt-1">Could not load: {imageUrl}</p>
          </div>
        ) : (
          imageUrl && (
            <Image
              key={imageUrl}
              src={imageUrl}
              alt={`${currentModality} scan for ${patientId}, slice ${currentSlice}`}
              width={500}
              height={500}
              objectFit="contain"
              className={`transition-transform duration-200 ease-out ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ transform: `scale(${zoomLevel})` }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              unoptimized={imageUrl.startsWith('https://placehold.co')}
            />
          )
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="slice-slider" className="block text-sm font-medium text-gray-700 mb-1">
            Slice: {currentSlice}
          </label>
          <input
            id="slice-slider"
            type="range"
            min="0"
            max="100"
            value={currentSlice}
            onChange={(e) => setCurrentSlice(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
            disabled={isLoading || hasError}
          />
        </div>
        <div>
          <label htmlFor="zoom-slider" className="block text-sm font-medium text-gray-700 mb-1">
            Zoom: {zoomLevel.toFixed(1)}x
          </label>
          <input
            id="zoom-slider"
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
            disabled={isLoading || hasError}
          />
        </div>
        <div className="flex justify-center space-x-2 pt-2">
          <Button
            onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.2))}
            variant="secondary"
            icon={Minimize}
            disabled={isLoading || hasError || zoomLevel <= 0.5}
          >
            Zoom Out
          </Button>
          <Button
            onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.2))}
            variant="secondary"
            icon={Maximize}
            disabled={isLoading || hasError || zoomLevel >= 3}
          >
            Zoom In
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MRIViewer;

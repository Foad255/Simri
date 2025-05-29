// simri-app/components/ui/ModalityTabs.tsx
'use client';

import { MRI_MODALITIES } from '@/lib/constants';
import { MriModality } from '@/lib/types';
import React from 'react';

interface ModalityTabsProps {
  currentModality: MriModality;
  onSelectModality: (modality: MriModality) => void;
  availableModalities?: MriModality[];
}

const ModalityTabs: React.FC<ModalityTabsProps> = ({
  currentModality,
  onSelectModality,
  availableModalities = MRI_MODALITIES,
}) => (
  <div className="flex space-x-1 border-b border-gray-300">
    {availableModalities.map(modality => (
      <button
        key={modality}
        onClick={() => onSelectModality(modality)}
        className={`px-4 py-2 -mb-px font-medium text-sm rounded-t-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
          ${currentModality === modality
            ? 'border-blue-500 border-b-2 text-blue-600 bg-white shadow-sm'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
      >
        {modality}
      </button>
    ))}
  </div>
);

export default ModalityTabs;

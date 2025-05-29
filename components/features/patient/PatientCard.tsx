// components/features/patient/PatientCard.tsx
'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ERROR_IMAGE_THUMB } from '@/lib/constants'; // Make sure ERROR_IMAGE_THUMB is a valid path to a fallback image
import { Patient } from '@/lib/types'; // Assuming the Patient type is correctly defined here
import { Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const [imgSrc, setImgSrc] = useState(
     patient.mriThumb || ERROR_IMAGE_THUMB // Prioritize display_thumbnail_url if available, then mriThumb, then fallback
  );

  return (
    <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col !p-0 overflow-hidden bg-white border border-gray-200 rounded-xl">
      <Link href={`/patient/${patient.public_id}`} className="block group">
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
          {/* Using Next/Image with proper fallbacks for better performance and error handling */}
          <Image
            src={imgSrc}
            alt={`MRI thumbnail for Patient ID: ${patient.public_id}`}
            fill // Use 'fill' to cover the parent div
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
            style={{ objectFit: 'cover' }} // Equivalent to objectFit="cover"
            onError={() => setImgSrc(ERROR_IMAGE_THUMB)} // Fallback on error
            // unoptimized={imgSrc.startsWith('https://placehold.co') || imgSrc === ERROR_IMAGE_THUMB} // Keep unoptimized for placeholders
          />
          {/* Optional: Add an overlay on hover */}
          <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
            <Eye className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow"> {/* Inner padding */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={`Patient ID: ${patient.public_id}`}>
          <Link href={`/patient/${patient.public_id}`} className="hover:text-blue-600 transition-colors">
            {patient.public_id}
          </Link>
        </h3>
        <div className="mt-auto">
          <Link href={`/patient/${patient.public_id}`}>
            <Button className="w-full text-base py-2" icon={Eye} variant="secondary" iconClassName="w-5 h-5">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;

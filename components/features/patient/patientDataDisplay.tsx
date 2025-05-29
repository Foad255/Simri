// components/features/patient/patientDataDisplay.tsx
'use client';

import { Niivue } from '@niivue/niivue'; // Import Niivue
import React, { useEffect, useRef } from 'react';

import Image from 'next/image';


interface ClinicalData {
  age?: number | string;
  sex?: string;
  diagnosis?: string;
  [key: string]: any;
}

interface PatientMriFileUrls {
  t1c?: string | null;
  t1n?: string | null;
  t2f?: string | null;
  t2w?: string | null;
  seg?: string | null;
  [key: string]: string | null | undefined;
}

interface PatientDetailsForDisplay {
  patient_id: string;
  clinical_data?: ClinicalData;
  mri_files_urls?: PatientMriFileUrls;
  display_thumbnail_url: string | null;
  // Add any other fields you want to display
}

interface PatientDataDisplayProps {
  title: string;
  patientDetails: PatientDetailsForDisplay;
}

const PatientDataDisplay: React.FC<PatientDataDisplayProps> = ({ title, patientDetails }) => {
  const niivueContainerRef = useRef<HTMLCanvasElement>(null);

  const niivueInstance = useRef<Niivue | null>(null);


  useEffect(() => {
    if (niivueContainerRef.current && patientDetails.mri_files_urls) {
      if (!niivueInstance.current) {
        niivueInstance.current = new Niivue({
          // Optional: Customize Niivue options
          // onLocationChange: (loc) => console.log(loc),
        });
        niivueInstance.current.attachToCanvas(niivueContainerRef.current);
      }

      const volumes: any[] = [];

      // Add T1c volume if available
      if (patientDetails.mri_files_urls.t1c) {
        volumes.push({ url: patientDetails.mri_files_urls.t1c, volume: { hdr: null, img: null } });
      }
      // Add T2w volume if available
      if (patientDetails.mri_files_urls.t2w) {
         volumes.push({ url: patientDetails.mri_files_urls.t2w, volume: { hdr: null, img: null } });
      }
      // Add Segmentation volume if available (often loaded as an overlay)
      if (patientDetails.mri_files_urls.seg) {
        volumes.push({
          url: patientDetails.mri_files_urls.seg,
          volume: { hdr: null, img: null },
          // Optional: Configure segmentation overlay properties
          // colormap: "red", // Example: set a colormap for the segmentation
          // opacity: 0.5,
        });
      }
      // Add other modalities as needed (t1n, t2f)

      if (volumes.length > 0) {
        niivueInstance.current.loadVolumes(volumes);
      } else {
        // Clear viewer if no volumes are available
      }
    }
  }, [patientDetails]); // Re-run effect if MRI URLs change
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div className="flex-grow">
        <p className="text-gray-700 mb-2"><strong>Patient ID:</strong> {patientDetails.patient_id}</p>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">MRI Scan:</h3>
        {patientDetails.mri_files_urls && Object.values(patientDetails.mri_files_urls).some(url => url) ? (
          <div className="relative w-full aspect-video bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
            {/* This is where the NIfTI viewer will be rendered */}
            <canvas ref={niivueContainerRef} className="w-full h-full"></canvas>
            {/* If you want to show a placeholder while Niivue loads, you can use the display_thumbnail_url here */}
            {/* {!niivueInstance.current?.volumes.length && patientDetails.display_thumbnail_url && (
                // <img
                //   src={patientDetails.display_thumbnail_url}
                //   alt={`Thumbnail for ${patientDetails.patient_id}`}
                //   className="absolute inset-0 w-full h-full object-contain bg-gray-200"
                // />
              )} */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md text-gray-500">
            No MRI files available for viewing.
          </div>
        )}

        {/* Optionally display the primary thumbnail if a full viewer isn't active or as a fallback */}
        {patientDetails.display_thumbnail_url && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Primary Thumbnail:</h3>
            <Image
            src={patientDetails.display_thumbnail_url || '/placeholder.jpg'} // fallback if null
            alt={`Thumbnail for ${patientDetails.patient_id}`}
            width={300} // Provide fixed width
            height={300} // Provide fixed height
            className="w-full max-w-xs mx-auto rounded-md shadow-sm border border-gray-200 object-contain"
            unoptimized // Optional: remove this if your image is from a whitelisted domain
          />

          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDataDisplay;

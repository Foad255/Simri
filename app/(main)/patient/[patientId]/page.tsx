'use client';

import PatientDataDisplay from '@/components/features/patient/patientDataDisplay';
import { AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link'; // For linking back or to other pages
import React, { useCallback, useEffect, useState } from 'react';

// --- TypeScript Interfaces ---
interface PatientMriFileUrls { // URLs for NIfTI files or other image types
  t1c?: string | null;
  t1n?: string | null;
  t2f?: string | null;
  t2w?: string | null;
  seg?: string | null; // Could be NIfTI or a derived image/thumbnail for segmentation
  [key: string]: string | null | undefined; // Allow other modalities
}

interface ClinicalData {
  age?: number | string; // string if not parsed yet
  sex?: string;
  diagnosis?: string;
  [key: string]: any; // Allow other clinical fields
}

interface SimilarPatientBase {
  patient_id: string;
  score: number;
}

// Details for any patient (main or similar) when fetched
interface PatientDetails {
  patient_id: string;
  clinical_data?: ClinicalData;
  mri_files_urls?: PatientMriFileUrls;      // Signed URLs for various NIfTI files/modalities
  display_thumbnail_url: string | null;   // Signed URL for the primary display thumbnail
  similar_patients?: SimilarPatientBase[]; // Only present for the main query patient on initial load
}

// Structure for items in the similar patients list, potentially holding their full details once fetched
interface SimilarPatientListItem extends SimilarPatientBase {
  details?: PatientDetails | null; // Store fetched details here
  isLoading?: boolean;
}

// Expected API response structure when fetching a single patient's data
interface PatientApiResponse {
  patient: PatientDetails;
}

interface PatientComparisonPageProps {
  params: {
    patientId: string;
  };
}

const PatientComparisonPage: React.FC<PatientComparisonPageProps> =  ({ params }) => {
  const { patientId: initialPatientId } = React.use(params);

  const resolvedParams = React.use(params);
  console.log('Resolved params:', resolvedParams);


  const [mainPatient, setMainPatient] = useState<PatientDetails | null>(null);
  // List of similar patients, enhanced with their fetched details and loading state
  const [similarPatientsList, setSimilarPatientsList] = useState<SimilarPatientListItem[]>([]);
  // The currently selected similar patient whose details are shown for comparison
  const [selectedSimilarPatientDetails, setSelectedSimilarPatientDetails] = useState<PatientDetails | null>(null);

  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generic function to fetch data for any patient ID
  const fetchPatientDataById = useCallback(async (id: string): Promise<PatientDetails | null> => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(`Failed to fetch data for patient ${id}: ${errorData.message || response.statusText}`);
      }
      const data: PatientApiResponse = await response.json();
      return data.patient;
    } catch (err: any) {
      console.error(`Error fetching patient ${id}:`, err);
      setError(err.message || 'An unknown error occurred while fetching patient data.');
      return null;
    }
  }, []);

  // Effect for loading the main (query) patient's data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingMain(true);
      const patientData = await fetchPatientDataById(initialPatientId);


      if (patientData) {
        setMainPatient(patientData);
        // Initialize similarPatientsList from the main patient's data
        if (patientData.similar_patients) {
          console.log("heres",patientData.similar_patients)
          setSimilarPatientsList(
            patientData.similar_patients.map(sp => ({ ...sp, details: null, isLoading: false }))
          );
        } else {
          setSimilarPatientsList([]);
        }
      }
      // Error state is handled by fetchPatientDataById
      setIsLoadingMain(false);
    };
    if (initialPatientId) {
      loadInitialData();
    }
  }, [initialPatientId, fetchPatientDataById]);

  // Handler for selecting a similar patient from the list
  const handleSelectSimilarPatient = async (similarPatientId: string) => {
    // Update loading state for the specific similar patient in the list
    setSimilarPatientsList(prevList =>
      prevList.map(sp =>
        sp.patient_id === similarPatientId ? { ...sp, isLoading: true } : sp
      )
    );
    setSelectedSimilarPatientDetails(null); // Clear previous selection display while loading

    const patientData = await fetchPatientDataById(similarPatientId);

    if (patientData) {
      setSelectedSimilarPatientDetails(patientData);
    }
    // Update the list item with fetched details and reset its loading state
    setSimilarPatientsList(prevList =>
      prevList.map(sp =>
        sp.patient_id === similarPatientId ? { ...sp, details: patientData, isLoading: false } : sp
      )
    );
    // Error state is handled by fetchPatientDataById and displayed globally or per item
  };


  console.log("Similar Paitents" , similarPatientsList)
  // --- Render Logic ---
  if (isLoadingMain) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error && !mainPatient) { // Show critical error if main patient failed to load
    return (
      <div className="container mx-auto p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-red-600">Error Loading Patient Data</p>
        <p className="text-gray-700 mt-2">{error}</p>
        <Link href="/upload" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Try Uploading Again
        </Link>
      </div>
    );
  }

  if (!mainPatient) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-700">Patient not found.</p>
        <p className="text-gray-600 mt-2">The requested patient ID ({initialPatientId}) could not be found.</p>
        <Link href="/explore" className="mt-6 inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
            Explore Other Patients
        </Link>
      </div>
    );
  }


  console.log('Main Patient Data:', mainPatient);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Patient MRI Comparison</h1>

      {error && ( // Display non-critical errors (e.g., for similar patient fetch)
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Comparison Area: Query Patient vs Selected Similar Patient */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <PatientDataDisplay
          title="Query Patient"
          patientDetails={mainPatient}
        />
        {selectedSimilarPatientDetails ? (
          <PatientDataDisplay
            title="Selected Similar Patient"
            patientDetails={selectedSimilarPatientDetails}
          />
        ) : (
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center bg-gray-50 min-h-[300px]">
            <Info className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-500 text-center">Select a similar patient from the list below to compare.</p>
          </div>
        )}
      </div>

      {/* List of Similar Patients */}
{/* Tumor Match Results */}
<div className="mt-12 bg-white p-6 rounded-xl shadow-xl">
  <h2 className="text-2xl font-bold mb-2 text-gray-800">Top Tumor Matches</h2>
  <p className="text-sm text-gray-500 mb-6">
    These patients have MRI and tumor features most similar to the query case, based on image-based AI comparison.
  </p>

  {similarPatientsList.length > 0 ? (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {similarPatientsList.map((sp) => (
        <li
          key={sp.patient_id}
          className={`group relative p-4 border rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg cursor-pointer ${
            selectedSimilarPatientDetails?.patient_id === sp.patient_id
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <button
            onClick={() => handleSelectSimilarPatient(sp.patient_id)}
            disabled={sp.isLoading}
            className="w-full text-left"
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-md font-semibold ${
                selectedSimilarPatientDetails?.patient_id === sp.patient_id
                  ? 'text-blue-700'
                  : 'text-blue-600 group-hover:text-blue-800'
              }`}>
                Patient #{sp.patient_id}
              </span>
              {sp.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              ) : (
                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Score: {sp.score.toFixed(4)}
                </span>
              )}
            </div>

            {sp.details?.display_thumbnail_url && (
              <img
                src={sp.details.display_thumbnail_url}
                alt={`MRI Thumbnail for ${sp.patient_id}`}
                className="w-full h-32 object-cover rounded-md border mb-2"
              />
            )}

            {sp.details && (
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Diagnosis:</strong> {sp.details.clinical_data?.diagnosis || 'Unknown'}</p>
                <p><strong>Age:</strong> {sp.details.clinical_data?.age || 'N/A'}</p>
                <p><strong>Sex:</strong> {sp.details.clinical_data?.sex || 'N/A'}</p>
              </div>
            )}
          </button>
        </li>
      ))}
    </ul>
  ) : (
    !isLoadingMain && (
      <p className="text-gray-600 text-sm italic">No tumor matches found for this patient.</p>
    )
  )}
</div>


    </div>
  );
};

export default PatientComparisonPage;

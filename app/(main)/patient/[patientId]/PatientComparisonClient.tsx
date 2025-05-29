// app/(main)/patient/[patientId]/PatientComparisonClient.tsx
'use client';

import PatientDataDisplay from '@/components/features/patient/patientDataDisplay';
import { AlertTriangle, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';


interface PatientDetails {
  patient_id: string;
  clinical_data?: any;
  mri_files_urls?: any;
  display_thumbnail_url: string | null;
  similar_patients?: { patient_id: string; score: number }[];
}

interface SimilarPatientListItem {
  patient_id: string;
  score: number;
  details?: PatientDetails | null;
  isLoading?: boolean;
}

interface Props {
  initialPatient: PatientDetails | null;
  initialPatientId: string;
}

const PatientComparisonClient = ({ initialPatient, initialPatientId }: Props) => {
  const [mainPatient, setMainPatient] = useState<PatientDetails | null>(initialPatient);
  const [similarPatientsList, setSimilarPatientsList] = useState<SimilarPatientListItem[]>([]);
  const [selectedSimilarPatientDetails, setSelectedSimilarPatientDetails] = useState<PatientDetails | null>(null);
  const [isLoadingMain, setIsLoadingMain] = useState(!initialPatient);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data helper
  const fetchPatientDataById = useCallback(async (id: string): Promise<PatientDetails | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(errorData.message || response.statusText);
      }
      const data = await response.json();
      return data.patient;
    } catch (err: any) {
      setError(err.message || 'Error fetching patient data.');
      return null;
    }
  }, []);

  // Load initial data if not provided by server (fallback)
  useEffect(() => {
    if (!initialPatient && initialPatientId) {
      (async () => {
        setIsLoadingMain(true);
        const patientData = await fetchPatientDataById(initialPatientId);
        if (patientData) {
          setMainPatient(patientData);
          if (patientData.similar_patients) {
            setSimilarPatientsList(
              patientData.similar_patients.map(sp => ({ ...sp, details: null, isLoading: false }))
            );
          } else {
            setSimilarPatientsList([]);
          }
        }
        setIsLoadingMain(false);
      })();
    } else if (initialPatient && initialPatient.similar_patients) {
      // Initialize similar patients from server data
      setSimilarPatientsList(
        initialPatient.similar_patients.map(sp => ({ ...sp, details: null, isLoading: false }))
      );
      setIsLoadingMain(false);
    }
  }, [initialPatient, initialPatientId, fetchPatientDataById]);

  // Handle selecting a similar patient
  const handleSelectSimilarPatient = async (similarPatientId: string) => {
    setSimilarPatientsList(prev =>
      prev.map(sp => (sp.patient_id === similarPatientId ? { ...sp, isLoading: true } : sp))
    );
    setSelectedSimilarPatientDetails(null);

    const patientData = await fetchPatientDataById(similarPatientId);

    if (patientData) {
      setSelectedSimilarPatientDetails(patientData);
    }

    setSimilarPatientsList(prev =>
      prev.map(sp =>
        sp.patient_id === similarPatientId ? { ...sp, details: patientData, isLoading: false } : sp
      )
    );
  };

  // Render loading state
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

  // Error loading main patient
  if (error && !mainPatient) {
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

  // Main render UI
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Patient MRI Comparison</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <PatientDataDisplay title="Query Patient" patientDetails={mainPatient} />
        {selectedSimilarPatientDetails ? (
          <PatientDataDisplay title="Selected Similar Patient" patientDetails={selectedSimilarPatientDetails} />
        ) : (
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center bg-gray-50 min-h-[300px]">
            <Info className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-500 text-center">Select a similar patient from the list below to compare.</p>
          </div>
        )}
      </div>

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
                    <span
                      className={`text-md font-semibold ${
                        selectedSimilarPatientDetails?.patient_id === sp.patient_id
                          ? 'text-blue-700'
                          : 'text-blue-600 group-hover:text-blue-800'
                      }`}
                    >
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
                    <Image
                      height={300}
                      width={300}
                      src={sp.details.display_thumbnail_url}
                      alt={`MRI Thumbnail for ${sp.patient_id}`}
                      className="w-full h-32 object-cover rounded-md border mb-2"
                    />
                  )}

                  {sp.details && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Diagnosis:</strong> {sp.details.clinical_data?.diagnosis || 'Unknown'}
                      </p>
                      <p>
                        <strong>Age:</strong> {sp.details.clinical_data?.age || 'N/A'}
                      </p>
                      <p>
                        <strong>Sex:</strong> {sp.details.clinical_data?.sex || 'N/A'}
                      </p>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !isLoadingMain && <p className="text-gray-600 text-sm italic">No tumor matches found for this patient.</p>
        )}
      </div>
    </div>
  );
};

export default PatientComparisonClient;

'use client';

import {
  AlertTriangle as AlertIcon,
  Loader2,
  Search,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PatientCard from '@/components/features/patient/PatientCard';
import PatientCardSkeleton from '@/components/features/patient/PatientCardSkeleton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconWrapper from '@/components/ui/IconWrapper';
import { Patient } from '@/lib/types';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_DELAY = 300;

interface PatientDashboardClientProps {
  initialPatients: Patient[];
  initialHasMore: boolean;
}

export default function PatientDashboardClient({
  initialPatients,
  initialHasMore,
}: PatientDashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [allPatients, setAllPatients] = useState<Patient[]>(initialPatients);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [fetchedPatientIds, setFetchedPatientIds] = useState<Set<string>>(
    new Set(initialPatients.map((p) => p.patient_id))
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(newSearchTerm.toLowerCase());
    }, SEARCH_DEBOUNCE_DELAY);
  };

  const fetchPatients = useCallback(
    async (isInitialFetch = false) => {
      if (isInitialFetch) {
        setIsLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const skip = isInitialFetch ? 0 : allPatients.length;
      const currentFetchedIdsArray = isInitialFetch ? [] : Array.from(fetchedPatientIds);

      try {
        const queryParams = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          skip: skip.toString(),
        });

        if (!isInitialFetch && currentFetchedIdsArray.length > 0) {
          queryParams.append('fetched', currentFetchedIdsArray.join(','));
        }

        const res = await fetch(`/api/patients?${queryParams}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            message: `Server responded with ${res.status}`,
          }));
          throw new Error(`Failed to fetch patients: ${errorData.message || res.statusText}`);
        }
        const { patients: newPatients, hasMore: newHasMore } = await res.json();

        if (!Array.isArray(newPatients)) {
          console.error("API didn't return an array of patients:", newPatients);
          throw new Error('Received invalid patient data from the server.');
        }

        setAllPatients((prev) => (isInitialFetch ? newPatients : [...prev, ...newPatients]));
        setFetchedPatientIds((prevIds) => {
          const updatedIds = new Set(prevIds);
          newPatients.forEach((p: Patient) => updatedIds.add(p.patient_id));
          return updatedIds;
        });
        setHasMore(newHasMore);
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        setError(err.message || 'An unknown error occurred while fetching patient data.');
      } finally {
        if (isInitialFetch) {
          setIsLoadingInitial(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [allPatients.length, fetchedPatientIds]
  );

  useEffect(() => {
    // Reset when user clears search, or reload explicitly
    if (allPatients.length === 0) {
      fetchPatients(true);
    }
    // Cleanup debounce timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) {
      return allPatients;
    }
    return allPatients.filter(
      (p) =>
        p.public_id.toLowerCase().includes(debouncedSearchTerm) ||
        (p.clinical?.diagnosis &&
          p.clinical.diagnosis.toLowerCase().includes(debouncedSearchTerm))
    );
  }, [allPatients, debouncedSearchTerm]);

  const isCurrentlySearching = debouncedSearchTerm !== '';

  const renderPatientList = () => {
    if (isLoadingInitial) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-semibold text-gray-700">Loading patients...</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 w-full">
            {Array.from({ length: PAGE_SIZE / 2 }).map((_, index) => (
              <PatientCardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="text-center py-12 bg-red-50 border-red-200 shadow-md">
          <IconWrapper icon={AlertIcon} className="w-14 h-14 text-red-500 mx-auto mb-6" />
          <p className="text-red-700 text-2xl font-bold mb-3">Error Loading Patients</p>
          <p className="text-red-600 text-lg">{error}</p>
          <Button onClick={() => fetchPatients(true)} variant="primary" className="mt-8">
            Retry Loading
          </Button>
        </Card>
      );
    }

    if (filteredPatients.length > 0) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.public_id} patient={patient} />
            ))}
          </div>
          {hasMore && !isCurrentlySearching && (
            <div className="text-center mt-10">
              <Button
                onClick={() => fetchPatients(false)}
                variant="secondary"
                className="px-8 py-3 text-lg"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" />
                    Loading More...
                  </>
                ) : (
                  'Load More Patients'
                )}
              </Button>
            </div>
          )}
          {!hasMore && allPatients.length > 0 && !isCurrentlySearching && (
            <div className="text-center mt-10 text-gray-500 italic">
              You have reached the end of the patient list.
            </div>
          )}
        </>
      );
    }

    return (
      <Card className="text-center py-12 bg-blue-50 border-blue-200 shadow-md">
        <IconWrapper icon={AlertIcon} className="w-14 h-14 text-blue-500 mx-auto mb-6" />
        <p className="text-blue-700 text-2xl font-bold mb-3">
          {isCurrentlySearching ? 'No matching patients found.' : 'No patients available yet.'}
        </p>
        {isCurrentlySearching && (
          <p className="text-blue-600 text-lg mb-6">Try a different search term or clear the search.</p>
        )}
        {!isCurrentlySearching && !allPatients.length && (
          <Link href="/upload">
            <Button variant="primary" className="px-8 py-3 text-lg" icon={UploadCloud}>
              Upload First MRI Data
            </Button>
          </Link>
        )}
      </Card>
    );
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-10">
        <div className="relative">
          <input
            type="search"
            placeholder="Search by Patient ID or Diagnosis..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-14 text-base md:text-lg border border-gray-300 rounded-xl shadow-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out bg-white"
          />
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Patients list */}
      {renderPatientList()}
    </>
  );
}

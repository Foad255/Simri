



// pages/index.tsx or pages/patients/index.tsx
'use client';

import { AlertTriangle as AlertIcon, Loader2, Search, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PatientCard from '@/components/features/patient/PatientCard'; // Assuming this component is reasonably optimized
import PatientCardSkeleton from '@/components/features/patient/PatientCardSkeleton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconWrapper from '@/components/ui/IconWrapper';
import { Patient } from '@/lib/types'; // Assuming this type is correct and available

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds for search debounce

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // For actual filtering after debounce
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // For the very first page load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For "Load More" button
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetchedPatientIds, setFetchedPatientIds] = useState<Set<string>>(new Set()); // Use Set for efficient ID tracking

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);



  // Debounce search input to avoid excessive filtering/API calls
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm); // Update input field immediately for responsiveness

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(newSearchTerm.toLowerCase());
    }, SEARCH_DEBOUNCE_DELAY);
  };

  const fetchPatients = useCallback(async (isInitialFetch = false) => {
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

      console.log(queryParams)

      // Only add 'fetched' parameter if not initial load and IDs exist
      // This helps the backend avoid sending already fetched patients if that logic is implemented
      if (!isInitialFetch && currentFetchedIdsArray.length > 0) {
        queryParams.append('fetched', currentFetchedIdsArray.join(','));
      }


      const res = await fetch(`/api/patients?${queryParams}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Server responded with ${res.status}` }));
        throw new Error(`Failed to fetch patients: ${errorData.message || res.statusText}`);
      }
      const { patients: newPatients, hasMore: newHasMore } = await res.json();

      if (!Array.isArray(newPatients)) {
        console.error("API didn't return an array of patients:", newPatients);
        throw new Error('Received invalid patient data from the server.');
      }

      setAllPatients(prev => (isInitialFetch ? newPatients : [...prev, ...newPatients]));
      setFetchedPatientIds(prevIds => {
        const updatedIds = new Set(prevIds);
        newPatients.forEach((p: Patient) => updatedIds.add(p.patient_id)); // Ensure patient_id exists
        return updatedIds;
      });
      setHasMore(newHasMore);

    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'An unknown error occurred while fetching patient data.');
      // Potentially set hasMore to false or handle retries more gracefully
    } finally {
      if (isInitialFetch) {
        setIsLoadingInitial(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [allPatients.length, fetchedPatientIds]); // Dependencies for useCallback

  // Effect for initial data load
  useEffect(() => {
    // Reset states for a completely fresh load (e.g., on component mount)
    setAllPatients([]);
    setFetchedPatientIds(new Set());
    setHasMore(true);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    fetchPatients(true); // true indicates initial fetch

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for mount/unmount logic. `fetchPatients` is memoized.


  // Memoize filtered patients to avoid re-calculating on every render unless relevant states change
  const filteredPatients = useMemo(() => {

    if (!debouncedSearchTerm) {
      return allPatients; // No search term, return all loaded patients
    }
    return allPatients.filter(p =>
      p.public_id.toLowerCase().includes(debouncedSearchTerm) ||
      (p.clinical?.diagnosis && p.clinical.diagnosis.toLowerCase().includes(debouncedSearchTerm))
    );
  }, [allPatients, debouncedSearchTerm]);

  const isCurrentlySearching = debouncedSearchTerm !== '';

  // Conditional rendering logic
  const renderPatientList = () => {
    if (isLoadingInitial) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          {/* <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" /> */}
          <p className="text-xl font-semibold text-gray-700">Loading patients...</p>
          {/* OPTIONAL: Add Skeleton Loaders here for better perceived performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 w-full">
            {Array.from({ length: PAGE_SIZE / 2 }).map((_, index) => <PatientCardSkeleton key={index} />)}
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
            {filteredPatients.map(patient => (
              <PatientCard key={patient.public_id} patient={patient} />
            ))}
          </div>
          {hasMore && !isCurrentlySearching && (
            <div className="text-center mt-10">
              <Button
                onClick={() => fetchPatients(false)} // false for "load more"
                variant="secondary"
                className="px-8 py-3 text-lg"
                disabled={isLoadingMore} // Disable only when loading more
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

    // No patients found or no search results
    return (
      <Card className="text-center py-12 bg-blue-50 border-blue-200 shadow-md">
        <IconWrapper icon={AlertIcon} className="w-14 h-14 text-blue-500 mx-auto mb-6" />
        <p className="text-blue-700 text-2xl font-bold mb-3">
          {isCurrentlySearching ? 'No matching patients found.' : 'No patients available yet.'}
        </p>
        {isCurrentlySearching && (
          <p className="text-blue-600 text-lg mb-6">Try a different search term or clear the search.</p>
        )}
        {!isCurrentlySearching && !allPatients.length && ( // Show upload only if truly no patients and not a failed search
          <Link href="/upload" passHref legacyBehavior>
            <Button as="a" variant="primary" className="px-8 py-3 text-lg" icon={UploadCloud}>
              Upload First MRI Data
            </Button>
          </Link>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Hero Section (Keep as is, seems fine) */}
        <div className="mb-12 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl">
          <h2 className="text-4xl font-extrabold mb-3 leading-tight">Welcome to Simri Platform</h2>
          <p className="text-xl opacity-95 max-w-2xl">
            Explore, analyze, and compare brain MRI scans using AI-powered similarity matching.
          </p>
          <div className="mt-8 flex space-x-4">
            <Link href="/upload" passHref legacyBehavior>
              <Button as="a" variant="solid" className="px-6 py-3 text-lg bg-white text-blue-700 hover:bg-blue-100 transition duration-300" icon={UploadCloud}>
                Upload New Data
              </Button>
            </Link>
            <Link href="/explore" passHref legacyBehavior>
              <Button as="a" variant="outline" className="px-6 py-3 text-lg border-white text-white hover:bg-white hover:bg-opacity-20 transition duration-300">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative">
            <input
              type="search"
              placeholder="Search by Patient ID or Diagnosis..."
              value={searchTerm} // Controlled by searchTerm for immediate input feedback
              onChange={handleSearchChange}
              className="w-full p-4 pl-14 text-base md:text-lg border border-gray-300 rounded-xl shadow-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Patient Dashboard Section */}
        <div>
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Patient Dashboard</h3>
          {renderPatientList()}
        </div>


      </div>
    </div>
  );
}



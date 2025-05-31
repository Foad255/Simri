import { Patient } from '@/lib/types';
import Link from 'next/link';
import PatientDashboardClient from './PatientDashboardClient';

const PAGE_SIZE = 12;

async function fetchInitialPatients(): Promise<{ patients: Patient[]; hasMore: boolean }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/patients?limit=${PAGE_SIZE}&skip=0`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch patients for SSR');
    return { patients: [], hasMore: false };
  }

  const data = await res.json();
  if (!Array.isArray(data.patients)) {
    console.error("API didn't return an array of patients");
    return { patients: [], hasMore: false };
  }

  return { patients: data.patients, hasMore: data.hasMore };
}

export default async function ExplorePage() {
  const { patients, hasMore } = await fetchInitialPatients();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="mb-12 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl">
          <h2 className="text-4xl font-extrabold mb-3 leading-tight">Welcome to Simri Platform</h2>
          <p className="text-xl opacity-95 max-w-2xl">
            Explore, analyze, and compare brain MRI scans using AI-powered similarity matching.
          </p>
          <div className="mt-8 flex space-x-4">
            <Link href="/upload">
              <button
                type="button"
                className="px-6 py-3 text-lg bg-white text-blue-700 hover:bg-blue-100 transition duration-300 rounded"
              >
                Upload New Data
              </button>
            </Link>
            <Link href="/">
              <button
                type="button"
                className="px-6 py-3 text-lg border-white text-white hover:bg-white hover:bg-opacity-20 transition duration-300 rounded"
              >
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* --- Start of Disclaimer --- */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 mb-10 rounded-lg shadow-sm">
          <p className="font-semibold text-lg mb-2">Important Disclaimer:</p>
          <p className="text-base leading-relaxed">
            The MRI data displayed on Simri is sourced from the{' '}
            <strong className="font-bold">BraTS 2025 Lighthouse Challenge dataset</strong>, a public,
            research-oriented dataset. This platform is developed for **research, educational, and
            demonstration purposes only**. It is not intended for, and must not be used as, a
            diagnostic tool for medical conditions or a substitute for professional medical advice.
            <br />
            To protect patient privacy, all real patient identifiers, including names, IDs, sex, and
            detailed clinical diagnoses, have been **anonymized or replaced with mock data**. The
            visualized MRIs are representations from the dataset for demonstrating the AI similarity
            matching capabilities.
            <br />
            We acknowledge the immense contribution of the BraTS organizers and the dedicated team
            under Mariam Aboian MD/PhD, Nazanin Maleki, MD, Raisa Amiruddin, MBBS, Ahmed Moawad, MD,
            Nikolay Yordanov, MD, Athanasios Gkampenis, MD, and Pascal Fehringer, MD candidate,
            for making this valuable dataset available.
          </p>
        </div>
        {/* --- End of Disclaimer --- */}

        <h3 className="text-3xl font-bold text-gray-800 mb-8">Patient Dashboard</h3>

        {/* Pass initial data as props */}
        <PatientDashboardClient initialPatients={patients} initialHasMore={hasMore} />
      </div>
    </div>
  );
}

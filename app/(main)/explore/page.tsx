// app/explore/page.tsx
import Link from 'next/link';

import { Patient } from '@/lib/types';
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

        <h3 className="text-3xl font-bold text-gray-800 mb-8">Patient Dashboard</h3>

        {/* Pass initial data as props */}
        <PatientDashboardClient initialPatients={patients} initialHasMore={hasMore} />
      </div>
    </div>
  );
}

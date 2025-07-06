// app/(main)/patient/[patientId]/page.tsx

import { redirect } from 'next/navigation';
import PatientComparisonClient from './PatientComparisonClient';

interface PatientDetails {
  patient_id: string;
  clinical_data?: any;
  mri_files_urls?: any;
  display_thumbnail_url: string | null;
  similar_patients?: { patient_id: string; score: number }[];
}

interface PatientApiResponse {
  patient: PatientDetails;
}



type PatientPageProps = {
  params: Promise<{ patientId: string }>;
};


const PatientComparisonPage = async ({ params }: PatientPageProps) => {
    if ( 1 === 1 )  {
      redirect('/');
    }


  const resolvedParams = await params; // await the promise
  const initialPatientId = resolvedParams.patientId;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'


  const res = await fetch(`${baseUrl}/api/patients/${initialPatientId}`);

  if (!res.ok) {
    // Optionally, you can handle errors differently here (e.g., throw)
    // For now, pass null so client can show error UI
    return <PatientComparisonClient initialPatient={null} initialPatientId={initialPatientId} />;
  }

  const data: PatientApiResponse = await res.json();

  return <PatientComparisonClient initialPatient={data.patient} initialPatientId={initialPatientId} />;
};

export default PatientComparisonPage;












// simri-app/lib/api.ts
import { MOCK_PATIENTS_DATA, NEW_UPLOAD_THUMB } from './constants';
import { Patient, UploadClinicalData } from './types';

// Simulate API delay
const apiDelay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


// /lib/api.ts
export async function getPatients(params?: {
  page?: number;
  limit?: number;
  search?: string;
  diagnosis?: string;
  ageMin?: string;
  ageMax?: string;
}): Promise<Patient[]> {
  const query = new URLSearchParams();

  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.diagnosis) query.append('diagnosis', params.diagnosis);
  if (params?.ageMin) query.append('ageMin', params.ageMin);
  if (params?.ageMax) query.append('ageMax', params.ageMax);

  const res = await fetch(`/api/patients?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}




export async function getPatientById(patientId: string): Promise<Patient | undefined> {
  const res = await fetch(`/api/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}`);
  const result = await res.json();
  return result?.patient ?? null;

}




export async function handlePatientUploadOnServer(
  formData: FormData
): Promise<Patient> {
  console.log("API: Handling patient upload on server (mock)");
  await apiDelay(1500); // Simulate processing and storage

  const clinicalDataString = formData.get('clinicalData') as string;
  const patientId = formData.get('patientId') as string;
  // Files would be accessed using formData.get('t1c'), formData.get('t1n'), etc.
  // e.g. const t1cFile = formData.get('t1c') as File;

  if (!clinicalDataString || !patientId) {
    throw new Error("Missing clinical data or patient ID in form data.");
  }
  const clinicalData = JSON.parse(clinicalDataString) as Omit<UploadClinicalData, 'age'|'patientId'> & {age: number};


  // Simulate file storage and get a thumbnail URL
  const mriThumb = NEW_UPLOAD_THUMB;

  const newPatient: Patient = {
    patient_id: patientId,
    clinical: {
      age: clinicalData.age,
      sex: clinicalData.sex,
      diagnosis: clinicalData.diagnosis,
    },
    mriThumb: mriThumb,
    similar_patients: [], // Similarity calculation would happen on the backend
    // mriData: { /* paths to stored NIfTI files after processing */ }
  };

  const existingIndex = MOCK_PATIENTS_DATA.findIndex(p => p.patient_id === newPatient.patient_id);
  if (existingIndex > -1) {
    // For this mock, we'll allow overwriting for simplicity in testing.
    // In a real app, this might be an error or an update operation.
    console.warn(`API: Patient with patient_id ${newPatient.patient_id} already exists. Overwriting (mock).`);
    MOCK_PATIENTS_DATA[existingIndex] = newPatient;
  } else {
    MOCK_PATIENTS_DATA.push(newPatient);
  }
  console.log("API: New patient added/updated in mock data:", newPatient.patient_id);
  return JSON.parse(JSON.stringify(newPatient));
}

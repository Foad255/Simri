// simri-app/lib/api.ts
import { Patient } from './types';


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




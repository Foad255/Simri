// simri-app/lib/types.ts
export interface ClinicalData {
  age: number;
  sex: "M" | "F" | "Other";
  diagnosis: string;
  [key: string]: any; // For additional clinical fields
}

export interface SimilarPatient {
  patient_id: string;
  score: number;
}

export interface Patient {
  patient_id: string;
  public_id: string;
  clinical?: ClinicalData;
  mriThumb: string; // URL to a thumbnail
  mriData?: { // Optional: for actual MRI data links or identifiers for MRIViewer
    t1c: string; // URL or path to T1c NIfTI file/slices
    t1n: string; // URL or path to T1n NIfTI file/slices
    t2f: string; // URL or path to T2f NIfTI file/slices
    t2w: string; // URL or path to T2w NIfTI file/slices
  };
  similar_patients: SimilarPatient[];
}

export interface UploadClinicalData {
  patientId: string
  age: string; // Input might be string initially
  sex: "M" | "F" | "Other";
  diagnosis: string;
}

export type MriModalityKey = 't1c' | 't1n' | 't2f' | 't2w';

export interface MriFiles {
  t1c: File | null;
  t1n: File | null;
  t2f: File | null;
  t2w: File | null;
}

export type MriModality = "T1c" | "T1n" | "T2f" | "T2w";

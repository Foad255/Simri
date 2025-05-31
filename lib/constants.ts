// simri-app/lib/constants.ts
import { MriModality, MriModalityKey, UploadClinicalData } from './types'; // Ensure UploadClinicalData and MriModalityKey are in types.ts

// Define the MriModalityKey type if it's not already in ./types
// export type MriModalityKey = 't1c' | 't1n' | 't2f' | 't2w' | 'seg'; // Example: include 'seg' if applicable

export interface SamplePatient extends UploadClinicalData {
  displayName: string;
  s3Keys: Record<MriModalityKey, string>;
  External: boolean;
  // patientId, age, sex, diagnosis are from UploadClinicalData
  // Ensure 'age' is a string here if UploadClinicalData expects it as string initially.
}

/**
 * @description MRI modalities expected for upload and processing.
 * The backend's thumbnail generation previously looked for a 'seg' modality.
 * If segmentation files are still relevant (e.g., for thumbnails or specific processing)
 * and users should upload them, consider adding "SEG" or a similar key here
 * and ensure the `MriModality` type and related logic accommodate it.
 * The keys here are typically used for display and then converted to lowercase for backend/internal keys.
 */
export const MRI_MODALITIES: MriModality[] = ["T1c", "T1n", "T2f", "T2w" , "Seg"]; // As per your provided list

/**
 * @description Modalities required by the Machine Learning service for generating embeddings.
 * These should be lowercase and match the keys expected by your Python ML service.
 */
export const ML_SERVICE_REQUIRED_MODALITIES: MriModalityKey[] = ['t1c', 't1n', 't2f', 't2w', 'seg'];


export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const PLACEHOLDER_MRI_THUMB_BASE = "https://placehold.co/300x200/E0E7FF/4F46E5?text=MRI";
export const PLACEHOLDER_MRI_VIEW_BASE = "https://placehold.co/500x500/111827/FFFFFF";
export const ERROR_IMAGE_THUMB = "https://placehold.co/300x200/FF0000/FFFFFF?text=Error";
export const ERROR_IMAGE_VIEW = "https://placehold.co/500x500/FF0000/FFFFFF?text=Load+Error";
export const NEW_UPLOAD_THUMB = "https://placehold.co/300x200/CCEEFF/336699?text=NewMRI";

// --- Sample Patient Data ---
// NOTE: Ensure these patientId values and s3Keys match actual, pre-uploaded data on your S3 bucket.
// The s3Keys should use lowercase modality keys ('t1c', 't1n', etc.).
export const SAMPLE_PATIENTS: SamplePatient[] = [
  {
    patientId: 'Sample_Patient1', // From your example
    displayName: 'Sample Patient 1 (GBM)',
    age: '58', // Example age, ensure it's a string
    sex: 'M',    // Example sex
    External: true,
    diagnosis: 'Glioblastoma', // Example diagnosis
    s3Keys: {
      t1c: 'patients/Sample_Patient1/t1c-BraTS-GLI-00138-000-t1c.nii.gz',
      t1n: 'patients/Sample_Patient1/t1n-BraTS-GLI-00138-000-t1n.nii.gz',
      t2f: 'patients/Sample_Patient1/t2f-BraTS-GLI-00138-000-t2f.nii.gz',
      t2w: 'patients/Sample_Patient1/t2w-BraTS-GLI-00138-000-t2w.nii.gz',
      seg: 'patients/Sample_Patient1/seg-BraTS-GLI-00138-000-seg.nii.gz'
    },
  },
  {
    patientId: 'Sample_Patient2', // From your example
    displayName: 'Sample Patient 2 (LGG)',
    age: '45', // Example age, ensure it's a string
    sex: 'F',    // Example sex
    External: true,
    diagnosis: 'Low-Grade Glioma', // Example diagnosis
    s3Keys: {
      t1c: 'patients/Sample_Patient2/t1c-BraTS-GLI-00823-000-t1c.nii.gz', // Using generic filename part for example consistency
      t1n: 'patients/Sample_Patient2/t1n-BraTS-GLI-00823-000-t1n.nii.gz',
      t2f: 'patients/Sample_Patient2/t2f-BraTS-GLI-00823-000-t2f.nii.gz',
      t2w: 'patients/Sample_Patient2/t2w-BraTS-GLI-00823-000-t2w.nii.gz',
      seg: 'patients/Sample_Patient2/seg-BraTS-GLI-00823-000-seg.nii.gz',
    },
  },
  // Add more sample patients following the structure above
];

// MOCK DATA (Commented out as per your original file)
// export const MOCK_PATIENTS_DATA: Patient[] = [ ... ];

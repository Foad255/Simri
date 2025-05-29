import clientPromise from '@/lib/mongodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

// --- S3 Configuration ---
const S3_REGION = process.env.AWS_S3_REGION || 'eu-north-1';
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'glioblastoma001'; // YOUR S3 BUCKET NAME
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error("AWS credentials are not set in environment variables for [patientId] route.");
}

const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Creates a pre-signed URL for an S3 object.
 * @param key - The S3 object key.
 * @param expiresIn - Duration in seconds for which the URL is valid (default 1 hour).
 * @returns A promise that resolves to the pre-signed URL string.
 */
const createSignedUrl = async (key: string, expiresIn: number = 3600): Promise<string | null> => {
  if (!S3_BUCKET_NAME) {
    console.error("S3 bucket name not configured on server for signed URL generation.");
    return null;
  }
  if (!key) {
    console.warn("Attempted to create signed URL for an undefined or empty key.");
    return null;
  }
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.error(`Error creating signed URL for key ${key}:`, error);
    return null; // Return null or throw, depending on desired error handling
  }
};

export async function GET(request: Request, context: { params: { patientId: string } }) {
  // No need to await context.params, it's directly available.
  const patientId = context.params.patientId;

  if (!patientId) {
    return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('brain_mri_db'); // YOUR DB NAME
    const scansCollection = db.collection('mri_scans'); // YOUR COLLECTION NAME

    // Fetch the patient document from MongoDB
    // Ensure your document structure matches:
    // patient_id: string
    // files_s3_keys: { t1c: "s3_key", t1n: "s3_key", ... }
    // display_thumbnail_s3_key: "s3_key_for_thumbnail.png"
    // similar_patients: [{ patient_id: "sim_id", score: 0.9 }, ...]
    // clinical: { age, sex, diagnosis }
    const patientDoc = await scansCollection.findOne({ public_id: patientId });

    if (!patientDoc) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    // Generate signed URL for the main display thumbnail
    let displayThumbnailUrl: string | null = null;
    if (patientDoc.thumbnails) {
      displayThumbnailUrl = await createSignedUrl(`${patientDoc.patient_id}.png`);
    } else {
      console.warn(`No display_thumbnail_s3_key found for patient ${patientId}`);
    }

    // Generate signed URLs for all NIfTI files

    const mriFilesUrls: Record<string, string | null> = {};
    if (patientDoc.files_s3_keys && typeof patientDoc.files_s3_keys === 'object') {
      for (const modality in patientDoc.files_s3_keys) {
        const key = patientDoc.files_s3_keys[modality];
        if (key) {
          mriFilesUrls[modality] = await createSignedUrl(key);
        } else {
          mriFilesUrls[modality] = null;
        }
      }
    }

    const mri_scans = patientDoc.files

    // Prepare similar patients data (it's already stored with IDs and scores)
    const similarPatientsData = (patientDoc.similar_patients || []).slice(0, 3);

    return NextResponse.json({
      patient: {
        patient_id: patientDoc.public_id,
        clinical_data: patientDoc.clinical || {}, // Include clinical data
        mri_files_urls: mriFilesUrls, // Signed URLs for NIfTI files (t1c, t1n, etc.)
        mri_scans: mri_scans,
        display_thumbnail_url: displayThumbnailUrl, // Signed URL for the main display thumbnail
        similar_patients: similarPatientsData, // List of { patient_id, score }
        // Add any other fields from patientDoc you need on the frontend
      },
    });

  } catch (error: any) {
    console.error(`Error fetching patient data for ${patientId}:`, error);
    return NextResponse.json({ message: "Server error fetching patient data", error: error.message }, { status: 500 });
  }
}

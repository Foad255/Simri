// In your Next.js API route file (e.g., app/api/patients/route.ts)

import clientPromise from '@/lib/mongodb'; // Ensure this path is correct
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
// Importing from the updated constants.ts
import {
  MRI_MODALITIES as APP_MRI_MODALITIES_DISPLAY, // For iterating user uploads based on display names
  ML_SERVICE_REQUIRED_MODALITIES // Lowercase keys for ML service
} from '@/lib/constants'; // Ensure this path is correct

// --- Configuration ---
const S3_REGION = process.env.AWS_S3_REGION;
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'brain_mri_db';
const MONGODB_COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'mri_scans';

// Basic server configuration validation
if (!S3_REGION || !S3_BUCKET_NAME || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !ML_SERVICE_URL) {
    console.error("Critical Server Configuration Error: Missing one or more environment variables (AWS S3/Credentials, ML Service URL).");
    // This error will be thrown when the module loads if Next.js doesn't handle it earlier.
    // For API routes, it's better to check within the handler or use a middleware.
}

const s3Client = new S3Client({
    region: S3_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
});


// --- Helper Functions (generateEmbeddingViaMLService, findSimilarPatients, generateAndUploadThumbnail) ---
// (Ensure these functions are defined as in your previous setup or the examples provided before)

async function generateEmbeddingViaMLService(
    s3FileKeys: Record<string, string>, // Expects lowercase keys like t1c, t1n
    patientId: string
): Promise<number[]> {
    if (!ML_SERVICE_URL || !S3_BUCKET_NAME) {
        throw new Error("ML service or S3 bucket not configured for embedding generation.");
    }
    const s3KeysForMLService: Record<string, string | undefined> = {};
    ML_SERVICE_REQUIRED_MODALITIES.forEach(modKey => {
        s3KeysForMLService[modKey] = s3FileKeys[modKey];
    });

    const payload = {
        patient_id: patientId,
        s3_bucket: S3_BUCKET_NAME,
        s3_keys: s3KeysForMLService,
    };
    console.log(`Calling ML service for patient ${patientId} with payload:`, JSON.stringify(payload, null, 2));
    const response = await fetch(`${ML_SERVICE_URL}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`ML service returned error ${response.status}: ${errorBody}`);
        throw new Error(`Error from ML embedding service: ${response.statusText} - ${errorBody}`);
    }
    const result = await response.json();
    if (!result.embedding || !Array.isArray(result.embedding)) {
        throw new Error("Invalid embedding format received from ML service.");
    }
    console.log(`Successfully received embedding for patient ${patientId}.`);
    return result.embedding;
}

async function findSimilarPatients(
    embedding: number[],
    patientIdToExclude: string,
    limit: number = 3
): Promise<Array<{ patient_id: string; score: number }>> {
    console.log(`Finding similar patients for ${patientIdToExclude} (excluding self).`);
    const client = await clientPromise;
    const db = client.db(MONGODB_DB_NAME);
    const scansCollection = db.collection(MONGODB_COLLECTION_NAME);
    const pipeline = [
        {
            $vectorSearch: {
                index: 'vector_index', // IMPORTANT: Your Atlas Vector Search index name
                path: 'embedding', // Field containing the vector
                queryVector: embedding,
                numCandidates: Math.max(50, limit * 10), // Adjust as needed
                limit: limit + 1, // Fetch one more to exclude self if present
            },
        },
        { $match: { patient_id: { $ne: patientIdToExclude } } },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                patient_id: 1,
                score: { $meta: 'vectorSearchScore' },
            },
        },
    ];
    try {
        const similarDocs = await scansCollection.aggregate(pipeline).toArray();
        // @ts-ignore
        return similarDocs as Array<{ patient_id: string; score: number }>;
    } catch (error) {
        console.error("Error during vector search:", error);
        if (error instanceof Error && (error.message.includes("index not found") || error.message.includes("no such index"))) {
            console.error("Vector search index 'vector_index_embedding' might be missing or misconfigured in MongoDB Atlas.");
        }
        return [];
    }
}

async function generateAndUploadThumbnail(
    sourceNiftiS3Key: string, // s3 key of the source nifti (e.g., a seg file)
    patientId: string, // patientId to make target key unique
    targetS3Bucket: string
): Promise<string | undefined> {
    // This is a placeholder. Implement actual thumbnail generation (e.g., call a lambda, use a library).
    // For now, it assumes a naming convention if a source is provided.
    const targetThumbnailS3Key = `patients/${patientId}/thumbnail_display.png`;
    console.log(`Placeholder: Thumbnail generation triggered for ${sourceNiftiS3Key}. Target: ${targetThumbnailS3Key}`);
    // Example: If you had a lambda or another service:
    // await invokeThumbnailGenerationService(sourceNiftiS3Key, targetS3Bucket, targetThumbnailS3Key);
    // For now, we just return the intended key. The frontend will show a placeholder if it's not found.
    // If a thumbnail is *actually* generated and uploaded by this function, this key will be valid.
    // If not, the frontend needs to handle missing thumbnails gracefully.
    // To simulate a successful (but fake) upload for testing:
    // try {
    //   await s3Client.send(new PutObjectCommand({
    //     Bucket: targetS3Bucket,
    //     Key: targetThumbnailS3Key,
    //     Body: "fake-thumbnail-data", // Replace with actual image buffer
    //     ContentType: "image/png",
    //   }));
    //   return targetThumbnailS3Key;
    // } catch (e) { console.error("Fake thumbnail upload failed", e); return undefined; }
    return targetThumbnailS3Key; // Return intended key, real generation is external to this example
}


// --- API Route Handler ---
export async function POST(request: Request) {
    // Check critical server config within handler to ensure response can be sent
    if (!S3_REGION || !S3_BUCKET_NAME || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !ML_SERVICE_URL) {
        console.error("API Route Error: Server configuration incomplete.");
        return NextResponse.json({ message: "Server configuration error. Please contact support." }, { status: 503 });
    }

    let patientId: string | null = null;
    let clinicalData: any; // Parsed from JSON
    let s3KeysForProcessing: Record<string, string> = {}; // Lowercase keys: t1c, t1n etc.
    let isSampleRequest = false;

    const contentType = request.headers.get('content-type') || '';

    try {
        if (contentType.includes('application/json')) {
            const jsonData = await request.json();
            // Frontend now sends `isSample: true` for sample patients.
            // The key `sampleData` was in your provided code, changed to `isSample` for consistency.
            if (!jsonData.isSample) {
                return NextResponse.json({ message: "JSON payload received, but 'isSample' flag is missing or false." }, { status: 400 });
            }

            isSampleRequest = true;
            patientId = jsonData.patientId;
            clinicalData = jsonData.clinicalData; // This should already be the object like {age: number, sex: string, ...}
            s3KeysForProcessing = jsonData.s3Keys; // These are pre-existing S3 keys from the sample definition

            if (!patientId || !clinicalData || !s3KeysForProcessing || Object.keys(s3KeysForProcessing).length === 0) {
                return NextResponse.json({ message: "Missing patientId, clinicalData, or s3Keys in sample data payload." }, { status: 400 });
            }
            console.log(`Processing sample patient: ${patientId}`);

        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const clinicalDataJSON = formData.get('clinicalData') as string | null;
            patientId = formData.get('patientId') as string | null;

            if (!clinicalDataJSON || !patientId) {
                return NextResponse.json({ message: "Missing clinicalData or patientId in FormData." }, { status: 400 });
            }
            clinicalData = JSON.parse(clinicalDataJSON); // Clinical data from form

            const uploadPromises: Promise<void>[] = [];
            // APP_MRI_MODALITIES_DISPLAY contains ["T1c", "T1n", ...], convert to lowercase for form key
            const expectedModalitiesFromClient = APP_MRI_MODALITIES_DISPLAY.map(m => m.toLowerCase());

            for (const modalityKey of expectedModalitiesFromClient) {
                const file = formData.get(modalityKey) as File | null;
                if (file) {
                    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    // Construct S3 key: patients/{patientId}/{modalityKey}-{sanitizedFileName}
                    const s3Key = `patients/${patientId}/${modalityKey}-${sanitizedFileName}`;
                    const fileBuffer = Buffer.from(await file.arrayBuffer());

                    const putCommand = new PutObjectCommand({
                        Bucket: S3_BUCKET_NAME!,
                        Key: s3Key,
                        Body: fileBuffer,
                        ContentType: file.type || 'application/octet-stream',
                    });

                    uploadPromises.push(
                        s3Client.send(putCommand).then(() => {
                            s3KeysForProcessing[modalityKey] = s3Key;
                            console.log(`Uploaded ${modalityKey} for ${patientId} to S3: ${s3Key}`);
                        }).catch(err => {
                             console.error(`Failed to upload ${modalityKey} for ${patientId}:`, err);
                             throw new Error(`S3 upload failed for ${modalityKey}: ${err.message}`);
                        })
                    );
                }
            }
            await Promise.all(uploadPromises);

            if (Object.keys(s3KeysForProcessing).length === 0) {
                return NextResponse.json({ message: "No MRI files were successfully uploaded to S3." }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: `Unsupported Content-Type: ${contentType}. Expected application/json or multipart/form-data.` }, { status: 415 });
        }

        // --- Common processing logic for both sample and new uploads ---
        if (!patientId) { // Should be set by now
            return NextResponse.json({ message: "Patient ID is missing after initial processing." }, { status: 500 });
        }

        // Validate presence of ML-required modalities
        const missingMLModalities = ML_SERVICE_REQUIRED_MODALITIES.filter(mod => !s3KeysForProcessing[mod]);
        if (missingMLModalities.length > 0) {
            console.warn(`Patient ${patientId}: Missing S3 keys for ML modalities: ${missingMLModalities.join(', ')}. Embedding quality may be affected.`);
            // Depending on ML service, this might be a critical error or handled gracefully (e.g., zero tensor).
            // For now, proceeding.
        }

        // Thumbnail Generation Attempt
        let displayThumbnailS3Key: string | undefined = undefined;
        const segModalityKeyForThumbnail = 'seg'; // Use 'seg' if available in s3KeysForProcessing
                                              // Your current APP_MRI_MODALITIES_DISPLAY does not include "SEG" for new uploads.
                                              // So, for new uploads, this branch won't be hit unless 'seg' is added or another key is chosen.
        const sourceKeyForThumbnail = s3KeysForProcessing[segModalityKeyForThumbnail] || s3KeysForProcessing['t1c']; // Fallback to t1c if seg not present

        if (sourceKeyForThumbnail) {
            try {
                // Pass patientId for unique target key, and the S3_BUCKET_NAME
                displayThumbnailS3Key = await generateAndUploadThumbnail(sourceKeyForThumbnail, patientId, S3_BUCKET_NAME!);
                if (displayThumbnailS3Key) {
                    console.log(`Intended thumbnail S3 key for patient ${patientId}: ${displayThumbnailS3Key}`);
                }
            } catch (thumbError: any) {
                console.error(`Thumbnail processing failed for patient ${patientId}: ${thumbError.message}`);
                // Non-critical, continue without a specific thumbnail key
            }
        } else {
            console.log(`No suitable source modality (e.g., '${segModalityKeyForThumbnail}' or 't1c') found in s3KeysForProcessing for patient ${patientId} to generate a thumbnail from.`);
        }


        const embedding = await generateEmbeddingViaMLService(s3KeysForProcessing, patientId);
        const similarPatients = await findSimilarPatients(embedding, patientId, 3);

        const clientDB = await clientPromise;
        const db = clientDB.db(MONGODB_DB_NAME);
        const scansCollection = db.collection(MONGODB_COLLECTION_NAME);

        const patientDocument = {
            // Use patient_id from the form/sample as the primary identifier in DB
            patient_id: patientId,
            // public_id can be the same or different based on your needs
            public_id: patientId,
            External: true,
            clinical: { // Ensure age is stored as a number if that's your schema for queries
                ...clinicalData,
                age: parseInt(String(clinicalData.age), 10) || 0, // Convert age to number
            },
            files_s3_keys: s3KeysForProcessing, // Lowercase keys
            display_thumbnail_s3_key: displayThumbnailS3Key, // May be undefined
            embedding: embedding,
            similar_patients: similarPatients,
            uploaded_at: new Date(),
            is_sample_patient: isSampleRequest, // Flag if it was a sample
            ...(isSampleRequest && { last_processed_as_sample_at: new Date() }),
        };

        // Upsert: update if patient_id exists, insert if not.
        const updateResult = await scansCollection.updateOne(
            { patient_id: patientId },
            { $set: patientDocument },
            { upsert: true }
        );

        if (updateResult.upsertedId) {
            console.log(`Patient data for ${patientId} (${isSampleRequest ? 'sample' : 'new'}) inserted into MongoDB.`);
        } else if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {
            console.log(`Patient data for ${patientId} (${isSampleRequest ? 'sample' : 'new'}) updated in MongoDB.`);
        } else if (updateResult.matchedCount > 0 && updateResult.modifiedCount === 0) {
            console.log(`Patient data for ${patientId} (${isSampleRequest ? 'sample' : 'new'}) found but not modified (data might be identical).`);
        }


        return NextResponse.json({
            message: `Patient data for ${patientId} (${isSampleRequest ? 'sample' : 'new'}) processed successfully.`,
            patient_id: patientId,
            operation: updateResult.upsertedId ? 'inserted' : 'updated',
        }, { status: 201 });

    } catch (error: any) {
        console.error(`POST /api/patients - Error for patientId '${patientId || 'unknown'}':`, error);
        // Determine status code based on error type if possible
        let statusCode = 500;
        if (error.message.includes("S3") || error.message.includes("ML service") || error.message.includes("MongoDB")) {
            statusCode = 503; // Service Unavailable for downstream issues
        } else if (error.message.includes("Invalid") || error.message.includes("Missing")) {
            statusCode = 400; // Bad Request for data issues
        }
        return NextResponse.json({
            message: error.message || "An unexpected error occurred.",
            details: error.stack, // Optionally include stack in dev
            patient_id_processed: patientId
        }, { status: statusCode });
    }
}


function parseParamInt(param: string | null, defaultValue: number): number {
  const parsed = parseInt(param || '', 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Parse query params safely
  const search = url.searchParams.get('search')?.trim() || '';
  const diagnosis = url.searchParams.get('diagnosis')?.trim() || '';
  const ageMin = parseParamInt(url.searchParams.get('ageMin'), 0);
  const ageMax = parseParamInt(url.searchParams.get('ageMax'), 120);
  const limit = parseParamInt(url.searchParams.get('limit'), 12);
  const skip = parseParamInt(url.searchParams.get('skip'), 0);
  const fetchedIds = url.searchParams.get('fetched')?.split(',').filter(id => id) || [];

  const CDN_BASE_URL = process.env.CDN_URL || `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'brain_mri_db');
    const scans = db.collection(process.env.MONGODB_COLLECTION_NAME || 'mri_scans');

    // Build query using $and to combine all filters properly
    const andFilters: any[] = [
      { External: { $ne: true } }
    ];

    if (search) {
      andFilters.push({
        $or: [
          { public_id: { $regex: search, $options: 'i' } },
          { 'clinical.diagnosis': { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (diagnosis) {
      andFilters.push({ 'clinical.diagnosis': { $regex: diagnosis, $options: 'i' } });
    }

    if (ageMin > 0 || ageMax < 120) {
      const ageFilter: any = {};
      if (ageMin > 0) ageFilter.$gte = ageMin;
      if (ageMax < 120) ageFilter.$lte = ageMax;
      andFilters.push({ 'clinical.age': ageFilter });
    }

    if (fetchedIds.length) {
      andFilters.push({ public_id: { $nin: fetchedIds } });
    }

    const query = andFilters.length > 0 ? { $and: andFilters } : {};

    const cursor = scans.find(query).sort({ uploaded_at: -1 }).skip(skip).limit(limit);
    const results = await cursor.toArray();
    const totalCount = await scans.countDocuments(query);

    const patients = results.map(scan => {
      let thumbnailUrl = `${CDN_BASE_URL}/${scan.patient_id}.png`;

      if (scan.display_thumbnail_s3_key) {
        thumbnailUrl = `${CDN_BASE_URL}/${scan.display_thumbnail_s3_key}`;
      } else if (scan.files_s3_keys?.seg) {
        // seg is usually a NIfTI file, so this might not be a valid image URL,
        // but kept here for fallback. You might want to handle differently.
        thumbnailUrl = `${CDN_BASE_URL}/${scan.files_s3_keys.seg}`;
      }

      return {
        ...scan,
        _id: scan._id.toString(),
        patient_id: scan.public_id,
        clinical_data: scan.clinical,
        mriThumb: thumbnailUrl,
        diagnosis: scan.clinical?.diagnosis,
        age: scan.clinical?.age,
        uploadedDate: scan.uploaded_at,
      };
    });

    return NextResponse.json({
      patients,
      hasMore: skip + patients.length < totalCount,
      totalCount,
    });
  } catch (error: any) {
    console.error('GET /api/patients - Error fetching patients:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message || String(error) },
      { status: 500 }
    );
  }
}

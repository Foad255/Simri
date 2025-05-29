'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconWrapper from '@/components/ui/IconWrapper';
import Modal from '@/components/ui/Modal';
import { MRI_MODALITIES, SAMPLE_PATIENTS, SamplePatient } from '@/lib/constants';
import { MriFiles, MriModality, MriModalityKey, UploadClinicalData } from '@/lib/types';
import { AlertTriangle as AlertIcon, FileCheck2, Info, Loader2, Replace, UploadCloud, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useRef, useState } from 'react';

const UploadForm: React.FC = () => {
  const router = useRouter();
  const initialFilesState: MriFiles = MRI_MODALITIES.reduce(
    (acc, mod) => ({ ...acc, [mod.toLowerCase() as MriModalityKey]: null }),
    {} as MriFiles
  );
  const initialClinicalData: UploadClinicalData = { patientId: '', age: '', sex: 'M', diagnosis: '' };

  const [files, setFiles] = useState<MriFiles>(initialFilesState);
  const [clinicalData, setClinicalData] = useState<UploadClinicalData>(initialClinicalData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; isError: boolean }>({
    isOpen: false, title: '', message: '', isError: false,
  });

  const [isSamplePatientModalOpen, setIsSamplePatientModalOpen] = useState(false);
  const [selectedSamplePatient, setSelectedSamplePatient] = useState<SamplePatient | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (modality: MriModality, event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedSamplePatient) return;
    const file = event.target.files?.[0];
    setFiles(prev => ({ ...prev, [modality.toLowerCase() as MriModalityKey]: file || null }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Allow patientId changes even for samples if needed, but other clinical data should be from sample
    const { name, value } = e.target;
     if (selectedSamplePatient && name !== 'patientId') { // Example: allow overriding patientId if desired
        // Or completely disable if selectedSamplePatient is true
        // For now, let's assume clinical data is fixed once a sample is loaded.
        // To make them editable, remove this condition or parts of it.
        // setClinicalData(prev => ({ ...prev, [name]: value }));
        return;
     }
    setClinicalData(prev => ({ ...prev, [name]: value }));
  };

  const clearForm = (clearInputs = true) => {
    setFiles(initialFilesState);
    setClinicalData(initialClinicalData);
    setSelectedSamplePatient(null);
    setUploadProgress(0);
    if (clearInputs) {
      MRI_MODALITIES.forEach(mod => {
        const inputEl = fileInputRefs.current[mod.toLowerCase()];
        if (inputEl) inputEl.value = '';
      });
    }
  };

  const loadSamplePatient = (sample: SamplePatient) => {
    clearForm(false); // Clear current files and non-essential state
    setClinicalData({
      patientId: sample.patientId, // Use the sample's ID
      age: String(sample.age), // Ensure age is a string for the input field
      sex: sample.sex,
      diagnosis: sample.diagnosis,
    });

    const sampleFilesDisplay: MriFiles = MRI_MODALITIES.reduce((acc, mod) => {
        const key = mod.toLowerCase() as MriModalityKey;
        if (sample.s3Keys[key]) {
            const fileName = sample.s3Keys[key].split('/').pop() || `${key}_sample_file.nii`;
            acc[key] = { name: `${fileName} (Sample)`, size: 0, type: 'application/octet-stream', lastModified: Date.now() } as File;
        } else {
            acc[key] = null;
        }
        return acc;
    }, {} as MriFiles);
    setFiles(sampleFilesDisplay); // For display purposes
    setSelectedSamplePatient(sample);
    setIsSamplePatientModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setModalState({ isOpen: false, title: '', message: '', isError: false });

    if (!clinicalData.patientId || !clinicalData.age || !clinicalData.diagnosis) {
      setModalState({ isOpen: true, title: 'Validation Error', message: 'Patient ID, Age, and Diagnosis are required.', isError: true });
      return;
    }
    if (isNaN(parseInt(clinicalData.age)) || parseInt(clinicalData.age) <= 0) {
      setModalState({ isOpen: true, title: 'Validation Error', message: 'Please enter a valid age.', isError: true });
      return;
    }

    if (!selectedSamplePatient) {
      const allFilesPresent = MRI_MODALITIES.every(mod => files[mod.toLowerCase() as MriModalityKey] !== null && !files[mod.toLowerCase() as MriModalityKey]?.name.endsWith('(Sample)'));
      if (!allFilesPresent) {
        setModalState({ isOpen: true, title: 'Validation Error', message: `Please upload all ${MRI_MODALITIES.length} MRI modalities for a new patient.`, isError: true });
        return;
      }
    }

    setIsProcessing(true);
    setUploadProgress(selectedSamplePatient ? 40 : 10);

    let payloadBody: FormData | string;
    const requestHeaders: HeadersInit = {};

    const clinicalDataForUpload = {
        ...clinicalData,
        age: parseInt(clinicalData.age), // Ensure age is number for backend
    };

    if (selectedSamplePatient) {
      const samplePayload = {
        isSample: true,
        patientId: clinicalData.patientId, // Send the current patientId (could be sample's or overridden)
        clinicalData: clinicalDataForUpload, // Clinical data from the form
        s3Keys: selectedSamplePatient.s3Keys, // Original S3 keys from the sample definition
      };
      payloadBody = JSON.stringify(samplePayload);
      requestHeaders['Content-Type'] = 'application/json';
      setUploadProgress(50); // Indicate skipping S3 upload
    } else {
      const formData = new FormData();
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });
      formData.append('clinicalData', JSON.stringify(clinicalDataForUpload));
      formData.append('patientId', clinicalData.patientId);
      payloadBody = formData;
      setUploadProgress(30); // Files prepared
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/patients`, {
        method: 'POST',
        body: payloadBody,
        headers: requestHeaders,
      });

      setUploadProgress(selectedSamplePatient ? 80 : 70); // Post-API call

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
        throw new Error(errorData.message || `Failed to ${selectedSamplePatient ? 'process sample' : 'upload'}: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadProgress(100);
      setIsProcessing(false);
      setModalState({
        isOpen: true,
        title: selectedSamplePatient ? 'Sample Processed' : 'Upload Successful',
        message: `Patient ${result.patient_id} data ${selectedSamplePatient ? 'processed' : 'uploaded'}. Redirecting...`,
        isError: false,
      });

      setTimeout(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        clearForm(true);
        // setIsProcessing(false); // already set
        // setUploadProgress(0); // clearForm handles this
        router.push(`/patient/${result.patient_id}`);
      }, 2500);

    } catch (error: any) {
      setIsProcessing(false);
      setUploadProgress(0);
      setModalState({ isOpen: true, title: selectedSamplePatient ? 'Processing Failed' : 'Upload Failed', message: error.message || 'An unexpected error occurred.', isError: true });
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {selectedSamplePatient ? `Review Sample: ${selectedSamplePatient.displayName}` : 'Upload New Patient MRI Data'}
        </h2>
        <Button
            variant="secondary"
            onClick={() => {
                if (selectedSamplePatient) {
                    clearForm(true);
                } else {
                    setIsSamplePatientModalOpen(true);
                }
            }}
            disabled={isProcessing}
            icon={selectedSamplePatient ? Replace : Users}
        >
            {selectedSamplePatient ? 'Clear Sample & Upload New' : 'Load Sample Patient'}
        </Button>
      </div>

      {selectedSamplePatient && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 flex items-center space-x-2">
            <IconWrapper icon={Info} className="w-5 h-5 flex-shrink-0"/>
            <p className="text-sm">
                You are reviewing data for <strong>{selectedSamplePatient.displayName}</strong>.
                MRI files are pre-selected from S3. Clinical data is pre-filled but can be adjusted if needed before processing. Click '{isProcessing ? 'Processing...' : 'Process Sample Patient'}' to generate embeddings.
            </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">MRI File Uploads (NIfTI format: .nii or .nii.gz) *
            {selectedSamplePatient && <span className="text-sm text-green-600 ml-2">(Files pre-selected from sample)</span>}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MRI_MODALITIES.map(modality => (
              <div key={modality} className={`border border-gray-300 rounded-lg p-3 hover:shadow-sm transition-shadow ${selectedSamplePatient ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
                <label htmlFor={modality.toLowerCase()} className="block text-sm font-medium text-gray-700 mb-1">{modality.toUpperCase()}:</label>
                <input
                  type="file"
                  id={modality.toLowerCase()}
                  name={modality.toLowerCase()}
                  accept=".nii,.nii.gz"
                  onChange={(e) => handleFileChange(modality, e)}
                  ref={el => { fileInputRefs.current[modality.toLowerCase()] = el; }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isProcessing || !!selectedSamplePatient}
                />
                {(files[modality.toLowerCase() as MriModalityKey]) && (
                  <p className="text-xs text-green-600 mt-1 truncate" title={files[modality.toLowerCase() as MriModalityKey]?.name}>
                    <FileCheck2 className="inline w-4 h-4 mr-1" />
                    {files[modality.toLowerCase() as MriModalityKey]?.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Clinical Information *
          {selectedSamplePatient && <span className="text-sm text-blue-600 ml-2">(Pre-filled, Patient ID can be changed)</span>}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient ID *</label>
              <input type="text" name="patientId" id="patientId" value={clinicalData.patientId} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              disabled={isProcessing} // Allow Patient ID to be changed even for samples
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age *</label>
              <input type="number" name="age" id="age" value={clinicalData.age} onChange={handleInputChange} required min="1" max="120" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              disabled={isProcessing || (!!selectedSamplePatient && clinicalData.age === selectedSamplePatient.age)} // Example: Lock if sample age is set
              />
            </div>
            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex *</label>
              <select name="sex" id="sex" value={clinicalData.sex} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              disabled={isProcessing || (!!selectedSamplePatient && clinicalData.sex === selectedSamplePatient.sex)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis *</label>
              <input type="text" name="diagnosis" id="diagnosis" value={clinicalData.diagnosis} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              disabled={isProcessing || (!!selectedSamplePatient && clinicalData.diagnosis === selectedSamplePatient.diagnosis)}
              />
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-4">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
            <p className="text-xs text-center text-blue-700 mt-1">
              { selectedSamplePatient ?
                (uploadProgress < 80 ? 'Processing sample data with ML service...' : 'Finalizing...') :
                (uploadProgress < 30 ? 'Preparing files...' : uploadProgress < 70 ? 'Uploading to server...' : uploadProgress < 100 ? 'Server processing...' : 'Finalizing...')
              }
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { clearForm(true); }} disabled={isProcessing}>
              {selectedSamplePatient ? 'Cancel & Clear Sample' : 'Clear Form'}
            </Button>
            <Button type="submit" variant="primary" disabled={isProcessing} icon={isProcessing ? Loader2 : (selectedSamplePatient ? FileCheck2 : UploadCloud) } iconClassName={isProcessing ? "animate-spin" : ""}>
              {isProcessing ? (selectedSamplePatient ? 'Processing...' : (uploadProgress < 70 ? 'Uploading...' : 'Processing...')) : (selectedSamplePatient ? 'Process Sample Patient' : 'Upload & Process')}
            </Button>
        </div>
      </form>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
      >
        <div className="flex items-start space-x-3">
            {modalState.isError && <IconWrapper icon={AlertIcon} className="w-10 h-10 text-red-500 flex-shrink-0"/>}
            {!modalState.isError && !isProcessing && <IconWrapper icon={selectedSamplePatient ? FileCheck2 : UploadCloud} className="w-10 h-10 text-green-500 flex-shrink-0"/>}
            <p className={`mt-1 ${modalState.isError ? 'text-red-700' : 'text-gray-700'}`}>{modalState.message}</p>
        </div>
        <div className="mt-6 flex justify-end">
            <Button onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))} variant={modalState.isError ? "danger" : "primary"}>Close</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isSamplePatientModalOpen}
        onClose={() => setIsSamplePatientModalOpen(false)}
        title="Load Sample Patient Data"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {SAMPLE_PATIENTS.length > 0 ? (
            SAMPLE_PATIENTS.map(sample => (
              <Button
                key={sample.patientId}
                variant="secondary"
                className="w-full justify-start text-left py-3"
                onClick={() => loadSamplePatient(sample)}
              >
                <div className="flex flex-col">
                    <span className="font-medium">{sample.displayName || sample.patientId}</span>
                    <span className="text-sm text-gray-500">{sample.diagnosis} - Age: {sample.age}</span>
                </div>
              </Button>
            ))
          ) : (
            <p className="text-gray-600">No sample patients configured.</p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsSamplePatientModalOpen(false)} variant="secondary">Cancel</Button>
        </div>
      </Modal>
    </Card>
  );
};

export default UploadForm;

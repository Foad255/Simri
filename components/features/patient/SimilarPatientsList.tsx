'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconWrapper from '@/components/ui/IconWrapper';
import { Patient } from '@/lib/types';
import { AlertTriangle, ChevronsLeftRight } from 'lucide-react';
import Link from 'next/link';

interface SimilarPatientsListProps {
  currentPatientId: string;
  similarPatients: Patient['similar_patients'];
}

const SimilarPatientsList: React.FC<SimilarPatientsListProps> = ({ currentPatientId, similarPatients }) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Similar Patients</h3>
      {!similarPatients || similarPatients.length === 0 ? (
        <div className="text-center py-4">
          <IconWrapper icon={AlertTriangle} className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No similar patients found for comparison.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {similarPatients.map(simPatient => (
            <li
              key={simPatient.patient_id}
              className="flex justify-between items-center p-3 bg-green-300 hover:bg-gray-100 transition-colors"
            >
              <div>
                <Link
                  href={`/patient/${simPatient.patient_id}`}
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors block"
                >
                  {simPatient.patient_id}
                </Link>
                <p
                  className="inline-block font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full min-w-[3.5rem] text-center mt-1"
                  title="Similarity Score"
                >
                  {simPatient.score}
                </p>
              </div>
              <Link href={`/compare/${currentPatientId}/${simPatient.patient_id}`}>
                <Button  variant="ghost" icon={ChevronsLeftRight} className="text-sm px-2.5 py-1">
                  Compare
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default SimilarPatientsList;

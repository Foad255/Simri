// simri-app/app/(main)/upload/page.tsx
import UploadForm from '@/components/features/upload/UploadForm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Upload MRI Data | Simri Platform',
};

export default function UploadPage() {

  if ( 1 === 1 ) {
    redirect('/')
  }
  return (
    // The RootLayoutComponent already provides a container and padding.
    <UploadForm />
  );
}

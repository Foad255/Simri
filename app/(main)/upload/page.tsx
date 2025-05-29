// simri-app/app/(main)/upload/page.tsx
import UploadForm from '@/components/features/upload/UploadForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload MRI Data | Simri Platform',
};

export default function UploadPage() {
  return (
    // The RootLayoutComponent already provides a container and padding.
    <UploadForm />
  );
}

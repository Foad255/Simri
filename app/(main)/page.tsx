// app/page.tsx
import HomePageClient, { Feature } from './HomePageClient';


async function fetchFeatures():  Promise<Feature[]> {

  return [
    { iconName: 'Dna', title: "Multi-Sequence MRI Support", description: "Handles common sequences: T1c, T1n, T2f, T2w, and segmentation masks." },
    { iconName: 'Brain', title: "TIEP Deep Learning Model", description: "Custom-trained to generate meaningful scan embeddings for comparison." },
    { iconName: 'Search', title: "MongoDB Vector Search", description: "Fast search at scale — thousands of cases matched in milliseconds." },
    { iconName: 'Zap', title: "3D MRI Viewer", description: "Explore results side-by-side using Niivue in-browser visualization." },
    { iconName: 'Database', title: "Scalable Infrastructure", description: "Built on AWS S3, Flask, MongoDB Atlas, and Next.js for reliability." },
    { iconName: 'Users', title: "Cohort Discovery", description: "Easily surface groups of patients with similar imaging patterns." },
  ];
}

export default async function HomePage() {
  const features = await fetchFeatures();

  return <HomePageClient features={features} />;
}

// app/page.tsx
import HomePageClient, { Feature } from './HomePageClient';


async function fetchFeatures(): Promise<Feature[]> {
  return [
    { iconName: 'Dna', title: "Multi-Sequence MRI Analysis", description: "Seamlessly processes T1c, T1n, T2f, T2w, and crucial segmentation masks." },
    { iconName: 'Brain', title: "Advanced Deep Learning", description: "Our TIEP model creates unique 'brain fingerprints' for precise comparison." },
    { iconName: 'Search', title: "Instant Similarity Search", description: "Quickly find relevant cases from a vast dataset using blazing-fast vector search." },
    { iconName: 'Users', title: "Effortless Cohort Discovery", description: "Identify groups of patients with similar imaging characteristics in moments." },
    // Removed "Scalable Infrastructure" feature, as it's more technical and less user-facing for the "experience" angle.
    // If you want a 6th, consider:
    // { iconName: 'Lightbulb', title: "Unlock New Insights", description: "Discover hidden patterns and accelerate your research with data-driven comparisons." },
  ];
}

export default async function HomePage() {
  const features = await fetchFeatures();

  return <HomePageClient features={features} />;
}

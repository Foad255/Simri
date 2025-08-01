// app/HomePageClient.tsx
'use client';

import {
  ArrowRight,
  BarChart3,
  Brain,
  Database, // Keep if still using for other sections or want to add a new feature
  Dna,
  FileUp,
  Lightbulb,
  Search,
  UploadCloud,
  Users
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

// SECTION TITLE
const SectionTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-4xl md:text-5xl font-bold text-slate-900 mb-10 md:mb-16 text-center relative group ${className}`}>
    {children}
    <span className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 h-1.5 w-28 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 transition-all duration-500 group-hover:w-36 rounded-full"></span>
  </h2>
);

// FEATURE CARD
const FeatureCard = ({ title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="bg-white p-7 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200/70 group hover:border-teal-400">
    {/* <div className="bg-gradient-to-br from-sky-600 via-teal-600 to-emerald-500 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-7 shadow-md group-hover:shadow-lg transition-shadow duration-300 group-hover:shadow-teal-500/40">
      <Icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
    </div> */}
    <h3 className="text-xl font-semibold mb-3 text-slate-800">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

// WORKFLOW STEP
const WorkflowStep = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) => (
  <div className="flex items-start space-x-5 p-6 bg-slate-100/70 rounded-xl border border-slate-200/60 hover:border-teal-400/70 hover:bg-white hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-sky-600 via-teal-500 to-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-2 ring-sky-300/70 group-hover:ring-teal-500 transition-all duration-300 group-hover:shadow-teal-500/50 animate-subtle-glow-hover">
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center mb-2">
        {/* <Icon className="w-7 h-7 text-sky-600 mr-3 group-hover:text-teal-600" /> */}
        <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
      </div>
      <p className="text-slate-600 mt-1 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

// Map icon names to lucide-react components
const iconMap = {
  Dna,
  Brain,
  Search,
  Database,
  Users,
  Lightbulb, // Added Lightbulb to map
};

export type Feature = {
  iconName: 'Dna' | 'Brain' | 'Search' | 'Database' | 'Users' | 'Lightbulb'; // Updated type
  title: string;
  description: string;
};

type Props = {
  features: Feature[];
};

export default function HomePageClient({ features }: Props) {
  return (
    <>
      <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-blue-700 via-sky-700 to-teal-600 py-32 md:py-44 text-white border-b border-teal-800 overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            <Brain className="w-24 h-24 md:w-32 md:h-32 text-sky-300/90 mx-auto mb-10 animate-pulse-gentle" />

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-7">
              Discover Insights in <br />
              <span className="animated-shimmer-text py-1">Brain MRI Data</span>
            </h1>
            <p className="text-lg md:text-xl text-sky-100/90 max-w-3xl mx-auto mb-14">
              Explore a vast dataset of brain MRIs, find similar cases instantly, and compare them side-by-side with intuitive 3D visualization.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-5 sm:space-y-0 sm:space-x-6">
              <Link
                href="/explore" // Changed to /explore to emphasize Browse existing data
                className="bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-500 text-white px-10 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-300 transform hover:scale-105 flex items-center group w-full sm:w-auto justify-center animated-gradient-bg-hover"
              >
                Explore Patient Data <ArrowRight className="w-5 h-5 ml-3" /> {/* Changed icon to ArrowRight for exploration */}
              </Link>
              <Link
                href="/upload" // Added a clear path for uploading
                className="bg-transparent text-white border-2 border-sky-400/70 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-teal-600 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto group flex items-center"
              >
                Upload Your MRI <FileUp className="w-5 h-5 ml-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* CHALLENGE + SOLUTION */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 md:mb-24">
              <h2 className="text-4xl font-bold text-slate-800 mb-5">Unlocking the Power of Imaging Data</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Simri transforms how you interact with vast collections of medical imaging, making discovery intuitive and data-driven.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-10 md:gap-14">
              <div className="bg-slate-50/80 p-8 rounded-xl shadow-xl border border-slate-200/70 hover:shadow-2xl">
                <h3 className="text-2xl font-semibold text-slate-800 mb-5">The Traditional Challenge</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  Manually sifting through thousands of complex MRI scans to find specific cases is time-consuming, prone to human bias, and bottlenecks clinical research and patient care.
                </p>
              </div>
              <div className="bg-gradient-to-br from-sky-600 via-teal-600 to-emerald-600 text-white p-8 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-semibold mb-5">The Simri Advantage</h3>
                <p className="text-sky-50 leading-relaxed text-base">
                  Simri empowers you to swiftly explore existing patient cohorts or upload your own MRI to find radiologically similar cases. Our AI transforms raw scans into searchable &quot;brain fingerprints,&quot; instantly revealing patterns and connections you&apos;d otherwise miss.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 md:py-32 bg-slate-50 border-t border-b border-slate-200/80">
          <div className="container mx-auto px-6">
            <SectionTitle>How Simri Works</SectionTitle>
            <p className="text-center text-slate-600 max-w-3xl mx-auto mb-20 text-lg">From raw MRIs to insightful patient comparisons in four seamless steps.</p>
            <div className="max-w-3xl mx-auto relative">
              <div className="absolute left-[31px] md:left-[35px] top-16 bottom-16 w-1.5 bg-gradient-to-b from-sky-400/40 via-teal-500 to-emerald-400/40 hidden md:block rounded-full opacity-80 animate-pulse-gentle" />
              <div className="space-y-12 md:space-y-14 relative z-10">
                <WorkflowStep
                  number="1"
                  title="Visualize Existing Patients" // New Step 1: Browse existing data
                  description="Begin by exploring a rich dataset of anonymized brain MRI cases already in Simri."
                  icon={Users} // Using Users icon
                />
                <WorkflowStep
                  number="2"
                  title="Or Upload Your Scan" // Former Step 1, now Step 2
                  description="Securely upload your multi-sequence brain MRI (T1c, T1n, T2f, T2w, and segmentation masks)."
                  icon={UploadCloud}
                />
                <WorkflowStep
                  number="3"
                  title="AI-Powered Matching" // Combines embedding & search conceptually
                  description="Our deep learning model generates a unique 'brain fingerprint' for your scan, which is then used to find the most similar cases across our database."
                  icon={Search} // Using Search icon
                />
                <WorkflowStep
                  number="4"
                  title="Compare & Analyze in 3D" // Former Step 4
                  description="Instantly view your scan alongside matched similar cases in our interactive 3D viewer for detailed comparison."
                  icon={BarChart3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6">
            <SectionTitle>How Simri Empowers You</SectionTitle> {/* Rephrased title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
              {features.map(({ iconName, title, description }) => {
                const Icon = iconMap[iconName];
                return <FeatureCard key={title} icon={Icon} title={title} description={description} />;
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-28 md:py-36 bg-gradient-to-br from-blue-700 via-sky-700 to-teal-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <Lightbulb className="w-20 h-20 md:w-24 md:h-24 text-sky-300/90 mx-auto mb-10 opacity-90 animate-pulse-gentle" />
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Unlock Patient Insights?</h2>
            <p className="text-lg md:text-xl text-sky-100/90 max-w-3xl mx-auto mb-14 leading-relaxed">
              Experience the future of medical image analysis. Explore a curated dataset or upload your own MRI to see Simri&apos;s power firsthand.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-5 sm:space-y-0 sm:space-x-6">
              <Link
                href="/upload"
                className="bg-white text-sky-700 px-10 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group flex items-center justify-center max-w-md mx-auto animated-gradient-bg-hover hover:from-sky-400 hover:via-teal-400 hover:to-emerald-500 hover:text-white"
              >
                Upload Your Own MRI <FileUp className="w-5 h-5 ml-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// simri-app/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // Tailwind base styles

export const metadata: Metadata = {
  title: "Simri Platform",
  description: "AI-Powered MRI Similarity & Patient Comparison",
  // Add more metadata like icons, open graph, etc.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"> {/* Apply antialiasing globally */}
        {children}
      </body>
    </html>
  );
}

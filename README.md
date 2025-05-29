simri-app/
├── app/
│   ├── (main)/
│   │   ├── layout.tsx                      # Main layout for app pages (Header, Footer)
│   │   ├── page.tsx                        # Home page
│   │   ├── patient/[patientId]/
│   │   │   └── page.tsx                    # Patient Detail page
│   │   ├── compare/[refId]/[targetId]/
│   │   │   └── page.tsx                    # Compare Page
│   │   ├── upload/
│   │   │   └── page.tsx                    # Upload page
│   │   └── explore/
│   │       └── page.tsx                    # Explore page
│   ├── api/                                # Backend API routes (to be implemented)
│   │   └── patients/
│   │       ├── route.ts                    # Example: GET all, POST new
│   │       └── [patientId]/
│   │           └── route.ts                # Example: GET by ID
│   ├── globals.css                         # Global styles (Tailwind imports)
│   └── layout.tsx                          # Root HTML layout
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── IconWrapper.tsx
│   │   └── ModalityTabs.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── RootLayoutComponent.tsx         # Client component managing main layout structure
│   ├── features/
│   │   ├── patient/
│   │   │   ├── PatientCard.tsx
│   │   │   ├── ClinicalInfo.tsx
│   │   │   ├── MRIViewer.tsx
│   │   │   ├── SimilarPatientsList.tsx
│   │   │   └── SimilarityExplanation.tsx
│   │   └── upload/
│   │       └── UploadForm.tsx
├── lib/
│   ├── constants.ts
│   ├── types.ts
│   └── api.ts                             # Placeholder API functions
├── public/                                # Static assets
├── tailwind.config.js
├── next.config.mjs                        # Or .js
├── tsconfig.json
└── package.json

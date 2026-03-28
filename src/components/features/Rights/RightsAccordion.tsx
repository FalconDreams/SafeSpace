import React, { useState } from 'react';

interface RightSection {
  id: string;
  title: string;
  content: string[];
  laws?: string[];
}

const rightsData: RightSection[] = [
  {
    id: 'habitability',
    title: 'Right to Habitable Living Conditions',
    content: [
      'Your rental must meet basic health and safety standards',
      'Landlords must maintain: heating, plumbing, electrical, structural integrity',
      'You cannot waive these rights in your lease agreement',
      'If conditions are unlivable, you may have the right to break your lease without penalty',
    ],
    laws: ['Colorado Revised Statutes § 38-12-503', 'Boulder Revised Code 10-2'],
  },
  {
    id: 'repairs',
    title: 'Right to Timely Repairs',
    content: [
      '24-hour emergencies: No heat (below 40°F), no water, gas leaks, sewage backup',
      '72-hour issues: Mold over 10 sq ft, no hot water',
      '7-day repairs: Other habitability issues',
      '30-day repairs: Non-urgent maintenance',
      'You must notify your landlord in writing about repair needs',
    ],
    laws: ['C.R.S. § 38-12-505', 'Boulder Housing Code'],
  },
  {
    id: 'mold',
    title: 'Mold Disclosure and Remediation Rights',
    content: [
      'Landlords must disclose known mold issues before you sign a lease',
      'Mold over 10 square feet requires professional remediation',
      'You can request mold testing at landlord\'s expense if health issues arise',
      'Landlords cannot retaliate against you for reporting mold',
      'Document all mold with photos and keep health records',
    ],
    laws: ['C.R.S. § 38-12-1001 to 1004', '2024 Boulder Mold Ordinance'],
  },
  {
    id: 'retaliation',
    title: 'Protection from Retaliation',
    content: [
      'Landlords cannot retaliate for: reporting code violations, joining tenant unions, exercising legal rights',
      'Retaliation includes: eviction, rent increases, reducing services, harassment',
      'Actions within 6 months of your complaint are presumed retaliatory',
      'You can sue for damages if retaliation occurs',
      'Keep documentation of all interactions with your landlord',
    ],
    laws: ['C.R.S. § 38-12-509'],
  },
  {
    id: 'privacy',
    title: 'Right to Privacy and Quiet Enjoyment',
    content: [
      'Landlords must give 24-hour notice before entering (except emergencies)',
      'Entry must be at reasonable times for legitimate purposes',
      'You can refuse entry if proper notice wasn\'t given',
      'Landlords cannot harass you with excessive entry requests',
      'Install security cameras inside your unit if lease allows',
    ],
    laws: ['C.R.S. § 38-12-1001', 'Common Law Right to Quiet Enjoyment'],
  },
  {
    id: 'deposit',
    title: 'Security Deposit Rights',
    content: [
      'Deposits cannot exceed 2 months\' rent',
      'Landlords must return deposits within 30 days (or 60 with lease provision)',
      'Itemized list of deductions must be provided',
      'Normal wear and tear cannot be deducted',
      'You can sue for 3x the wrongfully withheld amount',
      'Take photos/video when moving in and out',
    ],
    laws: ['C.R.S. § 38-12-103'],
  },
];

export const RightsAccordion: React.FC = () => {
  const [openSections, setOpenSections] = useState<string[]>(['habitability']);

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(sectionId => sectionId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-2">
      {rightsData.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface-muted transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
            <svg
              className={`h-5 w-5 text-gray-500 transform transition-transform ${
                openSections.includes(section.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {openSections.includes(section.id) && (
            <div className="px-6 pb-4">
              <ul className="space-y-2">
                {section.content.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span className="text-text">{item}</span>
                  </li>
                ))}
              </ul>
              
              {section.laws && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                  <p className="text-sm font-medium text-text">Relevant Laws:</p>
                  <p className="text-sm text-text-muted">{section.laws.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
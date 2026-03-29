import React, { useState } from 'react';
import type { CityRight } from '../../../data/cityRegistry';

interface Props {
  rights: CityRight[];
}

export const CityRightsAccordion: React.FC<Props> = ({ rights }) => {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-2">
      {rights.map((section, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection(index)}
            className="w-full px-4 py-3 sm:px-6 sm:py-4 text-left flex items-center justify-between hover:bg-surface-muted transition-colors"
          >
            <h3 className="text-base font-medium text-gray-900 sm:text-lg pr-2">{section.title}</h3>
            <svg
              className={`h-5 w-5 text-gray-500 transform transition-transform ${
                openSections.includes(index) ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openSections.includes(index) && (
            <div className="px-4 pb-4 sm:px-6">
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-sage-600 mr-2">•</span>
                    <span className="text-text">{item}</span>
                  </li>
                ))}
              </ul>

              {section.laws.length > 0 && (
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

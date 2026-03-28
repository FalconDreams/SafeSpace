import React from 'react';
import { Card } from '../../common';

interface SuccessStory {
  title: string;
  issue: string;
  outcome: string;
  timeframe: string;
  tip: string;
}

const stories: SuccessStory[] = [
  {
    title: 'Mold Remediation Victory',
    issue: 'Extensive black mold in bathroom ceiling spreading to bedroom',
    outcome: 'Landlord hired professional remediation within 72 hours after tenant provided photos and cited Boulder mold ordinance',
    timeframe: '5 days total',
    tip: 'Document everything with photos and reference specific laws in your notice',
  },
  {
    title: 'Heat Restored in 24 Hours',
    issue: 'Furnace failure during January cold snap with temps below 20°F',
    outcome: 'Emergency repair completed within 18 hours after tenant called and emailed citing 24-hour requirement',
    timeframe: '18 hours',
    tip: 'Always follow up phone calls with written notice for legal documentation',
  },
  {
    title: 'Full Deposit Return',
    issue: 'Landlord tried to charge for normal wear including minor scuffs and faded paint',
    outcome: 'Tenant received full deposit after sending move-in photos and threatening small claims court',
    timeframe: '2 weeks',
    tip: 'Take detailed photos/video when moving in and save them with timestamps',
  },
  {
    title: 'Stopped Retaliatory Eviction',
    issue: 'Eviction notice received 2 weeks after reporting major plumbing issues to health department',
    outcome: 'Eviction withdrawn after tenant\'s lawyer cited retaliation laws and timeline of events',
    timeframe: '1 week',
    tip: 'Keep a detailed timeline of all complaints and landlord actions',
  },
];

export const SuccessStories: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Success Stories</h2>
      <p className="text-text-muted">
        Real examples of Boulder renters successfully asserting their rights
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {stories.map((story, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-text">Issue:</p>
                  <p className="text-text-muted">{story.issue}</p>
                </div>
                
                <div>
                  <p className="font-medium text-text">Outcome:</p>
                  <p className="text-text-muted">{story.outcome}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-600 font-medium">Resolved in {story.timeframe}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-teal-700">Key Tip:</p>
                <p className="text-sm text-text-muted">{story.tip}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
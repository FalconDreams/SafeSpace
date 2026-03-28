import { Card } from '../../common';
import type { Report, Comment as DbComment, Rebuttal } from '../../../types/database';

interface PropertyDetailsProps {
  address: string;
  reports: Report[];
  comments: DbComment[];
  rebuttals: Rebuttal[];
}

export function PropertyDetails({ address, reports, comments, rebuttals }: PropertyDetailsProps) {
  const issueLabels: Record<string, string> = {
    mold: 'Mold',
    radon: 'Radon',
    'carbon-monoxide': 'Carbon Monoxide',
    heating: 'Heating',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    structural: 'Structural',
    pests: 'Pests',
    other: 'Other',
  };

  const severityConfig: Record<string, { label: string; className: string }> = {
    emergency_24h: { label: '24hr Emergency', className: 'bg-red-100 text-red-700' },
    urgent_72h: { label: '72hr Urgent', className: 'bg-amber-100 text-amber-700' },
    standard: { label: 'Standard', className: 'bg-blue-100 text-blue-700' },
  };

  const getRebuttalForReport = (reportId: string) =>
    rebuttals.find((r) => r.report_id === reportId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">{address}</h2>
        <div className="mt-2 flex gap-4 text-sm text-text-muted">
          <span>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
          <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-text-muted">No reports filed for this property yet.</p>
          <p className="mt-1 text-sm text-text-muted">Be the first to report an issue.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text">Reports Timeline</h3>
          {reports.map((report) => {
            const rebuttal = getRebuttalForReport(report.id);
            const severity = severityConfig[report.severity] || severityConfig.standard;

            return (
              <Card key={report.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">
                        {issueLabels[report.issue_type] || report.issue_type}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severity.className}`}>
                        {severity.label}
                      </span>
                    </div>
                    <time className="text-sm text-text-muted">
                      {new Date(report.created_at).toLocaleDateString()}
                    </time>
                  </div>

                  <p className="text-text-muted">{report.description}</p>

                  {report.photo_urls && report.photo_urls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {report.photo_urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Evidence ${i + 1}`}
                          className="h-20 w-20 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}

                  {report.is_anonymous && (
                    <p className="text-xs text-text-muted italic">Reported anonymously</p>
                  )}

                  {rebuttal && (
                    <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                          Landlord Response
                        </span>
                        {rebuttal.is_verified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Verified Owner
                          </span>
                        )}
                        <time className="ml-auto text-xs text-text-muted">
                          {new Date(rebuttal.created_at).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-sm text-teal-900">{rebuttal.body}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

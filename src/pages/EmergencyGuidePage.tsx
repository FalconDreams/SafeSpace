import { DecisionTree } from '../components/features/EmergencyGuide/DecisionTree';
import { EmergencyContacts } from '../components/features/EmergencyGuide/EmergencyContacts';

export function EmergencyGuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Emergency Health Guide</h1>
        <p className="mt-2 text-lg text-text-muted">
          Answer a few questions to determine if your issue requires emergency response under Boulder law
        </p>
      </div>

      <div className="rounded-md border border-red-200 bg-danger-bg p-4">
        <p className="text-sm font-medium text-danger">
          If you are in immediate danger, call 911 immediately
        </p>
      </div>

      <DecisionTree />

      <div className="mt-12 border-t border-border pt-8">
        <EmergencyContacts />
      </div>
    </div>
  );
}

export type IssueType =
  | 'mold'
  | 'radon'
  | 'carbon-monoxide'
  | 'heating'
  | 'electrical'
  | 'plumbing'
  | 'structural'
  | 'pests'
  | 'other';

export type Severity = 'emergency_24h' | 'urgent_72h' | 'standard';

export type ReportStatus = 'pending' | 'responded' | 'resolved' | 'overdue';

export interface TrackedIssue {
  id: string;
  propertyAddress: string;
  issueType: string;
  dateReported: string;
  deadline: string;
  status: 'pending' | 'responded' | 'resolved' | 'overdue';
  landlordResponse?: string;
  notes: string;
}

export interface DecisionNode {
  id: string;
  question: string;
  description?: string;
  options?: DecisionOption[];
  result?: DecisionResult;
}

export interface DecisionOption {
  label: string;
  nextId: string | null;
  urgency?: '24hr' | '72hr' | 'standard';
}

export interface DecisionResult {
  urgency: '24hr' | '72hr' | 'standard';
  title: string;
  description: string;
  steps: string[];
  legalNotice?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
  hours?: string;
  emergency?: boolean;
}

export interface ExpansionCity {
  city: string;
  state: string;
  population: number;
  rent_control: boolean;
  just_cause_eviction: boolean;
  key_laws: string[];
  security_deposit_limit: string;
  repair_standards: string;
  resources: { name: string; url: string; phone?: string }[];
  notes: string;
}

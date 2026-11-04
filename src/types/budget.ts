export interface BudgetProject {
  id: string;
  orderNumber: string;
  projectType: 'โครงการประจำ' | 'งานตามยุทธฯ มหาวิทยาลัย';
  department: string;
  fund: string;
  projectGroup: string;
  projectCode: string;
  projectName: string;
  subProjectName: string;
  initialBudget: number;
  transferredOut: number;
  transferredIn: number;
  remainingBudget: number; // initialBudget - transferredOut + transferredIn
  disbursements: DisbursementRound[];
  totalRequested: number;
  remainingRequested: number;
  totalActualSpent: number;
  remainingActual: number;
  transferCount: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'planned' | 'in_progress' | 'completed' | 'summarized';
  notes?: string;
  responsibleOfficer?: string;
}

export interface DisbursementRound {
  round: number;
  operationDate?: string;
  requestAmount: number;
  actualAmount: number;
  summaryDocRef?: string;
  summaryDate?: string;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  month?: string; // e.g. "ต.ค. 69"
  responsiblePerson?: string;
  location?: string;
  notes?: string;
  attachedDocs?: AttachedDocument[];
}

export interface AttachedDocument {
  id: string;
  name: string;
  url?: string;
  fileSize?: string;
  uploadedAt: string;
  type: 'approval_memo' | 'expense_receipt' | 'project_summary' | 'revenue_report' | 'completion_report' | 'other';
  uploadedBy: string;
}

export interface ProjectSummaryRecord {
  id: string;
  projectId: string;
  projectCode?: string;
  projectTitle: string;
  department: string;
  responsiblePerson: string;
  responsibleEmail: string;
  objectives: string;
  targetGroup: string;
  attendeeCount: number;
  startDate: string;
  endDate: string;
  location: string;
  results: string;
  allocatedBudget: number;
  actualSpent: number;
  remainingReturned: number;
  problemsAndObstacles: string;
  recommendations: string;
  approvedDocs: AttachedDocument[];
  completionDocs: AttachedDocument[];
  status: 'draft' | 'submitted' | 'approved';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTransferRecord {
  id: string;
  sourceProjectId: string;
  sourceProjectName: string;
  targetProjectId: string;
  targetProjectName: string;
  amount: number;
  reason: string;
  approvedBy: string;
  transferDate: string;
  sourceRemainingBefore: number;
  sourceRemainingAfter: number;
}

export type UserRole = 'admin' | 'finance_officer' | 'department_head' | 'project_staff' | 'executive';

export const FACULTY_DEPARTMENTS = [
  'งานอำนวยการ',
  'งานการเงิน',
  'งานยุทธศาสตร์และบุคคล',
  'งานบริการการศึกษา',
  'งานกิจการนิสิตและศิษย์เก่าสัมพันธ์',
  'งานวิจัยและบริการวิชาการ',
  'งานพัสดุ',
  'จิตวิทยา',
  'ประวัติศาสตร์',
  'สังคมวิทยาฯ',
  'รัฐศาสตร์ฯ',
  'สถานฯ',
] as const;

export type FacultyDepartment = typeof FACULTY_DEPARTMENTS[number] | string;

export interface AppMember {
  id: string;
  username?: string;
  email: string;
  password?: string;
  displayName: string;
  department: FacultyDepartment;
  role: UserRole;
  avatarUrl?: string;
  canRecordExpense: boolean;
  canApprove: boolean;
  canTransfer: boolean;
  canAttachDocs: boolean;
  canManageUsers: boolean;
  canConfigureSystem: boolean;
  createdAt: string;
}

export interface SystemConfig {
  maxTransfersAllowed: number;
  enforceTransferLimit: boolean;
  fiscalYear: string;
  facultyName: string;
  googleSheetsUrl: string;
  googleSheetsConnected: boolean;
  lastSyncedAt: string;
  autoSyncIntervalMinutes: number;
}

export type TimePeriodFilter = 
  | 'ALL'
  | 'Q1' // ต.ค. 69 - ธ.ค. 69
  | 'Q2' // ม.ค. 70 - มี.ค. 70
  | 'Q3' // เม.ย. 70 - มิ.ย. 70
  | 'Q4' // ก.ค. 70 - ก.ย. 70
  | '10/69'
  | '11/69'
  | '12/69'
  | '01/70'
  | '02/70'
  | '03/70'
  | '04/70'
  | '05/70'
  | '06/70'
  | '07/70'
  | '08/70'
  | '09/70';

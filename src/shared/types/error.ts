export type ErrorSeverity = 'info' | 'warning' | 'error';
export type ErrorStatus = 'open' | 'fixed' | 'snoozed' | 'ignored';

export interface BugsnagError {
  id: string;
  errorClass: string;
  message: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  unhandled: boolean;
  firstSeen: string;
  lastSeen: string;
  eventsCount: number;
  usersAffected: number;
  projectId: string;
  projectName: string;
  url: string;
  accountId: string;
  releaseStages: string[];
  assignedCollaboratorId?: string;
  commentCount: number;
}

export interface BugsnagEvent {
  id: string;
  errorId: string;
  projectId: string;
  receivedAt: string;
  severity: ErrorSeverity;
  unhandled: boolean;
  context: string;
  errorClass: string;
  message: string;
  url: string;
}

export interface NotificationConfig {
  enabled: boolean;
  newError: boolean;
}

export interface WatchedProject {
  id: string;
  name: string;
  orgId: string;
}

export interface AppConfig {
  refreshInterval: number;
  launchAtStartup: boolean;
  notifications: NotificationConfig;
  watchedProjectIds: string[];
  watchedProjectsData: WatchedProject[];
  theme: 'system' | 'light' | 'dark';
  errorMaxAge: number;
  showOnlyUnhandled: boolean;
  dismissedErrors: string[];
  errorStatusFilter: ('open' | 'fixed' | 'snoozed' | 'ignored')[];
  errorSeverityFilter: ('info' | 'warning' | 'error')[];
}

export const DEFAULT_CONFIG: AppConfig = {
  refreshInterval: 60000,
  launchAtStartup: false,
  notifications: {
    enabled: true,
    newError: true,
  },
  watchedProjectIds: [],
  watchedProjectsData: [],
  theme: 'system',
  errorMaxAge: 24,
  showOnlyUnhandled: false,
  dismissedErrors: [],
  errorStatusFilter: ['open'],
  errorSeverityFilter: ['info', 'warning', 'error'],
};

import { BrowserWindow } from 'electron';
import { BugsnagError } from '../../shared/types';
import { accounts } from '../store/accounts';
import { config } from '../store/config';
import { getBugsnagClient, clearClientCache } from '../api/bugsnag';
import { checkNewErrors, cleanNotificationCache } from './notifications';

export type TrayStatus = 'green' | 'orange' | 'red' | 'gray';

export interface PollingData {
  errors: BugsnagError[];
  lastUpdated: Date;
  status: TrayStatus;
  error?: string;
}

const IPC_CHANNELS = {
  DATA_UPDATED: 'data:updated',
};

class PollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastData: PollingData = {
    errors: [],
    lastUpdated: new Date(),
    status: 'gray',
  };
  private onDataUpdate: ((data: PollingData) => void) | null = null;
  private isRefreshing = false;

  start(callback?: (data: PollingData) => void): void {
    if (callback) {
      this.onDataUpdate = callback;
    }

    this.stop();
    this.refresh();

    const interval = config.getRefreshInterval();
    this.intervalId = setInterval(() => {
      this.refresh();
    }, interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  restart(): void {
    this.start(this.onDataUpdate || undefined);
  }

  async refresh(): Promise<PollingData> {
    if (this.isRefreshing) {
      return this.lastData;
    }

    this.isRefreshing = true;

    try {
      const activeAccounts = accounts.getActive();

      if (activeAccounts.length === 0) {
        this.lastData = {
          errors: [],
          lastUpdated: new Date(),
          status: 'gray',
        };
        this.emitUpdate();
        return this.lastData;
      }

      const allErrors: BugsnagError[] = [];

      for (const account of activeAccounts) {
        const token = accounts.getToken(account.id);
        if (!token) continue;

        const client = getBugsnagClient(account.id, token);

        try {
          const watchedProjectIds = config.getWatchedProjectIds();
          if (watchedProjectIds.length === 0) continue;

          const statusFilters = config.get('errorStatusFilter') || ['open'];
          const severityFilters = config.get('errorSeverityFilter') || ['info', 'warning', 'error'];
          const showOnlyUnhandled = config.get('showOnlyUnhandled');
          const errorMaxAge = config.get('errorMaxAge') ?? 24;

          for (const projectId of watchedProjectIds) {
            try {
              for (const status of statusFilters) {
                const errors = await client.getErrors(projectId, {
                  status,
                  sort: 'last_seen',
                  direction: 'desc',
                  perPage: 25,
                });

                let filteredErrors = errors.filter((e) =>
                  severityFilters.includes(e.severity)
                );

                if (showOnlyUnhandled) {
                  filteredErrors = filteredErrors.filter((e) => e.unhandled);
                }

                if (errorMaxAge > 0) {
                  const maxAgeMs = errorMaxAge * 60 * 60 * 1000;
                  const now = Date.now();
                  filteredErrors = filteredErrors.filter((e) => {
                    const errorAge = now - new Date(e.lastSeen).getTime();
                    return errorAge <= maxAgeMs;
                  });
                }

                allErrors.push(...filteredErrors);
              }
            } catch (error) {
              // Skip this project on error
            }
          }
        } catch (error) {
          // Skip this account on error
        }
      }

      // Deduplicate errors by ID
      const errorMap = new Map<string, BugsnagError>();
      allErrors.forEach((e) => errorMap.set(e.id, e));
      const uniqueErrors = Array.from(errorMap.values());

      checkNewErrors(this.lastData.errors, uniqueErrors);

      const status = this.calculateStatus(uniqueErrors);

      this.lastData = {
        errors: uniqueErrors,
        lastUpdated: new Date(),
        status,
      };

      cleanNotificationCache();
      this.emitUpdate();
      return this.lastData;
    } catch (error) {
      this.lastData = {
        ...this.lastData,
        lastUpdated: new Date(),
        status: 'gray',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.emitUpdate();
      return this.lastData;
    } finally {
      this.isRefreshing = false;
    }
  }

  private calculateStatus(errors: BugsnagError[]): TrayStatus {
    const dismissedErrors = config.get('dismissedErrors') || [];
    const visibleErrors = errors.filter((e) => !dismissedErrors.includes(e.id));

    const hasCriticalError = visibleErrors.some((e) => e.severity === 'error');
    if (hasCriticalError) return 'red';

    const hasWarning = visibleErrors.some((e) => e.severity === 'warning');
    if (hasWarning) return 'orange';

    if (visibleErrors.length > 0) return 'green';

    return 'gray';
  }

  private emitUpdate(): void {
    const dismissedErrors = config.get('dismissedErrors') || [];
    const visibleErrors = this.lastData.errors.filter((e) => !dismissedErrors.includes(e.id));
    const dataForRenderer = { ...this.lastData, errors: visibleErrors };

    if (this.onDataUpdate) {
      this.onDataUpdate(dataForRenderer);
    }

    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.DATA_UPDATED, dataForRenderer);
      }
    });
  }

  getData(): PollingData {
    return this.lastData;
  }

  getErrorCount(): number {
    return this.lastData.errors.length;
  }

  clearCache(): void {
    clearClientCache();
  }

  recalculateStatus(): void {
    const newStatus = this.calculateStatus(this.lastData.errors);
    this.lastData = { ...this.lastData, status: newStatus };
    this.emitUpdate();
  }
}

export const pollingService = new PollingService();

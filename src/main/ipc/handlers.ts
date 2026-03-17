import { ipcMain, shell, app } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels';
import { accounts } from '../store/accounts';
import { config } from '../store/config';
import { pollingService } from '../services/polling';
import { trayManager } from '../tray';
import { BugsnagClient, getBugsnagClient } from '../api/bugsnag';
import { BugsnagAccount, BugsnagAccountInput, AppConfig } from '../../shared/types';

export function setupIpcHandlers(): void {
  // ===== Accounts =====

  ipcMain.handle(IPC_CHANNELS.ACCOUNTS_GET_ALL, (): BugsnagAccount[] => {
    return accounts.getAll();
  });

  ipcMain.handle(
    IPC_CHANNELS.ACCOUNTS_ADD,
    async (_, input: BugsnagAccountInput): Promise<{ success: boolean; account?: BugsnagAccount; error?: string }> => {
      try {
        const client = new BugsnagClient(input.token, 'temp');
        const orgs = await client.validateToken();

        if (!orgs || orgs.length === 0) {
          return { success: false, error: 'Invalid token or no organizations found' };
        }

        const account = accounts.add(
          { name: input.name, isActive: true },
          input.token
        );

        if (!account) {
          return { success: false, error: 'Error saving account' };
        }

        pollingService.restart();
        return { success: true, account };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.ACCOUNTS_REMOVE,
    (_, accountId: string): { success: boolean; error?: string } => {
      const removed = accounts.remove(accountId);
      if (removed) {
        pollingService.clearCache();
        pollingService.restart();
        return { success: true };
      }
      return { success: false, error: 'Account not found' };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.ACCOUNTS_VALIDATE_TOKEN,
    async (_, token: string): Promise<{ valid: boolean; orgs?: { id: string; name: string }[] }> => {
      try {
        const client = new BugsnagClient(token, 'temp');
        const orgs = await client.validateToken();

        if (orgs && orgs.length > 0) {
          return { valid: true, orgs: orgs.map((o) => ({ id: o.id, name: o.name })) };
        }
        return { valid: false };
      } catch {
        return { valid: false };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.ACCOUNTS_UPDATE,
    (_, accountId: string, updates: Partial<Omit<BugsnagAccount, 'id'>>): { success: boolean; account?: BugsnagAccount; error?: string } => {
      const account = accounts.update(accountId, updates);
      if (account) {
        pollingService.restart();
        return { success: true, account };
      }
      return { success: false, error: 'Account not found' };
    }
  );

  // ===== Bugsnag Data =====

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_GET_ERRORS, () => {
    return pollingService.getData().errors;
  });

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_REFRESH, async () => {
    return await pollingService.refresh();
  });

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_DISMISS_ERROR, (_, errorId: string) => {
    const dismissed = config.get('dismissedErrors') || [];
    if (!dismissed.includes(errorId)) {
      dismissed.push(errorId);
      config.set('dismissedErrors', dismissed);
    }
    pollingService.recalculateStatus();
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_RESTORE_ERRORS, () => {
    config.set('dismissedErrors', []);
    pollingService.recalculateStatus();
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_SEARCH_PROJECTS, async (_, query: string) => {
    const activeAccounts = accounts.getActive();
    if (activeAccounts.length === 0) return [];

    const allProjects: any[] = [];
    const seenIds = new Set<string>();

    for (const account of activeAccounts) {
      const token = accounts.getToken(account.id);
      if (!token) continue;

      const client = getBugsnagClient(account.id, token);
      const projects = await client.searchProjects(query);

      for (const project of projects) {
        if (!seenIds.has(project.id)) {
          seenIds.add(project.id);
          allProjects.push(project);
        }
      }
    }

    return allProjects;
  });

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_GET_ORGANIZATIONS, async () => {
    const activeAccounts = accounts.getActive();
    if (activeAccounts.length === 0) return [];

    const allOrgs: any[] = [];
    for (const account of activeAccounts) {
      const token = accounts.getToken(account.id);
      if (!token) continue;
      const client = getBugsnagClient(account.id, token);
      const orgs = await client.getOrganizations();
      allOrgs.push(...orgs);
    }
    return allOrgs;
  });

  ipcMain.handle(IPC_CHANNELS.BUGSNAG_GET_PROJECTS, async (_, orgId?: string) => {
    const activeAccounts = accounts.getActive();
    if (activeAccounts.length === 0) return [];

    const allProjects: any[] = [];
    for (const account of activeAccounts) {
      const token = accounts.getToken(account.id);
      if (!token) continue;
      const client = getBugsnagClient(account.id, token);

      if (orgId) {
        const projects = await client.getProjects(orgId);
        allProjects.push(...projects);
      } else {
        const orgs = await client.getOrganizations();
        for (const org of orgs) {
          const projects = await client.getProjects(org.id);
          allProjects.push(...projects);
        }
      }
    }
    return allProjects;
  });

  // ===== Configuration =====

  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, (_, key: keyof AppConfig) => {
    return config.get(key);
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, (_, key: keyof AppConfig, value: unknown) => {
    config.set(key, value as AppConfig[keyof AppConfig]);
    if (key === 'refreshInterval') {
      pollingService.restart();
    }
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_GET_ALL, () => {
    return config.getAll();
  });

  // ===== Application =====

  ipcMain.handle(IPC_CHANNELS.APP_OPEN_EXTERNAL, (_, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.APP_SHOW_PREFERENCES, () => {
    trayManager.showPreferencesWindow();
  });

  ipcMain.handle(IPC_CHANNELS.APP_QUIT, () => {
    app.quit();
  });

  ipcMain.handle(IPC_CHANNELS.APP_HIDE_MENU, () => {
    trayManager.hideMenuWindow();
  });
}

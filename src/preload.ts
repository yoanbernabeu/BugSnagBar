import { contextBridge, ipcRenderer } from 'electron';

const IPC_CHANNELS = {
  ACCOUNTS_GET_ALL: 'accounts:getAll',
  ACCOUNTS_ADD: 'accounts:add',
  ACCOUNTS_REMOVE: 'accounts:remove',
  ACCOUNTS_VALIDATE_TOKEN: 'accounts:validateToken',
  ACCOUNTS_UPDATE: 'accounts:update',
  BUGSNAG_GET_ERRORS: 'bugsnag:getErrors',
  BUGSNAG_GET_PROJECTS: 'bugsnag:getProjects',
  BUGSNAG_REFRESH: 'bugsnag:refresh',
  BUGSNAG_SEARCH_PROJECTS: 'bugsnag:searchProjects',
  BUGSNAG_GET_ORGANIZATIONS: 'bugsnag:getOrganizations',
  BUGSNAG_DISMISS_ERROR: 'bugsnag:dismissError',
  BUGSNAG_RESTORE_ERRORS: 'bugsnag:restoreErrors',
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_GET_ALL: 'config:getAll',
  APP_OPEN_EXTERNAL: 'app:openExternal',
  APP_SHOW_PREFERENCES: 'app:showPreferences',
  APP_QUIT: 'app:quit',
  APP_HIDE_MENU: 'app:hideMenu',
  DATA_UPDATED: 'data:updated',
  REFRESH_STATUS: 'refresh:status',
  ERROR_OCCURRED: 'error:occurred',
};

const api = {
  accounts: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.ACCOUNTS_GET_ALL),
    add: (input: any) => ipcRenderer.invoke(IPC_CHANNELS.ACCOUNTS_ADD, input),
    remove: (accountId: string) => ipcRenderer.invoke(IPC_CHANNELS.ACCOUNTS_REMOVE, accountId),
    update: (accountId: string, updates: any) => ipcRenderer.invoke(IPC_CHANNELS.ACCOUNTS_UPDATE, accountId, updates),
    validateToken: (token: string) => ipcRenderer.invoke(IPC_CHANNELS.ACCOUNTS_VALIDATE_TOKEN, token),
  },

  bugsnag: {
    getErrors: () => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_GET_ERRORS),
    getProjects: (orgId?: string) => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_GET_PROJECTS, orgId),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_REFRESH),
    searchProjects: (query: string) => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_SEARCH_PROJECTS, query),
    getOrganizations: () => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_GET_ORGANIZATIONS),
    dismissError: (errorId: string) => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_DISMISS_ERROR, errorId),
    restoreErrors: () => ipcRenderer.invoke(IPC_CHANNELS.BUGSNAG_RESTORE_ERRORS),
  },

  config: {
    get: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET, key),
    set: (key: string, value: any) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET, key, value),
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET_ALL),
  },

  app: {
    openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_EXTERNAL, url),
    showPreferences: () => ipcRenderer.invoke(IPC_CHANNELS.APP_SHOW_PREFERENCES),
    quit: () => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),
    hideMenu: () => ipcRenderer.invoke(IPC_CHANNELS.APP_HIDE_MENU),
  },

  on: {
    dataUpdated: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.DATA_UPDATED, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.DATA_UPDATED, handler);
    },
    refreshStatus: (callback: (status: string) => void) => {
      const handler = (_: any, status: string) => callback(status);
      ipcRenderer.on(IPC_CHANNELS.REFRESH_STATUS, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.REFRESH_STATUS, handler);
    },
    error: (callback: (error: string) => void) => {
      const handler = (_: any, error: string) => callback(error);
      ipcRenderer.on(IPC_CHANNELS.ERROR_OCCURRED, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.ERROR_OCCURRED, handler);
    },
  },
};

contextBridge.exposeInMainWorld('bugsnagbar', api);

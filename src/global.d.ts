interface BugSnagBarAPI {
  accounts: {
    getAll: () => Promise<any>;
    add: (input: any) => Promise<any>;
    remove: (accountId: string) => Promise<any>;
    update: (accountId: string, updates: any) => Promise<any>;
    validateToken: (token: string) => Promise<any>;
  };

  bugsnag: {
    getErrors: () => Promise<any>;
    getProjects: (orgId?: string) => Promise<any>;
    refresh: () => Promise<any>;
    searchProjects: (query: string) => Promise<any>;
    getOrganizations: () => Promise<any>;
    dismissError: (errorId: string) => Promise<any>;
    restoreErrors: () => Promise<any>;
  };

  config: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<any>;
    getAll: () => Promise<any>;
  };

  app: {
    openExternal: (url: string) => Promise<any>;
    showPreferences: () => Promise<any>;
    quit: () => Promise<any>;
    hideMenu: () => Promise<any>;
  };

  on: {
    dataUpdated: (callback: (data: any) => void) => () => void;
    refreshStatus: (callback: (status: string) => void) => () => void;
    error: (callback: (error: string) => void) => () => void;
  };
}

interface Window {
  bugsnagbar: BugSnagBarAPI;
}

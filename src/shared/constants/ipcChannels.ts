export const IPC_CHANNELS = {
  // Accounts
  ACCOUNTS_GET_ALL: 'accounts:getAll',
  ACCOUNTS_ADD: 'accounts:add',
  ACCOUNTS_REMOVE: 'accounts:remove',
  ACCOUNTS_VALIDATE_TOKEN: 'accounts:validateToken',
  ACCOUNTS_UPDATE: 'accounts:update',

  // Bugsnag Data
  BUGSNAG_GET_ERRORS: 'bugsnag:getErrors',
  BUGSNAG_GET_PROJECTS: 'bugsnag:getProjects',
  BUGSNAG_REFRESH: 'bugsnag:refresh',
  BUGSNAG_SEARCH_PROJECTS: 'bugsnag:searchProjects',
  BUGSNAG_GET_ORGANIZATIONS: 'bugsnag:getOrganizations',
  BUGSNAG_DISMISS_ERROR: 'bugsnag:dismissError',
  BUGSNAG_RESTORE_ERRORS: 'bugsnag:restoreErrors',

  // Configuration
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_GET_ALL: 'config:getAll',

  // Application
  APP_OPEN_EXTERNAL: 'app:openExternal',
  APP_SHOW_PREFERENCES: 'app:showPreferences',
  APP_QUIT: 'app:quit',
  APP_HIDE_MENU: 'app:hideMenu',

  // Events (main -> renderer)
  DATA_UPDATED: 'data:updated',
  REFRESH_STATUS: 'refresh:status',
  ERROR_OCCURRED: 'error:occurred',
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

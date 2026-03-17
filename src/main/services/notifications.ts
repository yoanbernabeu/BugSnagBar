import { Notification, shell } from 'electron';
import { BugsnagError } from '../../shared/types';
import { config } from '../store/config';

const notifiedErrors = new Set<string>();

function getNotificationConfig() {
  return config.get('notifications');
}

export function notifyNewError(error: BugsnagError): void {
  const notifConfig = getNotificationConfig();
  if (!notifConfig.enabled || !notifConfig.newError) return;

  const key = `error-${error.id}`;
  if (notifiedErrors.has(key)) return;

  const severityLabel = error.severity === 'error' ? 'Error' : error.severity === 'warning' ? 'Warning' : 'Info';

  const notification = new Notification({
    title: `New ${severityLabel}: ${error.errorClass}`,
    body: `${error.message}\nProject: ${error.projectName}`,
    silent: false,
    urgency: error.severity === 'error' ? 'critical' : 'normal',
  });

  notification.on('click', () => {
    if (error.url) {
      shell.openExternal(error.url);
    }
  });

  notification.show();
  notifiedErrors.add(key);
}

export function checkNewErrors(
  oldErrors: BugsnagError[],
  newErrors: BugsnagError[]
): void {
  const oldIds = new Set(oldErrors.map((e) => e.id));

  for (const error of newErrors) {
    if (!oldIds.has(error.id)) {
      notifyNewError(error);
    }
  }
}

export function cleanNotificationCache(): void {
  if (notifiedErrors.size > 1000) {
    const entries = Array.from(notifiedErrors);
    entries.slice(0, entries.length - 500).forEach((key) => notifiedErrors.delete(key));
  }
}

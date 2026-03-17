export interface BugsnagAccount {
  id: string;
  name: string;
  isActive: boolean;
}

export interface BugsnagAccountInput {
  name: string;
  token: string;
}

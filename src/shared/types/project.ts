export interface BugsnagProject {
  id: string;
  name: string;
  slug: string;
  type: string;
  language: string;
  openErrorCount: number;
  collaboratorCount: number;
  htmlUrl: string;
  apiKey: string;
  releaseStages: string[];
  createdAt: string;
  updatedAt: string;
  orgId: string;
}

export interface BugsnagOrganization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

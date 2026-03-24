import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  BugsnagError,
  BugsnagProject,
  BugsnagOrganization,
} from '../../shared/types';

export class BugsnagClient {
  private client: AxiosInstance;
  private accountId: string;

  constructor(token: string, accountId: string, baseUrl: string = 'https://api.bugsnag.com') {
    this.accountId = accountId;

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.client.request(error.config!);
        }
        throw error;
      }
    );
  }

  async validateToken(): Promise<BugsnagOrganization[] | null> {
    try {
      const response = await this.client.get('/user/organizations');
      return response.data.map((org: any) => this.transformOrganization(org));
    } catch (error) {
      return null;
    }
  }

  async getOrganizations(): Promise<BugsnagOrganization[]> {
    try {
      const response = await this.client.get('/user/organizations');
      return response.data.map((org: any) => this.transformOrganization(org));
    } catch (error) {
      return [];
    }
  }

  private transformOrganization(org: any): BugsnagOrganization {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdAt: org.created_at,
    };
  }

  async getProjects(orgId: string): Promise<BugsnagProject[]> {
    try {
      const response = await this.client.get(`/organizations/${orgId}/projects`, {
        params: { per_page: 100 },
      });
      return response.data.map((project: any) => this.transformProject(project, orgId));
    } catch (error) {
      return [];
    }
  }

  async getProject(projectId: string): Promise<BugsnagProject | null> {
    try {
      const response = await this.client.get(`/projects/${projectId}`);
      return this.transformProject(response.data, '');
    } catch (error) {
      return null;
    }
  }

  private transformProject(project: any, orgId: string): BugsnagProject {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      type: project.type || '',
      language: project.language || '',
      openErrorCount: project.open_error_count || 0,
      collaboratorCount: project.collaborator_count || 0,
      htmlUrl: project.html_url || '',
      apiKey: project.api_key || '',
      releaseStages: project.release_stages || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      orgId,
    };
  }

  async getErrors(
    projectId: string,
    options: {
      status?: string;
      severity?: string;
      sort?: string;
      direction?: string;
      perPage?: number;
    } = {}
  ): Promise<BugsnagError[]> {
    try {
      const params: Record<string, string | number> = {
        per_page: options.perPage || 30,
      };
      if (options.status) params['filters[error.status][]'] = options.status;
      if (options.severity) params['filters[event.severity][]'] = options.severity;
      if (options.sort) params.sort = options.sort;
      if (options.direction) params.direction = options.direction;

      const response = await this.client.get(`/projects/${projectId}/errors`, { params });

      const project = await this.getProject(projectId);
      const projectHtmlUrl = project?.htmlUrl || '';

      return response.data.map((error: any) => this.transformError(error, projectId, project?.name || '', projectHtmlUrl));
    } catch (error) {
      return [];
    }
  }

  private transformError(error: any, projectId: string, projectName: string, projectHtmlUrl: string): BugsnagError {
    // Build the dashboard URL: {projectHtmlUrl}/errors/{errorId}
    const dashboardUrl = projectHtmlUrl ? `${projectHtmlUrl}/errors/${error.id}` : '';

    return {
      id: error.id,
      errorClass: error.error_class || '',
      message: error.message || '',
      severity: error.severity || 'error',
      status: error.status || 'open',
      unhandled: error.unhandled || false,
      firstSeen: error.first_seen || '',
      lastSeen: error.last_seen || '',
      eventsCount: error.events || 0,
      usersAffected: error.users_affected || 0,
      projectId,
      projectName,
      url: dashboardUrl,
      accountId: this.accountId,
      releaseStages: error.release_stages || [],
      assignedCollaboratorId: error.assigned_collaborator_id || undefined,
      commentCount: error.comment_count || 0,
    };
  }

  async updateErrorStatus(projectId: string, errorId: string, status: string): Promise<boolean> {
    try {
      await this.client.patch(`/projects/${projectId}/errors/${errorId}`, {
        operation: 'fix',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async searchProjects(query: string): Promise<BugsnagProject[]> {
    const orgs = await this.getOrganizations();
    const allProjects: BugsnagProject[] = [];

    for (const org of orgs) {
      const projects = await this.getProjects(org.id);
      const filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.slug.toLowerCase().includes(query.toLowerCase())
      );
      allProjects.push(...filtered);
    }

    return allProjects;
  }
}

const clientCache = new Map<string, BugsnagClient>();

export function getBugsnagClient(
  accountId: string,
  token: string,
  baseUrl?: string
): BugsnagClient {
  const cacheKey = accountId;
  let client = clientCache.get(cacheKey);

  if (!client) {
    client = new BugsnagClient(token, accountId, baseUrl);
    clientCache.set(cacheKey, client);
  }

  return client;
}

export function clearClientCache(accountId?: string): void {
  if (accountId) {
    clientCache.delete(accountId);
  } else {
    clientCache.clear();
  }
}

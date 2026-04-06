import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Base API client for OrangeHRM.
 *
 * CSRF note: OrangeHRM API v2 does NOT require a CSRF token for JSON requests
 * when the session cookie is present. The csrfToken field is reserved in case
 * future endpoints or configuration changes require it — uncomment the header
 * injection in getHeaders() if 403 responses appear on mutating requests.
 */
export class ApiClient {
  private csrfToken: string | null = null;

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  /**
   * Authenticates against OrangeHRM by posting form-encoded credentials.
   * Playwright's APIRequestContext stores the session cookie automatically.
   * After login, attempts to extract a CSRF token from response headers.
   */
  async authenticate(username: string, password: string): Promise<void> {
    const response = await this.request.post(
      `${this.baseURL}/web/index.php/auth/validate`,
      {
        form: { username, password },
      },
    );

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Authentication failed: ${response.status()} - ${body.slice(0, 200)}`,
      );
    }

    // Attempt to extract CSRF token from response headers.
    // OrangeHRM may set it as x-csrf-token or embed it in the HTML.
    // Currently unused for API v2 requests — see class-level CSRF note.
    const csrfHeader = response.headers()['x-csrf-token'];
    if (csrfHeader) {
      this.csrfToken = csrfHeader;
    }
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const response = await this.request.get(this.buildUrl(path), {
      headers: this.getHeaders(),
      params,
    });
    return this.handleResponse<T>(response, 'GET', path);
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await this.request.post(this.buildUrl(path), {
      headers: this.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response, 'POST', path);
  }

  async put<T>(path: string, data: unknown): Promise<T> {
    const response = await this.request.put(this.buildUrl(path), {
      headers: this.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response, 'PUT', path);
  }

  async delete<T = void>(path: string, data?: unknown): Promise<T> {
    const response = await this.request.delete(this.buildUrl(path), {
      headers: this.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response, 'DELETE', path);
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const base = `${this.baseURL}/web/index.php/api/v2/`;
    // Avoid double slashes if path starts with /
    return `${base}${path.replace(/^\//, '')}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      // Uncomment the line below if 403 errors appear on mutating requests:
      // ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}),
    };
  }

  private async handleResponse<T>(
    response: APIResponse,
    method: string,
    path: string,
  ): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `API ${method} ${path} failed: ${response.status()} - ${body.slice(0, 500)}`,
      );
    }
    return response.json() as Promise<T>;
  }
}

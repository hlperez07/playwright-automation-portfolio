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
   * Authenticates against OrangeHRM.
   *
   * OrangeHRM embeds a CSRF token (_token) as a hidden field in the login
   * form. Without it, the POST to auth/validate is rejected silently and the
   * session is never established — all subsequent API calls return 401.
   *
   * Flow:
   *   1. GET /auth/login  → extract _token from HTML
   *   2. POST /auth/validate with credentials + _token (form-encoded)
   *   3. Verify we landed on the dashboard (not back on login)
   */
  async authenticate(username: string, password: string): Promise<void> {
    // Step 1: fetch login page to get the CSRF token
    const loginPageResponse = await this.request.get(
      `${this.baseURL}/web/index.php/auth/login`,
    );
    const html = await loginPageResponse.text();

    // OrangeHRM v5 embeds the CSRF token as a Vue prop in the format:
    //   :token="&quot;TOKEN_VALUE&quot;"
    const tokenMatch = html.match(/:token="&quot;([^&"]+)&quot;"/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';

    if (!csrfToken) {
      throw new Error('Authentication failed: could not extract CSRF token from login page HTML');
    }

    // Step 2: submit credentials with CSRF token
    const response = await this.request.post(
      `${this.baseURL}/web/index.php/auth/validate`,
      {
        form: { username, password, _token: csrfToken },
      },
    );

    // Step 3: verify we're on the dashboard (not redirected back to login)
    // A failed login returns 302 → /auth/login; a successful one → /dashboard
    const finalUrl = response.url();
    if (finalUrl.includes('/auth/login')) {
      throw new Error(
        `Authentication failed: credentials rejected or CSRF token invalid. Final URL: ${finalUrl}`,
      );
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

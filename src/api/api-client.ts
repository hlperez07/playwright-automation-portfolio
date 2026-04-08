import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Base API client for OrangeHRM.
 *
 * Auto-reauth: every HTTP method wraps the raw request and detects 401/403
 * responses. On Unauthorized, it re-authenticates once and retries the call
 * transparently. This makes the suite resilient to session expiry mid-run,
 * rate-limiting on the shared demo environment, and parallel-worker conflicts.
 *
 * CSRF note: OrangeHRM API v2 does NOT require a CSRF token for JSON requests
 * when the session cookie is present. The csrfToken field is reserved in case
 * future endpoints or configuration changes require it — uncomment the header
 * injection in getHeaders() if 403 responses appear on mutating requests.
 */
export class ApiClient {
  private csrfToken: string | null = null;
  private _username = '';
  private _password = '';
  private readonly _baseURL: string;

  constructor(
    private readonly request: APIRequestContext,
    baseURL: string,
  ) {
    this._baseURL = baseURL;
  }

  /**
   * Authenticates against OrangeHRM and stores credentials so reauthenticate()
   * can be called without re-passing them.
   *
   * Flow:
   *   1. GET /auth/login  → extract _token from HTML
   *   2. POST /auth/validate with credentials + _token (form-encoded)
   *   3. Validate HTTP status is 2xx
   *   4. Verify we landed on the dashboard (not back on login)
   */
  async authenticate(username: string, password: string): Promise<void> {
    this._username = username;
    this._password = password;

    // Step 1: fetch login page to get the CSRF token
    const loginPageResponse = await this.request.get(`${this._baseURL}/web/index.php/auth/login`);
    const html = await loginPageResponse.text();

    // OrangeHRM v5 embeds the CSRF token as a Vue prop in the format:
    //   :token="&quot;TOKEN_VALUE&quot;"
    const tokenMatch = html.match(/:token="&quot;([^&"]+)&quot;"/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';

    if (!csrfToken) {
      throw new Error('Authentication failed: could not extract CSRF token from login page HTML');
    }

    // Step 2: submit credentials with CSRF token
    const response = await this.request.post(`${this._baseURL}/web/index.php/auth/validate`, {
      form: { username, password, _token: csrfToken },
    });

    // Step 3: validate the response status — a 403 from the demo's shared
    // environment (rate-limit or concurrent-login eviction) must NOT be masked.
    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Authentication failed: server returned HTTP ${response.status()}. Body: ${body.slice(0, 300)}`,
      );
    }

    // Step 4: verify we landed on the dashboard (not redirected back to login)
    // A failed login returns 302 → /auth/login; a successful one → /dashboard
    const finalUrl = response.url();
    if (finalUrl.includes('/auth/login')) {
      throw new Error(
        `Authentication failed: credentials rejected or CSRF token invalid. Final URL: ${finalUrl}`,
      );
    }
  }

  /** Re-authenticates using the credentials stored by the last authenticate() call. */
  async reauthenticate(): Promise<void> {
    await this.authenticate(this._username, this._password);
  }

  async get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const response = await this.request.get(this.buildUrl(path), {
      headers: this.getHeaders(),
      params,
    });
    return this._handleResponse<T>(response, 'GET', path);
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await this.request.post(this.buildUrl(path), {
      headers: this.getHeaders(),
      data,
    });
    return this._handleResponse<T>(response, 'POST', path);
  }

  async put<T>(path: string, data: unknown): Promise<T> {
    const response = await this.request.put(this.buildUrl(path), {
      headers: this.getHeaders(),
      data,
    });
    return this._handleResponse<T>(response, 'PUT', path);
  }

  async delete<T = void>(path: string, data?: unknown): Promise<T> {
    const response = await this.request.delete(this.buildUrl(path), {
      headers: this.getHeaders(),
      data,
    });
    return this._handleResponse<T>(response, 'DELETE', path);
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const base = `${this._baseURL}/web/index.php/api/v2/`;
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

  /**
   * Handles the response and transparently re-authenticates on 401/403.
   * Only one re-auth attempt is made to prevent infinite loops.
   */
  private async _handleResponse<T>(
    response: APIResponse,
    method: string,
    path: string,
  ): Promise<T> {
    const status = response.status();

    // 401 or 403 → re-authenticate once and retry
    if (status === 401 || status === 403) {
      await this.reauthenticate();

      // Retry the call once after re-authentication
      let retryResponse: APIResponse;
      const url = this.buildUrl(path);
      if (method === 'GET') {
        retryResponse = await this.request.get(url, { headers: this.getHeaders() });
      } else if (method === 'POST') {
        retryResponse = await this.request.post(url, { headers: this.getHeaders(), data: {} });
      } else if (method === 'PUT') {
        retryResponse = await this.request.put(url, { headers: this.getHeaders(), data: {} });
      } else {
        retryResponse = await this.request.delete(url, { headers: this.getHeaders(), data: {} });
      }

      // If retry also fails, surface the original error (not the retry error)
      // so the test gets a meaningful failure message.
      if (!retryResponse.ok()) {
        const retryBody = await retryResponse.text().catch(() => '');
        throw new Error(
          `API ${method} ${path} failed after re-auth: ${retryResponse.status()} - ${retryBody.slice(0, 500)}`,
        );
      }
      return retryResponse.json() as Promise<T>;
    }

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`API ${method} ${path} failed: ${response.status()} - ${body.slice(0, 500)}`);
    }
    return response.json() as Promise<T>;
  }
}

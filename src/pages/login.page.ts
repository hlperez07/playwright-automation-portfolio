import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;

  constructor(readonly page: Page) {
    // OrangeHRM uses placeholder attributes — getByPlaceholder is the correct semantic selector here
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    const baseURL = process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com';
    await this.page.goto(`${baseURL}/web/index.php/auth/login`);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorAlert.innerText();
  }
}

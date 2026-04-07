import { type Page, type Locator } from '@playwright/test';
import { LoginLocators } from '../locators/login.locators';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByPlaceholder(LoginLocators.usernamePlaceholder);
    this.passwordInput = page.getByPlaceholder(LoginLocators.passwordPlaceholder);
    this.loginButton = page.getByRole('button', { name: LoginLocators.submitButton });
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

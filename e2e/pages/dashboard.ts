import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class Dashboard extends BasePage<Dashboard> {
  path: string = ''
  
  async is_on_page() {
    const title = this.page.locator('//main//nav//span');
    await expect(title).toHaveText('Dashboard');
    return this;
  }
}

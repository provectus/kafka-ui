import { Locator, Page } from '@playwright/test';

export class LeftPanel {
  readonly page: Page;
  readonly baseURL: string;
  readonly dashboard: Locator;
  
  constructor(baseURL:string, page: Page) {
    this.page = page;
    this.baseURL = baseURL;
    this.dashboard = page.locator(`aside  a[title='Dashboard']`);
  }

  async goto_dashboard() {
    await this.dashboard.click()
  }

}
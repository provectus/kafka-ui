import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

const make_path = (cluster:string) => `ui/clusters/${cluster}/brokers`;

export class Brokers extends BasePage<Brokers> {
  
  constructor(baseURL:string,page: Page,cluster:string) {
   super(baseURL,page,make_path(cluster));
  }

  async is_on_page() {
    const title = this.page.locator('//main//nav//span');
    await expect(title).toHaveText('Brokers overview');
    return this;
  }
}

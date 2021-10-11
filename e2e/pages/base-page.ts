import { Page } from '@playwright/test';

export abstract class BasePage<T extends BasePage<T>> {
  protected readonly baseURL: string;
  protected page: Page;
  protected path: string;


  constructor(baseURL:string,page: Page,path:string='') {
    this.page = page;
    this.baseURL = baseURL;
    this.path = path;
  }

  async goto() {
    await this.page.goto(this.baseURL+this.path);
  }
  
  abstract is_on_page():Promise<T>;

}
import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { expect } from 'chai'; 

const NUMBER_OF_RETRIES = 50;
const make_path = (cluster:string) => `ui/clusters/${cluster}/topics`;

export class Topics extends BasePage<Topics> {

  cluster:string;

  async reload_till_topic_appears(topic_name: string) {
    let topic_found = false;
    for await(let i  of [...Array(NUMBER_OF_RETRIES).keys()]){
      await this.page.reload();
      await this.page.waitForResponse(async response => {
        const is_topics_response = response.url().includes('api') && response.url().includes('topics')
        if(is_topics_response)
        {
          const topics = (await response.json() as any).topics;
          topic_found = topics.find((topic) =>topic.name === topic_name) !== undefined;
        }
        return is_topics_response;
      }  );
      if(!topic_found)
        await this.page.waitForTimeout(1000);
      else
         break;
    }
    expect(topic_found).to.be.true;
    await this.has_topic_on_page(topic_name);
  }
  
  constructor(baseURL:string,page: Page,cluster:string) {
   super(baseURL,page,make_path(cluster));
   this.cluster = cluster;
  }

  async is_on_page() {
    const title = this.page.locator('//main//nav//span');
    await expect(await title.innerText()).to.equal('All Topics');
    const loading_indicator = this.page.locator(`//*[text()='Loading...']`);
    if (await loading_indicator.isVisible()){
      await this.page.waitForSelector(`//*[text()='Loading...']`,{state: 'detached'});
    }
    return this;
  }
  async has_topic_on_page(topic: string, assert_visibility=true):Promise<boolean> {
    const topic_element = this.page.locator(`//table//td/a[text()='${topic}']`)
    const is_visible = await topic_element.isVisible();
    if(assert_visibility)
      expect(is_visible,`Topic ${topic} should be on page`).to.be.true;
    return is_visible;
  }

  async click_add_topic() {
    await this.page.locator(`//a[text()='Add a Topic']`).click();
  }
}

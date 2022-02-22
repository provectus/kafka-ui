import React from 'react';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { BreadcrumbProvider } from 'components/common/Breadcrumb/Breadcrumb.provider';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import { render } from 'lib/testHelpers';

const createTopicPath = '/clusters/local/topics/create-new';
const createTopicRoutePath = '/clusters/:clusterName/topics/create-new';

const topicPath = '/clusters/secondLocal/topics/topic-name';
const topicRoutePath = '/clusters/:clusterName/topics/:topicName';

describe('Breadcrumb component', () => {
  const setupComponent = (pathname: string, routePath: string) =>
    render(
      <BreadcrumbProvider>
        <Breadcrumb />
        <BreadcrumbRoute path={routePath} />
      </BreadcrumbProvider>,
      { pathname }
    );

  it('renders the list of links', async () => {
    const { getByText } = setupComponent(createTopicPath, createTopicRoutePath);
    expect(getByText('Topics')).toBeInTheDocument();
    expect(getByText('Create New')).toBeInTheDocument();
  });
  it('renders the topic overview', async () => {
    const { getByText } = setupComponent(topicPath, topicRoutePath);
    expect(getByText('Topics')).toBeInTheDocument();
    expect(getByText('topic-name')).toBeInTheDocument();
  });
});

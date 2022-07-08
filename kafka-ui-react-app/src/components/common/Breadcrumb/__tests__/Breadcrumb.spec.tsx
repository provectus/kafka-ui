import React from 'react';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { BreadcrumbProvider } from 'components/common/Breadcrumb/Breadcrumb.provider';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterTopicNewPath, clusterTopicPath } from 'lib/paths';

const createTopicPath = clusterTopicNewPath('local');
const createTopicRoutePath = clusterTopicNewPath();

const topicName = 'topic-name';

const topicPath = clusterTopicPath('secondLocal', topicName);
const topicRoutePath = clusterTopicPath();

describe('Breadcrumb component', () => {
  const setupComponent = (pathname: string, routePath: string) =>
    render(
      <BreadcrumbProvider>
        <Breadcrumb />
        <WithRoute path={routePath}>
          <BreadcrumbRoute>
            <div />
          </BreadcrumbRoute>
        </WithRoute>
      </BreadcrumbProvider>,
      { initialEntries: [pathname] }
    );

  it('renders the list of links', async () => {
    const { getByText } = setupComponent(createTopicPath, createTopicRoutePath);
    expect(getByText('Topics')).toBeInTheDocument();
    expect(getByText('Create New')).toBeInTheDocument();
  });
  it('renders the topic overview', async () => {
    const { getByText } = setupComponent(topicPath, topicRoutePath);
    expect(getByText('Topics')).toBeInTheDocument();
    expect(getByText(topicName)).toBeInTheDocument();
  });
});

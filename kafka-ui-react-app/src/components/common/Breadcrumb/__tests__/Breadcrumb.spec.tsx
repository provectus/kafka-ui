import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { render, screen } from '@testing-library/react';

const brokersPath = '/ui/clusters/local/brokers';
const createTopicPath = '/ui/clusters/local/topics/create-new';

describe('Breadcrumb component', () => {
  const setupComponent = (pathname: string) =>
    render(
      <StaticRouter location={{ pathname }}>
        <Breadcrumb />
      </StaticRouter>
    );

  it('renders the name of brokers path', async () => {
    setupComponent(brokersPath);
    expect(screen.findByText('Brokers')).toBeTruthy();
  });
  it('renders the list of links', () => {
    setupComponent(createTopicPath);
    expect(screen.findByText('Topic')).toBeTruthy();
    expect(screen.findByText('Create New')).toBeTruthy();
  });
});

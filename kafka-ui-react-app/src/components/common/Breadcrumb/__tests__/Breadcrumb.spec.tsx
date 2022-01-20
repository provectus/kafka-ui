import React from 'react';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

const brokersPath = '/ui/clusters/local/brokers';
const createTopicPath = '/ui/clusters/local/topics/create-new';

describe('Breadcrumb component', () => {
  const setupComponent = (pathname: string) =>
    render(<Breadcrumb />, { pathname });

  it('renders the name of brokers path', () => {
    setupComponent(brokersPath);
    expect(screen.queryByText('Brokers')).not.toBeInTheDocument();
  });
  it('renders the list of links', () => {
    setupComponent(createTopicPath);
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });
});

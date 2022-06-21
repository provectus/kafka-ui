import React from 'react';
import List from 'components/KsqlDb/List/List';
import { render } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/dom';

const renderComponent = () => {
  render(<List />);
};

describe('KsqlDb List', () => {
  afterEach(() => fetchMock.reset());
  it('renders List component with Tables and Streams tabs', async () => {
    renderComponent();

    const Tables = screen.getByTitle('Tables');
    const Streams = screen.getByTitle('Streams');

    expect(Tables).toBeInTheDocument();
    expect(Streams).toBeInTheDocument();
  });
});

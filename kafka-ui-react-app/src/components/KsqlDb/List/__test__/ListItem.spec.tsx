import React from 'react';
import { clusterKsqlDbPath } from 'lib/paths';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import ListItem from 'components/KsqlDb/List/ListItem';

const clusterName = 'local';

const renderComponent = ({
  accessors,
  data,
}: {
  accessors: string[];
  data: Record<string, string>;
}) => {
  render(
    <WithRoute path={clusterKsqlDbPath()}>
      <ListItem accessors={accessors} data={data} />
    </WithRoute>,
    { initialEntries: [clusterKsqlDbPath(clusterName)] }
  );
};

describe('KsqlDb List Item', () => {
  it('renders placeholder on one data', async () => {
    renderComponent({
      accessors: ['accessors'],
      data: { accessors: 'accessors text' },
    });

    expect(screen.getByText('accessors text')).toBeInTheDocument();
  });
});

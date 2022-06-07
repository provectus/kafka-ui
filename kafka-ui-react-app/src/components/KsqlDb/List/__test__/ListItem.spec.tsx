import React from 'react';
import { clusterKsqlDbPath } from 'lib/paths';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import ListItem from 'components/KsqlDb/List/ListItem';
import { KsqlDescription } from 'redux/interfaces/ksqlDb';

const clusterName = 'local';

const renderComponent = ({
  accessors,
  data,
}: {
  accessors: (keyof KsqlDescription)[];
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
      accessors: ['accessors' as keyof KsqlDescription],
      data: { accessors: 'accessors text' },
    });

    expect(screen.getByText('accessors text')).toBeInTheDocument();
  });
});

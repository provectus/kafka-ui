import React from 'react';
import KsqlDb from 'components/KsqlDb/KsqlDb';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import {
  clusterKsqlDbPath,
  clusterKsqlDbQueryPath,
  getNonExactPath,
} from 'lib/paths';

const KSqLComponentText = {
  list: 'list',
  query: 'query',
};

jest.mock('components/KsqlDb/List/List', () => () => (
  <div>{KSqLComponentText.list}</div>
));
jest.mock('components/KsqlDb/Query/Query', () => () => (
  <div>{KSqLComponentText.query}</div>
));

describe('KsqlDb Component', () => {
  const clusterName = 'clusterName';
  const renderComponent = (path: string) =>
    render(
      <WithRoute path={getNonExactPath(clusterKsqlDbPath())}>
        <KsqlDb />
      </WithRoute>,
      { initialEntries: [path] }
    );

  it('Renders the List', () => {
    renderComponent(clusterKsqlDbPath(clusterName));
    expect(screen.getByText(KSqLComponentText.list)).toBeInTheDocument();
  });

  it('Renders the List', () => {
    renderComponent(clusterKsqlDbQueryPath(clusterName));
    expect(screen.getByText(KSqLComponentText.query)).toBeInTheDocument();
  });
});

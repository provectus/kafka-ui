import React from 'react';
import Schemas from 'components/Schemas/Schemas';
import { render } from 'lib/testHelpers';
import {
  clusterPath,
  clusterSchemaEditPath,
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemasPath,
} from 'lib/paths';
import { screen, waitFor } from '@testing-library/dom';
import { Route } from 'react-router-dom';
import fetchMock from 'fetch-mock';
import { schemaVersion } from 'redux/reducers/schemas/__test__/fixtures';

const renderComponent = (pathname: string) =>
  render(
    <Route path={clusterPath(':clusterName')}>
      <Schemas />
    </Route>,
    { pathname }
  );

const clusterName = 'secondLocal';

jest.mock('components/Schemas/List/List', () => () => <div>List</div>);
jest.mock('components/Schemas/Details/Details', () => () => <div>Details</div>);
jest.mock('components/Schemas/New/New', () => () => <div>New</div>);
jest.mock('components/Schemas/Edit/Edit', () => () => <div>Edit</div>);

describe('Schemas', () => {
  beforeEach(() => {
    fetchMock.getOnce(`/api/clusters/${clusterName}/schemas`, [schemaVersion]);
  });
  afterEach(() => fetchMock.restore());
  it('renders List', async () => {
    renderComponent(clusterSchemasPath(clusterName));
    await waitFor(() => expect(screen.queryByText('List')).toBeInTheDocument());
  });
  it('renders New', async () => {
    renderComponent(clusterSchemaNewPath(clusterName));
    await waitFor(() => expect(screen.queryByText('New')).toBeInTheDocument());
  });
  it('renders Details', async () => {
    renderComponent(clusterSchemaPath(clusterName, schemaVersion.subject));
    await waitFor(() =>
      expect(screen.queryByText('Details')).toBeInTheDocument()
    );
  });
  it('renders Edit', async () => {
    renderComponent(clusterSchemaEditPath(clusterName, schemaVersion.subject));
    await waitFor(() => expect(screen.queryByText('Edit')).toBeInTheDocument());
  });
});

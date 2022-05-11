import React from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import GlobalSchemaSelector from 'components/Schemas/List/GlobalSchemaSelector/GlobalSchemaSelector';
import userEvent from '@testing-library/user-event';
import { clusterSchemasPath } from 'lib/paths';
import { Route } from 'react-router-dom';
import fetchMock from 'fetch-mock';

const clusterName = 'testClusterName';

const selectForwardOption = () => {
  const dropdownElement = screen.getByRole('listbox');
  // clicks to open dropdown
  userEvent.click(within(dropdownElement).getByRole('option'));
  userEvent.click(
    screen.getByText(CompatibilityLevelCompatibilityEnum.FORWARD)
  );
};

const expectOptionIsSelected = (option: string) => {
  const dropdownElement = screen.getByRole('listbox');
  const selectedOption = within(dropdownElement).getAllByRole('option');
  expect(selectedOption.length).toEqual(1);
  expect(selectedOption[0]).toHaveTextContent(option);
};

describe('GlobalSchemaSelector', () => {
  const renderComponent = () =>
    render(
      <Route path={clusterSchemasPath(':clusterName')}>
        <GlobalSchemaSelector />
      </Route>,
      {
        pathname: clusterSchemasPath(clusterName),
      }
    );

  beforeEach(async () => {
    const fetchGlobalCompatibilityLevelMock = fetchMock.getOnce(
      `api/clusters/${clusterName}/schemas/compatibility`,
      { compatibility: CompatibilityLevelCompatibilityEnum.FULL }
    );
    await act(() => {
      renderComponent();
    });
    await waitFor(() =>
      expect(fetchGlobalCompatibilityLevelMock.called()).toBeTruthy()
    );
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('renders with initial prop', () => {
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FULL);
  });

  it('shows popup when select value is changed', async () => {
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FULL);
    selectForwardOption();
    expect(screen.getByText('Confirm the action')).toBeInTheDocument();
  });

  it('resets select value when cancel is clicked', () => {
    selectForwardOption();
    userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument();
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FULL);
  });

  it('sets new schema when confirm is clicked', async () => {
    selectForwardOption();
    const putNewCompatibilityMock = fetchMock.putOnce(
      `api/clusters/${clusterName}/schemas/compatibility`,
      200,
      {
        body: {
          compatibility: CompatibilityLevelCompatibilityEnum.FORWARD,
        },
      }
    );
    const getSchemasMock = fetchMock.getOnce(
      `api/clusters/${clusterName}/schemas`,
      200
    );
    await waitFor(() => {
      userEvent.click(screen.getByText('Submit'));
    });
    await waitFor(() => expect(putNewCompatibilityMock.called()).toBeTruthy());
    await waitFor(() => expect(getSchemasMock.called()).toBeTruthy());

    await waitFor(() =>
      expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument()
    );
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FORWARD);
  });
});

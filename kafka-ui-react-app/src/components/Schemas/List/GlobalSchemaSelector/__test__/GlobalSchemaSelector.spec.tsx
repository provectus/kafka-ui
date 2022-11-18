import React from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import GlobalSchemaSelector from 'components/Schemas/List/GlobalSchemaSelector/GlobalSchemaSelector';
import userEvent from '@testing-library/user-event';
import { clusterSchemasPath } from 'lib/paths';
import fetchMock from 'fetch-mock';

const clusterName = 'testClusterName';

const selectForwardOption = async () => {
  const dropdownElement = screen.getByRole('listbox');
  // clicks to open dropdown
  await userEvent.click(within(dropdownElement).getByRole('option'));
  await userEvent.click(
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
      <WithRoute path={clusterSchemasPath()}>
        <GlobalSchemaSelector />
      </WithRoute>,
      {
        initialEntries: [clusterSchemasPath(clusterName)],
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
    await selectForwardOption();
    expect(screen.getByText('Confirm the action')).toBeInTheDocument();
  });

  it('resets select value when cancel is clicked', async () => {
    await selectForwardOption();
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument();
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FULL);
  });

  it('sets new schema when confirm is clicked', async () => {
    await selectForwardOption();
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
      `api/clusters/${clusterName}/schemas?page=1&perPage=25`,
      200
    );
    await waitFor(() => {
      userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    });
    await waitFor(() => expect(putNewCompatibilityMock.called()).toBeTruthy());
    await waitFor(() => expect(getSchemasMock.called()).toBeTruthy());

    await waitFor(() =>
      expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument()
    );

    await waitFor(() =>
      expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FORWARD)
    );
  });
});

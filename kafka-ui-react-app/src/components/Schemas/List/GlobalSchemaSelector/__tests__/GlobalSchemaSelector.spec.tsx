import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import GlobalSchemaSelector from 'components/Schemas/List/GlobalSchemaSelector/GlobalSchemaSelector';
import userEvent from '@testing-library/user-event';
import { StaticRouter } from 'react-router-dom';
import fetchMock from 'fetch-mock';

const expectOptionIsSelected = (option: string) =>
  expect((screen.getByText(option) as HTMLOptionElement).selected).toBeTruthy();

describe('GlobalSchemaSelector', () => {
  afterEach(() => fetchMock.reset());

  const pathname = `/ui/clusters/clusterName/schemas`;
  const mockedFn = jest.fn();

  const setupComponent = (
    globalSchemaCompatibilityLevel?: CompatibilityLevelCompatibilityEnum
  ) =>
    render(
      <StaticRouter location={{ pathname }} context={{}}>
        <GlobalSchemaSelector
          globalSchemaCompatibilityLevel={globalSchemaCompatibilityLevel}
          updateGlobalSchemaCompatibilityLevel={mockedFn}
        />
      </StaticRouter>
    );
  it('renders with selected prop', () => {
    setupComponent(CompatibilityLevelCompatibilityEnum.FULL);
    expectOptionIsSelected('FULL');
  });

  it('shows popup when select value is changed', () => {
    setupComponent();
    expectOptionIsSelected('BACKWARD');
    userEvent.selectOptions(screen.getByRole('listbox'), 'FORWARD');
    expectOptionIsSelected('FORWARD');
    expect(screen.getByText('Confirm the action')).toBeInTheDocument();
  });

  it('resets select value when cancel is clicked', () => {
    setupComponent(CompatibilityLevelCompatibilityEnum.FULL);

    userEvent.selectOptions(screen.getByRole('listbox'), 'FORWARD');
    userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument();
    expectOptionIsSelected('FULL');
  });

  it('sets new schema when confirm is clicked', async () => {
    const compatibilityLevelChangeMock = fetchMock.putOnce(
      `api/clusters/local/schemas/compatibility`,
      200,
      {
        body: {
          compatibility: 'FORWARD',
        },
      }
    );
    setupComponent(CompatibilityLevelCompatibilityEnum.FULL);
    userEvent.selectOptions(screen.getByRole('listbox'), 'FORWARD');

    await waitFor(() => {
      userEvent.click(screen.getByText('Submit'));
    });
    // await waitFor(() =>
    //   expect(compatibilityLevelChangeMock.called()).toBeTruthy()
    // );
    expectOptionIsSelected('FORWARD');
    expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument();
  });
});

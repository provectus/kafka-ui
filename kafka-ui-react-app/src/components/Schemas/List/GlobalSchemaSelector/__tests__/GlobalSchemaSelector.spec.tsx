import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { CompatibilityLevelCompatibilityEnum } from 'generated-sources';
import GlobalSchemaSelector from 'components/Schemas/List/GlobalSchemaSelector/GlobalSchemaSelector';
import userEvent from '@testing-library/user-event';
import { StaticRouter } from 'react-router-dom';

const selectForwardOption = () =>
  userEvent.selectOptions(
    screen.getByRole('listbox'),
    CompatibilityLevelCompatibilityEnum.FORWARD
  );

const expectOptionIsSelected = (option: string) =>
  expect((screen.getByText(option) as HTMLOptionElement).selected).toBeTruthy();

describe('GlobalSchemaSelector', () => {
  const pathname = `/ui/clusters/clusterName/schemas`;
  const mockedSubmitFn = jest.fn();

  const setupComponent = (
    globalSchemaCompatibilityLevel?: CompatibilityLevelCompatibilityEnum
  ) =>
    render(
      <StaticRouter location={{ pathname }} context={{}}>
        <GlobalSchemaSelector
          globalSchemaCompatibilityLevel={globalSchemaCompatibilityLevel}
          updateGlobalSchemaCompatibilityLevel={mockedSubmitFn}
        />
      </StaticRouter>
    );
  it('renders with selected prop', () => {
    setupComponent(CompatibilityLevelCompatibilityEnum.FULL);
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FULL);
  });

  it('shows popup when select value is changed', () => {
    setupComponent();
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.BACKWARD);
    selectForwardOption();
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FORWARD);
    expect(screen.getByText('Confirm the action')).toBeInTheDocument();
  });

  it('resets select value when cancel is clicked', () => {
    setupComponent(CompatibilityLevelCompatibilityEnum.FULL);
    selectForwardOption();
    userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument();
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FULL);
  });

  it('sets new schema when confirm is clicked', async () => {
    setupComponent(CompatibilityLevelCompatibilityEnum.FULL);
    selectForwardOption();
    await waitFor(() => {
      userEvent.click(screen.getByText('Submit'));
    });
    expect(mockedSubmitFn).toBeCalledWith(
      undefined,
      CompatibilityLevelCompatibilityEnum.FORWARD
    );
    expectOptionIsSelected(CompatibilityLevelCompatibilityEnum.FORWARD);
    expect(screen.queryByText('Confirm the action')).not.toBeInTheDocument();
  });
});

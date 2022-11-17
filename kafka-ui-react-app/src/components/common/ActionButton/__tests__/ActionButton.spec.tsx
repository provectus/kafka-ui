import React from 'react';
import { render } from 'lib/testHelpers';
import ActionButton from 'components/common/ActionButton/ActionButton';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

describe('ActionButton', () => {
  const tooltipText = getDefaultActionMessage();
  const fixtures = {
    resource: UserPermissionResourceEnum.TOPIC,
    action: Action.CREATE,
  };

  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(
      <ActionButton buttonType="primary" buttonSize="M" permission={fixtures}>
        test
      </ActionButton>
    );
    // const button = screen.getByRole('button', { name: 'test' });
    // expect(button).toBeInTheDocument();
    // expect(button).toBeEnabled();
    // await userEvent.hover(button);
    // expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(
      <ActionButton buttonType="primary" buttonSize="M" permission={fixtures}>
        test
      </ActionButton>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    await userEvent.hover(button);
    expect(screen.getByText(tooltipText)).toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the given text', async () => {
    const customTooltipText = 'something here';

    render(
      <ActionButton
        buttonType="primary"
        buttonSize="M"
        permission={fixtures}
        message={customTooltipText}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.queryByText(customTooltipText)).not.toBeInTheDocument();
    await userEvent.hover(button);
    expect(screen.getByText(customTooltipText)).toBeInTheDocument();
    await userEvent.unhover(button);
    expect(screen.queryByText(customTooltipText)).not.toBeInTheDocument();
  });
});

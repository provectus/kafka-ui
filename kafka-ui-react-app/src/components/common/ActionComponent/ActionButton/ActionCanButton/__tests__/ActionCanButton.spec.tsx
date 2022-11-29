import React from 'react';
import { render } from 'lib/testHelpers';
import ActionCanButton from 'components/common/ActionComponent/ActionButton/ActionCanButton/ActionCanButton';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';

describe('ActionButton', () => {
  const tooltipText = getDefaultActionMessage();

  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(
      <ActionCanButton buttonType="primary" buttonSize="M" canDoAction>
        test
      </ActionCanButton>
    );
    const button = screen.getByRole('button', { name: 'test' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    await userEvent.hover(button);
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(
      <ActionCanButton buttonType="primary" buttonSize="M" canDoAction={false}>
        test
      </ActionCanButton>
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
      <ActionCanButton
        buttonType="primary"
        buttonSize="M"
        canDoAction={false}
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

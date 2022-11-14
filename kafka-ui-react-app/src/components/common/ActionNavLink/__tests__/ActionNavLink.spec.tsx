import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import ActionNavLink from 'components/common/ActionNavLink/ActionNavLink';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';

describe('ActionNavLink', () => {
  const tooltipText = getDefaultActionMessage();
  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(
      <ActionNavLink to="/" canDoAction>
        test
      </ActionNavLink>
    );
    const link = screen.getByRole('link', { name: 'test' });
    expect(link).toBeInTheDocument();
    await userEvent.hover(link);
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(
      <ActionNavLink to="/" canDoAction={false}>
        test
      </ActionNavLink>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled');

    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    await userEvent.hover(link);
    expect(screen.getByText(tooltipText)).toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the given text', async () => {
    const customTooltipText = 'something here';

    render(
      <ActionNavLink to="/" canDoAction={false} message={customTooltipText} />
    );
    const button = screen.getByRole('link');
    expect(button).toHaveAttribute('aria-disabled');

    expect(screen.queryByText(customTooltipText)).not.toBeInTheDocument();
    await userEvent.hover(button);
    expect(screen.getByText(customTooltipText)).toBeInTheDocument();
    await userEvent.unhover(button);
    expect(screen.queryByText(customTooltipText)).not.toBeInTheDocument();
  });
});

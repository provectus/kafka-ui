import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import ActionNavLink from 'components/common/ActionComponent/ActionNavLink/ActionNavLink';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';
import { useParams } from 'react-router-dom';
import {
  clusterName,
  validPermission,
  invalidPermission,
  tooltipIsShowing,
  userInfoRbacEnabled,
} from 'components/common/ActionComponent/__tests__/fixtures';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('ActionNavLink', () => {
  const tooltipText = getDefaultActionMessage();

  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName,
    }));
  });

  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(
      <ActionNavLink to="/" permission={validPermission}>
        test
      </ActionNavLink>,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const link = screen.getByRole('link', { name: 'test' });
    expect(link).toBeInTheDocument();
    await userEvent.hover(link);
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(
      <ActionNavLink to="/" permission={invalidPermission}>
        test
      </ActionNavLink>,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled');

    await tooltipIsShowing(link, tooltipText);
  });

  it('should make the button disable and view the tooltip with the given text', async () => {
    const customTooltipText = 'something here';

    render(
      <ActionNavLink
        to="/"
        permission={invalidPermission}
        message={customTooltipText}
      />,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const button = screen.getByRole('link');
    expect(button).toHaveAttribute('aria-disabled');

    await tooltipIsShowing(button, customTooltipText);
  });

  it('should render the Link with the correct text, but disabled cause the given role is not correct', async () => {
    render(
      <ActionNavLink to="/" permission={invalidPermission}>
        test
      </ActionNavLink>,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const button = screen.getByRole('link');
    expect(button).toHaveAttribute('aria-disabled');

    await tooltipIsShowing(button, tooltipText);
  });
});

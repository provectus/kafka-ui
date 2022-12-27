import React from 'react';
import { render } from 'lib/testHelpers';
import ActionPermissionButton from 'components/common/ActionComponent/ActionButton/ActionPermissionButton/ActionPermissionButton';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('ActionPermissionButton', () => {
  const tooltipText = getDefaultActionMessage();

  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName,
    }));
  });

  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(
      <ActionPermissionButton
        buttonType="primary"
        buttonSize="M"
        permission={validPermission}
      >
        test
      </ActionPermissionButton>,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const button = screen.getByRole('button', { name: 'test' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    await userEvent.hover(button);
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(
      <ActionPermissionButton
        buttonType="primary"
        buttonSize="M"
        permission={invalidPermission}
      >
        test
      </ActionPermissionButton>,
      { userInfo: userInfoRbacEnabled }
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await tooltipIsShowing(button, tooltipText);
  });

  it('should make the button disable and view the tooltip with the given text', async () => {
    const customTooltipText = 'something here';

    render(
      <ActionPermissionButton
        buttonType="primary"
        buttonSize="M"
        permission={invalidPermission}
        message={customTooltipText}
      />,
      { userInfo: userInfoRbacEnabled }
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await tooltipIsShowing(button, customTooltipText);
  });

  it('should render the Button but disabled cause the given role is not correct', async () => {
    render(
      <ActionPermissionButton
        buttonType="primary"
        buttonSize="M"
        permission={invalidPermission}
      />,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await tooltipIsShowing(button, tooltipText);
  });
});

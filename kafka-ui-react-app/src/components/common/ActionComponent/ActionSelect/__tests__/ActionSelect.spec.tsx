import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import ActionSelect from 'components/common/ActionComponent/ActionSelect/ActionSelect';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';
import {
  clusterName,
  validPermission,
  invalidPermission,
  tooltipIsShowing,
  userInfoRbacEnabled,
} from 'components/common/ActionComponent/__tests__/fixtures';
import { useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('ActionSelect', () => {
  const tooltipText = getDefaultActionMessage();

  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => ({
      clusterName,
    }));
  });

  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(<ActionSelect permission={validPermission} />, {
      userInfo: userInfoRbacEnabled,
    });
    const list = screen.getByRole('listbox');
    expect(list).toBeInTheDocument();
    await userEvent.hover(list);
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(<ActionSelect permission={invalidPermission} />, {
      userInfo: userInfoRbacEnabled,
    });
    const list = screen.getByRole('listbox');
    await tooltipIsShowing(list, tooltipText);
  });

  it('should make the button disable and view the tooltip with the given text', async () => {
    const customTooltipText = 'something here else';

    render(
      <ActionSelect
        permission={invalidPermission}
        message={customTooltipText}
      />,
      {
        userInfo: userInfoRbacEnabled,
      }
    );
    const list = screen.getByRole('listbox');

    await tooltipIsShowing(list, customTooltipText);
  });

  it('should render the Select, but disabled cause the given role is not correct', async () => {
    render(<ActionSelect permission={invalidPermission} />, {
      userInfo: userInfoRbacEnabled,
    });
    const list = screen.getByRole('listbox');

    await tooltipIsShowing(list, tooltipText);
  });
});

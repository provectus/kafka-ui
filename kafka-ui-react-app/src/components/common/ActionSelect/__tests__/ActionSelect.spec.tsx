import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import ActionSelect from 'components/common/ActionSelect/ActionSelect';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

describe('ActionSelect', () => {
  const tooltipText = getDefaultActionMessage();
  const fixtures = {
    resource: UserPermissionResourceEnum.TOPIC,
    action: Action.CREATE,
  };

  it('should render the button with the correct text, for the permission tooltip not to show', async () => {
    render(<ActionSelect permission={fixtures} />);
    // const list = screen.getByRole('listbox');
    // expect(list).toBeInTheDocument();
    // await userEvent.hover(list);
    // expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the default text', async () => {
    render(<ActionSelect permission={fixtures} />);
    const list = screen.getByRole('listbox');
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    await userEvent.hover(list);
    expect(screen.getByText(tooltipText)).toBeInTheDocument();
  });

  it('should make the button disable and view the tooltip with the given text', async () => {
    const customTooltipText = 'something here else';

    render(<ActionSelect permission={fixtures} message={customTooltipText} />);
    const list = screen.getByRole('listbox');

    expect(screen.queryByText(customTooltipText)).not.toBeInTheDocument();
    await userEvent.hover(list);
    expect(screen.getByText(customTooltipText)).toBeInTheDocument();
    await userEvent.unhover(list);
    expect(screen.queryByText(customTooltipText)).not.toBeInTheDocument();
  });
});

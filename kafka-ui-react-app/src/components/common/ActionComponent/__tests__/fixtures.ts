import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

export const clusterName = 'local';

export const fixtures = {
  resource: UserPermissionResourceEnum.TOPIC,
  action: Action.CREATE,
};

export const roles = [
  {
    ...fixtures,
    actions: [fixtures.action],
    clusters: [clusterName],
  },
];
export const tooltipIsShowing = async (button: HTMLElement, text: string) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
  await userEvent.hover(button);
  expect(screen.getByText(text)).toBeInTheDocument();
  await userEvent.unhover(button);
  expect(screen.queryByText(text)).not.toBeInTheDocument();
};

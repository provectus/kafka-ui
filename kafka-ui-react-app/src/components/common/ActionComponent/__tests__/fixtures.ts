import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Action, ResourceType } from 'generated-sources';

export const clusterName = 'local';

export const validPermission = {
  resource: ResourceType.TOPIC,
  action: Action.CREATE,
  value: 'topic',
};

export const invalidPermission = {
  resource: ResourceType.SCHEMA,
  action: Action.DELETE,
  value: 'test',
};

const roles = [
  {
    ...validPermission,
    actions: [validPermission.action],
    clusters: [clusterName],
  },
];

export const userInfoRbacEnabled = {
  rbacFlag: true,
  roles,
};

export const userInfoRbacDisabled = {
  rbacFlag: false,
  roles,
};

export const tooltipIsShowing = async (button: HTMLElement, text: string) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
  await userEvent.hover(button);
  expect(screen.getByText(text)).toBeInTheDocument();
  await userEvent.unhover(button);
  expect(screen.queryByText(text)).not.toBeInTheDocument();
};

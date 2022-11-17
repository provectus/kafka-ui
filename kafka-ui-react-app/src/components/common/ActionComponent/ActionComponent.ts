import { Placement } from '@floating-ui/react-dom-interactions';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

export interface ActionComponentProps {
  permission: {
    resource: UserPermissionResourceEnum;
    action: Action | Array<Action>;
    value?: string;
  };
  message?: string;
  placement?: Placement;
}

export function getDefaultActionMessage() {
  return "You don't have the permission to do this action";
}

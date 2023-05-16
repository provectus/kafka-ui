import { Placement } from '@floating-ui/react';
import { Action, ResourceType } from 'generated-sources';

export interface ActionComponentProps {
  permission: {
    resource: ResourceType;
    action: Action | Array<Action>;
    value?: string;
  };
  message?: string;
  placement?: Placement;
}

export function getDefaultActionMessage() {
  return "You don't have a required permission to perform this action";
}

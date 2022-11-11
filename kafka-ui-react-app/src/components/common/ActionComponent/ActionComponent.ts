import { Placement } from '@floating-ui/react-dom-interactions';

export interface ActionComponentProps {
  canDoAction: boolean;
  message?: string;
  placement?: Placement;
}

export function getDefaultActionMessage() {
  return "You don't have the permission to do this action";
}

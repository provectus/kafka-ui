import React from 'react';
import Tippy from '@tippyjs/react';

import { MessageTooltip } from './TooltipComponent.styled';

export interface PropsTypes {
  value: string;
  messageTooltip: string;
}
const TooltipComponent: React.FC<PropsTypes> = ({ value, messageTooltip }) => {
  return (
    <Tippy content={<MessageTooltip>{messageTooltip}</MessageTooltip>}>
      <span>{value}</span>
    </Tippy>
  );
};
export default TooltipComponent;

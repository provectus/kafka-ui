import React from 'react';
import ReactTooltip from 'react-tooltip';

export interface PropsTypes {
  value: string;
  messageTooltip: string;
}
const TooltipComponent: React.FC<PropsTypes> = ({ value, messageTooltip }) => {
  return (
    <div>
      <span data-tip={messageTooltip}>{value}</span>
      <ReactTooltip />
    </div>
  );
};
export default TooltipComponent;

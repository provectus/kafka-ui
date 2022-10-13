import React from 'react';
import ReactTooltip from 'react-tooltip';
import { TooltipProps } from 'generated-sources/models/Tooltip';

const Tooltip: React.FC<TooltipProps> = ({ value, messageTooltip }) => {
  return (
    <div>
      <span data-tip={messageTooltip}>{value}</span>
      <ReactTooltip />
    </div>
  );
};
export default Tooltip;

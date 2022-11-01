import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useInteractions,
  Placement,
} from '@floating-ui/react-dom-interactions';
import Tippy from '@tippyjs/react';

import * as S from './Tooltip.styled';

export interface PropsTypes {
  value: string | JSX.Element;
  messageTooltip: string;
  placement?: Placement;
}

export const Tooltip: React.FC<PropsTypes> = ({ value, messageTooltip }) => {
  return (
    <Tippy
      maxWidth="100%"
      content={<S.MessageTooltip>{messageTooltip}</S.MessageTooltip>}
    >
      <span>{value}</span>
    </Tippy>
  );
};

export const Tooltip2: React.FC<PropsTypes> = ({
  value,
  messageTooltip,
  placement,
}) => {
  const [open, setOpen] = useState(false);
  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
  });

  useInteractions([useHover(context)]);

  return (
    <>
      <span ref={reference}>{value}</span>
      {open && (
        <S.MessageTooltip
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
        >
          {messageTooltip}
        </S.MessageTooltip>
      )}
    </>
  );
};

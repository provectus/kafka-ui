import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useInteractions,
  Placement,
} from '@floating-ui/react';

import * as S from './Tooltip.styled';

interface TooltipProps {
  value: React.ReactNode;
  content: string;
  placement?: Placement;
}

const Tooltip: React.FC<TooltipProps> = ({ value, content, placement }) => {
  const [open, setOpen] = useState(false);
  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        <S.Wrapper>{value}</S.Wrapper>
      </div>
      {open && (
        <S.MessageTooltip
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
          {...getFloatingProps()}
        >
          {content}
        </S.MessageTooltip>
      )}
    </>
  );
};

export default Tooltip;

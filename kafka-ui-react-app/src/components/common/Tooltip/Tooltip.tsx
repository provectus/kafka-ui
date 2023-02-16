import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useInteractions,
  Placement,
} from '@floating-ui/react-dom-interactions';

import * as S from './Tooltip.styled';

export interface PropsTypes {
  value: string | JSX.Element;
  content: string;
  placement?: Placement;
}

const Tooltip: React.FC<PropsTypes> = ({ value, content, placement }) => {
  const [open, setOpen] = useState(false);
  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
  });

  // useInteractions([useHover(context)]);
  const hover = useHover(context, { move: false });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
  return (
    <>
      <div ref={reference} {...getReferenceProps()}>
        <S.Wrapper>{value}</S.Wrapper>
      </div>
      <S.MessageTooltip
        ref={floating}
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
    </>
  );
};

export default Tooltip;

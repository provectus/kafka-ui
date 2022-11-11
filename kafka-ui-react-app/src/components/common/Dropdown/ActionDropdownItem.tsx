import React, { useState } from 'react';
import {
  Placement,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react-dom-interactions';
import * as S from 'components/common/ActionComponent/ActionComponent.styled';
import {
  ActionComponentProps,
  getDefaultActionMessage,
} from 'components/common/ActionComponent/ActionComponent';

import { DropdownItemProps } from './DropdownItem';

import { DropdownItem } from './index';

interface Props extends ActionComponentProps, DropdownItemProps {
  canDoAction: boolean;
  message?: string;
  placement?: Placement;
}

const ActionDropdownItem: React.FC<Props> = ({
  canDoAction,
  message = getDefaultActionMessage(),
  placement = 'left',
  children,
  disabled,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const isDisabled = !canDoAction;

  const setTooltipOpen = (state: boolean) => {
    if (!isDisabled) return;
    setOpen(state);
  };

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setTooltipOpen,
    placement,
  });

  useInteractions([useHover(context)]);

  return (
    <>
      <DropdownItem {...props} disabled={disabled || isDisabled}>
        <S.Wrapper ref={reference}>{children}</S.Wrapper>
      </DropdownItem>
      {open && (
        <S.MessageTooltip
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: '100%',
          }}
        >
          {message}
        </S.MessageTooltip>
      )}
    </>
  );
};

export default ActionDropdownItem;

import React, { useState } from 'react';
import { Button, Props as ButtonProps } from 'components/common/Button/Button';
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

interface Props extends ActionComponentProps, ButtonProps {
  canDoAction: boolean;
  message?: string;
  placement?: Placement;
}

const ActionButton: React.FC<Props> = ({
  canDoAction,
  placement = 'bottom-end',
  message = getDefaultActionMessage(),
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
    <S.Wrapper ref={reference}>
      <Button {...props} disabled={disabled || isDisabled} />
      {open && (
        <S.MessageTooltipLimited
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
        >
          {message}
        </S.MessageTooltipLimited>
      )}
    </S.Wrapper>
  );
};

export default ActionButton;

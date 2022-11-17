import React from 'react';
import { Button, Props as ButtonProps } from 'components/common/Button/Button';
import * as S from 'components/common/ActionComponent/ActionComponent.styled';
import {
  ActionComponentProps,
  getDefaultActionMessage,
} from 'components/common/ActionComponent/ActionComponent';
import { useActionTooltip } from 'lib/hooks/useActionTooltip';
import { usePermission } from 'lib/hooks/usePermission';

interface Props extends ActionComponentProps, ButtonProps {}

const ActionButton: React.FC<Props> = ({
  permission,
  placement = 'bottom-end',
  message = getDefaultActionMessage(),
  disabled,
  ...props
}) => {
  const canDoAction = usePermission(
    permission.resource,
    permission.action,
    permission.value
  );

  const isDisabled = !canDoAction;

  const { x, y, reference, floating, strategy, open } = useActionTooltip(
    isDisabled,
    placement
  );

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

import React from 'react';
import Select, { SelectProps } from 'components/common/Select/Select';
import {
  ActionComponentProps,
  getDefaultActionMessage,
} from 'components/common/ActionComponent/ActionComponent';
import { useActionTooltip } from 'lib/hooks/useActionTooltip';
import { usePermission } from 'lib/hooks/usePermission';
import * as S from 'components/common/ActionComponent/ActionComponent.styled';

interface Props extends SelectProps, ActionComponentProps {}

const ActionSelect: React.FC<Props> = ({
  message = getDefaultActionMessage(),
  permission,
  placement = 'bottom',
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
    <>
      <div ref={reference}>
        <Select {...props} disabled={disabled || isDisabled} />
      </div>
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
    </>
  );
};

export default ActionSelect;

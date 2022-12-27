import React from 'react';
import * as S from 'components/common/ActionComponent/ActionComponent.styled';
import {
  ActionComponentProps,
  getDefaultActionMessage,
} from 'components/common/ActionComponent/ActionComponent';
import { useActionTooltip } from 'lib/hooks/useActionTooltip';
import { usePermission } from 'lib/hooks/usePermission';
import { DropdownItemProps } from 'components/common/Dropdown/DropdownItem';
import { DropdownItem } from 'components/common/Dropdown';

interface Props extends ActionComponentProps, DropdownItemProps {}

const ActionDropdownItem: React.FC<Props> = ({
  permission,
  message = getDefaultActionMessage(),
  placement = 'left',
  children,
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
      <DropdownItem
        {...props}
        disabled={disabled || isDisabled}
        ref={reference}
      >
        {children}
      </DropdownItem>
      {open && (
        <S.MessageTooltip
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
        >
          {message}
        </S.MessageTooltip>
      )}
    </>
  );
};

export default ActionDropdownItem;

import React from 'react';
import { Placement } from '@floating-ui/react-dom-interactions';
import * as S from 'components/common/ActionComponent/ActionComponent.styled';
import {
  ActionComponentProps,
  getDefaultActionMessage,
} from 'components/common/ActionComponent/ActionComponent';
import { useActionTooltip } from 'lib/hooks/useActionTooltip';

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

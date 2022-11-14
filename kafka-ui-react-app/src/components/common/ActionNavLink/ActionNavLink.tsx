import React, { useState } from 'react';
import {
  ActionComponentProps,
  getDefaultActionMessage,
} from 'components/common/ActionComponent/ActionComponent';
import { NavLink, NavLinkProps } from 'react-router-dom';
import {
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react-dom-interactions';
import * as S from 'components/common/ActionComponent/ActionComponent.styled';

interface Props extends ActionComponentProps, NavLinkProps {}

const ActionNavLink: React.FC<Props> = ({
  message = getDefaultActionMessage(),
  placement,
  children,
  canDoAction,
  className,
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
      <NavLink
        {...props}
        ref={reference}
        className={isDisabled ? 'is-disabled' : className}
        aria-disabled={isDisabled}
        onClick={(event) => (isDisabled ? event.preventDefault() : null)}
      >
        {children}
      </NavLink>
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

export default ActionNavLink;

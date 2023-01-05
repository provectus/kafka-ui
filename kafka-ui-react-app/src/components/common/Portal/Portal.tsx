import React, { ReactElement } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  conditional?: boolean;
  target?: HTMLElement;
}

const Portal: React.FC<React.PropsWithChildren<PortalProps>> = ({
  children,
  conditional = true,
  target,
}) => {
  if (!conditional) {
    return children as ReactElement;
  }
  const node = target ?? document.body;

  return createPortal(children, node);
};

export default Portal;

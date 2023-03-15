import { useState } from 'react';
import {
  autoPlacement,
  offset,
  Placement,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';

export function useActionTooltip(isDisabled?: boolean, placement?: Placement) {
  const [open, setOpen] = useState(false);

  const setTooltipOpen = (state: boolean) => {
    if (!isDisabled) return;
    setOpen(state);
  };

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setTooltipOpen,
    placement,
    middleware: [offset(10), autoPlacement()],
  });

  useInteractions([useHover(context)]);

  return {
    x,
    y,
    reference,
    floating,
    strategy,
    open,
  };
}

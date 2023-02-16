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
  placement?: Placement;
}

const Tooltip: React.FC<PropsTypes> = ({ value, placement }) => {
  const [open, setOpen] = useState(false);
  const { reference, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
  });

  useInteractions([useHover(context)]);
  return (
    <>
      <div ref={reference}>
        <S.Wrapper>{value}</S.Wrapper>
      </div>
      <S.MessageTooltip>
        `DYNAMIC_TOPIC_CONFIG = dynamic topic config that is configured for a
        specific topic DYNAMIC_BROKER_LOGGER_CONFIG = dynamic broker logger
        config that is configured for a specific broker DYNAMIC_BROKER_CONFIG =
        dynamic broker config that is configured for a specific broker
        DYNAMIC_DEFAULT_BROKER_CONFIG = dynamic broker config that is configured
        as default for all brokers in the cluster STATIC_BROKER_CONFIG = static
        broker config provided as broker properties at start up (e.g.
        server.properties file) DEFAULT_CONFIG = built-in default configuration
        for configs that have a default value UNKNOWN = source unknown e.g. in
        the ConfigEntry used for alter requests where source is not set`;
      </S.MessageTooltip>
    </>
  );
};

export default Tooltip;

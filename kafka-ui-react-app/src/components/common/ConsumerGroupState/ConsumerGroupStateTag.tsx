import { ConsumerGroupState } from 'generated-sources';
import React from 'react';

interface Props {
  state?: ConsumerGroupState;
}

const ConsumerGroupStateTag: React.FC<Props> = ({ state }) => {
  let classes: string;
  switch (state) {
    case ConsumerGroupState.DEAD:
      classes = 'is-danger';
      break;
    case ConsumerGroupState.EMPTY:
      classes = 'is-info';
      break;
    case ConsumerGroupState.PREPARING_REBALANCE:
      classes = 'is-warning';
      break;
    case ConsumerGroupState.COMPLETING_REBALANCE:
      classes = 'is-success';
      break;
    case ConsumerGroupState.STABLE:
      classes = 'is-primary';
      break;
    case ConsumerGroupState.UNKNOWN:
      classes = 'is-light';
      break;
    default:
      classes = 'is-danger';
  }

  if (!state) {
    return <span className="is-tag is-light">Unknown</span>;
  }

  return <span className={`tag ${classes}`}>{state}</span>;
};

export default ConsumerGroupStateTag;

import { ServerStatus } from 'generated-sources';
import React, { CSSProperties } from 'react';

interface Props {
  status: ServerStatus;
}

const ClusterStatusIcon: React.FC<Props> = ({ status }) => {
  const style: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    marginLeft: '7px',
    padding: 0,
  };

  return (
    <span
      className={`tag ${
        status === ServerStatus.ONLINE ? 'is-primary' : 'is-danger'
      }`}
      title={status}
      style={style}
    />
  );
};

export default ClusterStatusIcon;

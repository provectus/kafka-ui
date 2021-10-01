import { ServerStatus } from 'generated-sources';
import React from 'react';
import { Colors } from 'theme/theme';

interface Props {
  status: ServerStatus;
}

const ClusterStatusIcon: React.FC<Props> = ({ status }) => {
  return (
    <svg
      width="4"
      height="4"
      viewBox="0 0 4 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="2"
        cy="2"
        r="2"
        fill={
          status === ServerStatus.ONLINE ? Colors.green[40] : Colors.red[50]
        }
      />
    </svg>
  );
};

export default ClusterStatusIcon;

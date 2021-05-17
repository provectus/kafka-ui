import cx from 'classnames';
import { ConnectorTaskStatus } from 'generated-sources';
import React from 'react';

export interface StatusTagProps {
  status: ConnectorTaskStatus;
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const classNames = cx('tag', {
    'is-success': status === ConnectorTaskStatus.RUNNING,
    'is-light': status === ConnectorTaskStatus.PAUSED,
    'is-warning': status === ConnectorTaskStatus.UNASSIGNED,
    'is-danger': status === ConnectorTaskStatus.FAILED,
  });

  return <span className={classNames}>{status}</span>;
};

export default StatusTag;

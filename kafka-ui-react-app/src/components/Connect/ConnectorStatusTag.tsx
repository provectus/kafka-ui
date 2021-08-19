import cx from 'classnames';
import { ConnectorState } from 'generated-sources';
import React from 'react';

export interface StatusTagProps {
  status: ConnectorState;
}

const ConnectorStatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const classNames = cx('tag', {
    'is-success': status === ConnectorState.RUNNING,
    'is-light': status === ConnectorState.PAUSED,
    'is-warning': status === ConnectorState.UNASSIGNED,
    'is-danger':
      status === ConnectorState.FAILED || status === ConnectorState.TASK_FAILED,
  });

  return <span className={classNames}>{status}</span>;
};

export default ConnectorStatusTag;

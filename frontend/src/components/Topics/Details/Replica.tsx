import React from 'react';
import { TopicReplica } from 'types';
import cx from 'classnames';

interface Props extends TopicReplica {
  index: number;
}

const Replica: React.FC<Props> = ({
  in_sync,
  leader,
  broker,
  index,
}) => {
  return (
    <div className="column is-narrow">
      <div className={cx('notification', leader ? 'is-warning' : 'is-light')}>
        <div className="title is-6">Replica #{index}</div>
        <div className="tags">
          {leader && (
            <span className="tag">
              LEADER
            </span>
          )}
          <span className={cx('tag', in_sync ? 'is-success' : 'is-danger')}>
            {in_sync ? 'IN SYNC' : 'OUT OF SYNC'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Replica;

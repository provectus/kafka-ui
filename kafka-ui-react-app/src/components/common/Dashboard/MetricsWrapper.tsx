import React from 'react';
import cx from 'classnames';

interface Props {
  title?: string;
  wrapperClassName?: string;
  levelClassName?: string;
}

const MetricsWrapper: React.FC<Props> = ({
  title,
  children,
  wrapperClassName,
  levelClassName,
}) => {
  return (
    <div className={cx('box', wrapperClassName)}>
      {title && <h5 className="subtitle is-6">{title}</h5>}
      <div className={cx('level', levelClassName)}>{children}</div>
    </div>
  );
};

export default MetricsWrapper;

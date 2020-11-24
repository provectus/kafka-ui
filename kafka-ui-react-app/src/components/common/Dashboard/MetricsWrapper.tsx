import React from 'react';
import cx from 'classnames';

interface Props {
  title?: string;
  wrapperClassName?: string;
}

const MetricsWrapper: React.FC<Props> = ({
  title,
  children,
  wrapperClassName,
}) => {
  return (
    <div className={cx('box', wrapperClassName)}>
      {title && <h5 className="subtitle is-6">{title}</h5>}
      <div className="level">{children}</div>
    </div>
  );
};

export default MetricsWrapper;

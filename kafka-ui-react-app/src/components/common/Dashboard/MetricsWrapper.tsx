import React from 'react';
import cx from 'classnames';

interface Props {
  title?: string;
  wrapperClassName?: string;
  multiline?: boolean;
}

const MetricsWrapper: React.FC<Props> = ({
  title,
  children,
  wrapperClassName,
  multiline,
}) => {
  return (
    <div className={wrapperClassName}>
      {title && <h5 className="is-7 has-text-weight-medium mb-2">{title}</h5>}
      <div className="box">
        <div className={cx('level', multiline ? 'level-multiline' : '')}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MetricsWrapper;

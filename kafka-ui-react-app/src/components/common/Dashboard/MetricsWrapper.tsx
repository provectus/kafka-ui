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
    <div className={cx('box', wrapperClassName)}>
      {title && (
        <h5 data-testid="metrics-wrapper-title" className="subtitle is-6">
          {title}
        </h5>
      )}
      <div
        data-testid="metrics-wrapper-children"
        className={cx('level', multiline ? 'level-multiline' : '')}
      >
        {children}
      </div>
    </div>
  );
};

export default MetricsWrapper;

import React from 'react';
import cx from 'classnames';

interface Props {
  fetching?: boolean;
  label: React.ReactNode;
  title?: string;
  className?: string;
}

const Indicator: React.FC<Props> = ({
  label,
  title,
  fetching,
  className,
  children,
}) => {
  return (
    <div className={cx('level-item', className)}>
      <div title={title}>
        <p className="is-size-8">{label}</p>
        <p className="is-size-6 has-text-weight-medium">
          {fetching ? (
            <span className="icon has-text-grey-light">
              <i className="fas fa-spinner fa-pulse" />
            </span>
          ) : (
            children
          )}
        </p>
      </div>
    </div>
  );
};

export default Indicator;

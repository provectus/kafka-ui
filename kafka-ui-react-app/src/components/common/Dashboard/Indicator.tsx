import React from 'react';
import cx from 'classnames';

interface Props {
  fetching?: boolean;
  label: string;
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
      <div title={title || label}>
        <p className="heading">{label}</p>
        <p className="title has-text-centered">
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

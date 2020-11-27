import React from 'react';
import cx from 'classnames';

interface Props {
  label: string;
  title?: string;
  className?: string;
}

const Indicator: React.FC<Props> = ({ label, title, className, children }) => {
  return (
    <div className={cx('level-item', 'level-left', className)}>
      <div title={title || label}>
        <p className="heading">{label}</p>
        <p className="title">{children}</p>
      </div>
    </div>
  );
};

export default Indicator;

import React from 'react';

interface Props {
  title: string;
}

const MetricsWrapper: React.FC<Props> = ({
  title,
  children,
}) => {
  return (
    <div className="box">
      <h5 className="subtitle is-6">
        {title}
      </h5>
      <div className="level">
        {children}
      </div>
    </div>
  );
}

export default MetricsWrapper;

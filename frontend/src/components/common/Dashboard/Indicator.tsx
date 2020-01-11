import React from 'react';

interface Props {
  label: string;
  title?: string;
}

const Indicator: React.FC<Props> = ({
  label,
  title,
  children,
}) => {
  return (
    <div className="level-item level-left">
      <div title={title ? title : label}>
        <p className="heading">{label}</p>
        <p className="title">{children}</p>
      </div>
    </div>
  );
}

export default Indicator;

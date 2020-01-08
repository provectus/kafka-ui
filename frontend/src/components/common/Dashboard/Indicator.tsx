import React from 'react';

interface Props {
  title: string;
}

const Indicator: React.FC<Props> = ({
  title,
  children,
}) => {
  return (
    <div className="level-item level-left">
      <div>
        <p className="heading">{title}</p>
        <p className="title">{children}</p>
      </div>
    </div>
  );
}

export default Indicator;

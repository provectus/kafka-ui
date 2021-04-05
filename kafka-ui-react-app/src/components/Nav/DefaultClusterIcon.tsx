import React, { CSSProperties } from 'react';

const DefaultClusterIcon: React.FC = () => {
  const style: CSSProperties = {
    width: '.6rem',
    left: '-8px',
    top: '-4px',
    position: 'relative',
  };

  return (
    <span title="Default Cluster" className="icon has-text-primary is-small">
      <i
        style={style}
        data-fa-transform="rotate-340"
        className="fas fa-thumbtack"
      />
    </span>
  );
};

export default DefaultClusterIcon;

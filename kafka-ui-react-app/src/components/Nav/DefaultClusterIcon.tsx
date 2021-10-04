import React, { CSSProperties } from 'react';
import { Colors } from 'theme/theme';

const DefaultClusterIcon: React.FC = () => {
  const style: CSSProperties = {
    width: '.6rem',
    position: 'relative',
    color: Colors.brand[20],
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

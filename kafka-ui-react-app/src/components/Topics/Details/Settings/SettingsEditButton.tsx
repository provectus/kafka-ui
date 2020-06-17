import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  to: string;
}

const SettingsEditButton: React.FC<Props> = ({ to }) => (
  <Link to={to}>
    <button type="button" className="button is-small is-warning">
      Edit settings
    </button>
  </Link>
);

export default SettingsEditButton;

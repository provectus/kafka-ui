import React from 'react';
import { NavLink } from 'react-router-dom';

interface Link {
  label: string;
  href: string;
}

interface Props {
  links?: Link[];
}

const Breadcrumb: React.FC<Props> = ({ links, children }) => {
  return (
    <nav className="breadcrumb" aria-label="breadcrumbs">
      <ul>
        {links &&
          links.map(({ label, href }) => (
            <li key={href}>
              <NavLink to={href}>{label}</NavLink>
            </li>
          ))}

        <li className="is-active">
          <span className="">{children}</span>
        </li>
      </ul>
    </nav>
  );
};

export default Breadcrumb;

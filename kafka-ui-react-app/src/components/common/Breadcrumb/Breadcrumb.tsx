import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface Props {
  links?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<Props> = ({ links, children }) => {
  return (
    <nav className="breadcrumb" aria-label="breadcrumbs">
      <ul>
        {links &&
          links.map(({ label, href }) => (
            <li key={href}>
              <Link to={href}>{label}</Link>
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

import cx from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

export interface PageControlProps {
  current: boolean;
  url: string;
  page: number;
}

const PageControl: React.FC<PageControlProps> = ({ current, url, page }) => {
  const classNames = cx('pagination-link', {
    'is-current': current,
  });

  return (
    <li>
      <Link className={classNames} to={url} aria-label={`Goto page ${page}`}>
        {page}
      </Link>
    </li>
  );
};

export default PageControl;

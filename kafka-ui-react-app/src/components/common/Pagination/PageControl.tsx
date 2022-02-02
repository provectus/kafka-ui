import React from 'react';

import { PaginationLink } from './Pagination.styled';

export interface PageControlProps {
  current: boolean;
  url: string;
  page: number;
}

const PageControl: React.FC<PageControlProps> = ({ current, url, page }) => {
  return (
    <li>
      <PaginationLink
        to={url}
        aria-label={`Goto page ${page}`}
        $isCurrent={current}
        role="button"
      >
        {page}
      </PaginationLink>
    </li>
  );
};

export default PageControl;

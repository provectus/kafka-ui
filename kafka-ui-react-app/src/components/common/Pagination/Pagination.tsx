import { PER_PAGE } from 'lib/constants';
import usePagination from 'lib/hooks/usePagination';
import { range } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import PageControl from 'components/common/Pagination/PageControl';

import { Wrapper } from './Pagination.styled';

export interface PaginationProps {
  totalPages: number;
}

const NEIGHBOURS = 2;

const Pagination: React.FC<PaginationProps> = ({ totalPages }) => {
  const { page, perPage, pathname } = usePagination();

  const currentPage = page || 1;
  const currentPerPage = perPage || PER_PAGE;

  const getPath = (newPage: number) =>
    `${pathname}?page=${Math.max(newPage, 1)}&perPage=${currentPerPage}`;

  const pages = React.useMemo(() => {
    // Total visible numbers: neighbours, current, first & last
    const totalNumbers = NEIGHBOURS * 2 + 3;
    // totalNumbers + `...`*2
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return range(1, totalPages + 1);
    }

    const startPage = Math.max(
      2,
      Math.min(currentPage - NEIGHBOURS, totalPages)
    );
    const endPage = Math.min(
      totalPages - 1,
      Math.min(currentPage + NEIGHBOURS, totalPages)
    );

    let p = range(startPage, endPage + 1);

    const hasLeftSpill = startPage > 2;
    const hasRightSpill = totalPages - endPage > 1;
    const spillOffset = totalNumbers - (p.length + 1);

    switch (true) {
      case hasLeftSpill && !hasRightSpill: {
        p = [...range(startPage - spillOffset - 1, startPage - 1), ...p];
        break;
      }

      case !hasLeftSpill && hasRightSpill: {
        p = [...p, ...range(endPage + 1, endPage + spillOffset + 1)];
        break;
      }

      default:
        break;
    }

    return p;
  }, []);

  return (
    <Wrapper role="navigation" aria-label="pagination">
      {currentPage > 1 ? (
        <Link className="pagination-btn" to={getPath(currentPage - 1)}>
          Previous
        </Link>
      ) : (
        <button type="button" className="pagination-btn" disabled>
          Previous
        </button>
      )}
      {totalPages > 1 && (
        <ul>
          {!pages.includes(1) && (
            <PageControl
              page={1}
              current={currentPage === 1}
              url={getPath(1)}
            />
          )}
          {!pages.includes(2) && (
            <li>
              <span className="pagination-ellipsis">&hellip;</span>
            </li>
          )}
          {pages.map((p) => (
            <PageControl
              key={`page-${p}`}
              page={p}
              current={p === currentPage}
              url={getPath(p)}
            />
          ))}
          {!pages.includes(totalPages - 1) && (
            <li>
              <span className="pagination-ellipsis">&hellip;</span>
            </li>
          )}
          {!pages.includes(totalPages) && (
            <PageControl
              page={totalPages}
              current={currentPage === totalPages}
              url={getPath(totalPages)}
            />
          )}
        </ul>
      )}
      {currentPage < totalPages ? (
        <Link className="pagination-btn" to={getPath(currentPage + 1)}>
          Next
        </Link>
      ) : (
        <button type="button" className="pagination-btn" disabled>
          Next
        </button>
      )}
    </Wrapper>
  );
};

export default Pagination;

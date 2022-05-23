import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Pagination, {
  PaginationProps,
} from 'components/common/Pagination/Pagination';
import theme from 'theme/theme';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

describe('Pagination', () => {
  const setupComponent = (search = '', props: Partial<PaginationProps> = {}) =>
    render(
      <StaticRouter location={{ pathname: '/my/test/path/23', search }}>
        <Pagination totalPages={11} {...props} />
      </StaticRouter>
    );

  describe('next & prev buttons', () => {
    it('renders disable prev button and enabled next link', () => {
      setupComponent('?page=1');
      expect(screen.getByText('Previous')).toBeDisabled();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('renders disable next button and enabled prev link', () => {
      setupComponent('?page=11');
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeDisabled();
    });

    it('renders next & prev links with correct path', () => {
      setupComponent('?page=5&perPage=20');
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toHaveAttribute(
        'href',
        '/my/test/path/23?page=4&perPage=20'
      );
      expect(screen.getByText('Next')).toHaveAttribute(
        'href',
        '/my/test/path/23?page=6&perPage=20'
      );
    });
  });

  describe('spread', () => {
    it('renders 1 spread element after first page control', () => {
      setupComponent('?page=8');
      expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('…');
      expect(screen.getAllByRole('listitem')[1].firstChild).toHaveClass(
        'pagination-ellipsis'
      );
    });

    it('renders 1 spread element before last spread control', () => {
      setupComponent('?page=2');
      expect(screen.getAllByRole('listitem')[7]).toHaveTextContent('…');
      expect(screen.getAllByRole('listitem')[7].firstChild).toHaveClass(
        'pagination-ellipsis'
      );
    });

    it('renders 2 spread elements', () => {
      setupComponent('?page=6');
      expect(screen.getAllByText('…').length).toEqual(2);
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('1');
      expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('…');
      expect(screen.getAllByRole('listitem')[7]).toHaveTextContent('…');
      expect(screen.getAllByRole('listitem')[8]).toHaveTextContent('11');
    });

    it('renders 0 spread elements', () => {
      setupComponent('?page=2', { totalPages: 8 });
      expect(screen.queryAllByText('…').length).toEqual(0);
      expect(screen.getAllByRole('listitem').length).toEqual(8);
    });
  });

  describe('current page', () => {
    it('check if it sets page 8 as current when page param is set', () => {
      setupComponent('?page=8');
      expect(screen.getByText('8')).toHaveStyle(
        `background-color: ${theme.pagination.currentPage}`
      );
    });

    it('check if it sets first page as current when page param not set', () => {
      setupComponent('', { totalPages: 8 });
      expect(screen.getByText('1')).toHaveStyle(
        `background-color: ${theme.pagination.currentPage}`
      );
    });
  });
});

import React from 'react';
import PageControl, {
  PageControlProps,
} from 'components/common/Pagination/PageControl';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import theme from 'theme/theme';

const page = 138;

describe('PageControl', () => {
  const setupComponent = (props: Partial<PageControlProps> = {}) =>
    render(<PageControl url="/test" page={page} current {...props} />);

  it('renders current page', () => {
    setupComponent({ current: true });
    expect(screen.getByRole('button')).toHaveStyle(
      `background-color: ${theme.paginationStyles.currentPage}`
    );
  });

  it('renders non-current page', () => {
    setupComponent({ current: false });
    expect(screen.getByRole('button')).toHaveStyle(
      `background-color: ${theme.paginationStyles.backgroundColor}`
    );
  });

  it('renders page number', () => {
    setupComponent({ current: false });
    expect(screen.getByRole('button')).toHaveTextContent(String(page));
  });
});

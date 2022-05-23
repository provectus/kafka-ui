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

  const getButton = () => screen.getByRole('button');

  it('renders current page', () => {
    setupComponent({ current: true });
    expect(getButton()).toHaveStyle(
      `background-color: ${theme.pagination.currentPage}`
    );
  });

  it('renders non-current page', () => {
    setupComponent({ current: false });
    expect(getButton()).toHaveStyle(
      `background-color: ${theme.pagination.backgroundColor}`
    );
  });

  it('renders page number', () => {
    setupComponent({ current: false });
    expect(getButton()).toHaveTextContent(String(page));
  });
});

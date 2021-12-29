import React from 'react';
import { shallow } from 'enzyme';
import { StaticRouter } from 'react-router';
import PageControl, {
  PageControlProps,
} from 'components/common/Pagination/PageControl';
import { ThemeProvider } from 'styled-components';
import theme, { Colors } from 'theme/theme';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

const page = 138;

describe('PageControl', () => {
  const setupComponent = (props: Partial<PageControlProps> = {}) =>
    render(
      <ThemeProvider theme={theme}>
        <StaticRouter>
          <PageControl url="/test" page={page} current {...props} />
        </StaticRouter>
      </ThemeProvider>
    );

  it('renders current page', () => {
    setupComponent({ current: true });
    expect(screen.queryByTestId('pagination-link')).toHaveStyle(
      `background-color: ${Colors.neutral[10]}`
    );
  });

  it('renders non-current page', () => {
    setupComponent({ current: false });
    expect(screen.queryByTestId('pagination-link')).toHaveStyle(
      `background-color: ${Colors.neutral[0]}`
    );
  });

  it('renders page number', () => {
    setupComponent({ current: false });
    expect(screen.queryByTestId('pagination-link')).toHaveTextContent(
      String(page)
    );
  });

  it('matches snapshot', () => {
    const wrapper = shallow(<PageControl url="/test" page={page} current />);
    expect(wrapper).toMatchSnapshot();
  });
});

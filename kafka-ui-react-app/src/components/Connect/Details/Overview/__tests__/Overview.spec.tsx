import React from 'react';
import { create } from 'react-test-renderer';
import { containerRendersView } from 'lib/testHelpers';
import OverviewContainer from 'components/Connect/Details/Overview/OverviewContainer';
import Overview, {
  OverviewProps,
} from 'components/Connect/Details/Overview/Overview';
import { connector } from 'redux/reducers/connect/__test__/fixtures';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render } from '@testing-library/react';

describe('Overview', () => {
  containerRendersView(<OverviewContainer />, Overview);

  describe('view', () => {
    const component = (props: Partial<OverviewProps> = {}) => (
      <ThemeProvider theme={theme}>
        <Overview
          connector={connector}
          runningTasksCount={10}
          failedTasksCount={2}
          {...props}
        />
      </ThemeProvider>
    );

    it('matches snapshot', () => {
      const wrapper = create(component());
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('is empty when no connector', () => {
      const { container } = render(component({ connector: null }));
      expect(container).toBeEmptyDOMElement();
    });
  });
});

import React from 'react';
import Filters, {
  FiltersProps,
} from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { render } from '@testing-library/react';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const setupWrapper = (props?: Partial<FiltersProps>) => (
  <ThemeProvider theme={theme}>
    <StaticRouter>
      <Filters
        clusterName="test-cluster"
        topicName="test-topic"
        partitions={[{ partition: 0, offsetMin: 0, offsetMax: 100 }]}
        meta={{}}
        isFetching={false}
        addMessage={jest.fn()}
        resetMessages={jest.fn()}
        updatePhase={jest.fn()}
        updateMeta={jest.fn()}
        setIsFetching={jest.fn()}
        {...props}
      />
    </StaticRouter>
  </ThemeProvider>
);
describe('Filters component', () => {
  it('matches the snapshot', () => {
    const component = render(setupWrapper());
    expect(component.baseElement).toMatchSnapshot();
  });
  describe('when fetching', () => {
    it('matches the snapshot', () => {
      const component = render(setupWrapper({ isFetching: true }));
      expect(component.baseElement).toMatchSnapshot();
    });
  });
});

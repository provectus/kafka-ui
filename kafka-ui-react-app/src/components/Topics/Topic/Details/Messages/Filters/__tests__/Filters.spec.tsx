import React from 'react';
import Filters, {
  FiltersProps,
} from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

const setupWrapper = (props?: Partial<FiltersProps>) =>
  render(
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
  );
describe('Filters component', () => {
  it('renders component', () => {
    setupWrapper();
  });
  describe('when fetching', () => {
    it('shows cancel button while fetching', () => {
      setupWrapper({ isFetching: true });
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
});

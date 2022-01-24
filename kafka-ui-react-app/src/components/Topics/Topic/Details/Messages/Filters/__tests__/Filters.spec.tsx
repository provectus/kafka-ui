import React from 'react';
import Filters, {
  FiltersProps,
} from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { render } from 'lib/testHelpers';

const setupWrapper = (props?: Partial<FiltersProps>) => (
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

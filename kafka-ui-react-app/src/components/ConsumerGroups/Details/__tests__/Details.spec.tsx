import Details, { Props } from 'components/ConsumerGroups/Details/Details';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const mockHistory = {
  push: jest.fn(),
};
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => mockHistory,
}));

describe('Details component', () => {
  const setupWrapper = (props?: Partial<Props>) => (
    <ThemeProvider theme={theme}>
      <Details
        clusterName="local"
        groupId="test"
        isFetched
        isDeleted={false}
        fetchConsumerGroupDetails={jest.fn()}
        deleteConsumerGroup={jest.fn()}
        partitions={[
          {
            consumerId:
              'consumer-messages-consumer-1-122fbf98-643b-491d-8aec-c0641d2513d0',
            topic: 'messages',
            host: '/172.31.9.153',
            partition: 6,
            currentOffset: 394,
            endOffset: 394,
            messagesBehind: 0,
          },
          {
            consumerId:
              'consumer-messages-consumer-1-122fbf98-643b-491d-8aec-c0641d2513d1',
            topic: 'messages',
            host: '/172.31.9.153',
            partition: 7,
            currentOffset: 384,
            endOffset: 384,
            messagesBehind: 0,
          },
        ]}
        {...props}
      />
    </ThemeProvider>
  );
  describe('when consumer gruops are NOT fetched', () => {
    it('Matches the snapshot', () => {
      expect(shallow(setupWrapper({ isFetched: false }))).toMatchSnapshot();
    });
  });

  describe('when consumer gruops are fetched', () => {
    it('Matches the snapshot', () => {
      expect(shallow(setupWrapper())).toMatchSnapshot();
    });

    describe('onDelete', () => {
      describe('after deletion', () => {
        it('calls history.push', () => {
          mount(
            <StaticRouter>{setupWrapper({ isDeleted: true })}</StaticRouter>
          );
          expect(mockHistory.push).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});

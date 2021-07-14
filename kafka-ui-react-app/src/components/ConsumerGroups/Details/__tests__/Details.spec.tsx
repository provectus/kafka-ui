import Details, { Props } from 'components/ConsumerGroups/Details/Details';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { StaticRouter } from 'react-router';

const mockHistory = {
  push: jest.fn(),
};
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => mockHistory,
}));

describe('Details component', () => {
  const setupWrapper = (props?: Partial<Props>) => (
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
      it('calls deleteConsumerGroup', () => {
        const deleteConsumerGroup = jest.fn();
        const component = mount(
          <StaticRouter>{setupWrapper({ deleteConsumerGroup })}</StaticRouter>
        );
        component.find('button').at(0).simulate('click');
        component.update();
        component
          .find('ConfirmationModal')
          .find('button')
          .at(1)
          .simulate('click');
        expect(deleteConsumerGroup).toHaveBeenCalledTimes(1);
      });

      describe('on ConfirmationModal cancel', () => {
        it('does not call deleteConsumerGroup', () => {
          const deleteConsumerGroup = jest.fn();
          const component = mount(
            <StaticRouter>{setupWrapper({ deleteConsumerGroup })}</StaticRouter>
          );
          component.find('button').at(0).simulate('click');
          component.update();
          component
            .find('ConfirmationModal')
            .find('button')
            .at(0)
            .simulate('click');
          expect(deleteConsumerGroup).toHaveBeenCalledTimes(0);
        });
      });

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

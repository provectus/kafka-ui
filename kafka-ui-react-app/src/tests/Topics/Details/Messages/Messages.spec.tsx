import React from 'react';
import { shallow, mount } from 'enzyme';
import JSONTree from 'react-json-tree';
import Messages, {
  Props,
} from '../../../../components/Topics/Details/Messages/Messages';
import PageLoader from '../../../../components/common/PageLoader/PageLoader';
// import { messages } from './MessagesTx';

describe('Messages', () => {
  const createMessageComponent = (props: Partial<Props> = {}) =>
    mount(
      <Messages
        clusterName="Test cluster"
        topicName="Cluster topic"
        isFetched
        fetchTopicMessages={jest.fn()}
        messages={[]}
        partitions={[]}
        {...props}
      />
    );

  describe('Messages component initial', () => {
    it('renders properly', () => {
      expect(
        createMessageComponent({ isFetched: false }).find(PageLoader)
      ).toBeTruthy();
    });
  });

  describe('Messages component renders MessagesTable', () => {
    it('MessagesTable renders properly', () => {
      const wrapper = createMessageComponent();
      expect(wrapper.text()).toContain('No messages at selected topic');
    });
  });

  // describe('Message content renders', () => {
  //   it('Message content renders properly', () => {
  //     expect(createMessageComponent({ messages }).find(JSONTree));
  //   });
  // });
});

import React from 'react';
import { mount, shallow } from 'enzyme';
import JSONTree from 'react-json-tree';
import * as useDebounce from 'use-debounce';
import DatePicker from 'react-datepicker';
import Messages, {
  Props,
} from '../../../../components/Topics/Details/Messages/Messages';
import PageLoader from '../../../../components/common/PageLoader/PageLoader';

describe('Messages component', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const setupWrapper = (props: Partial<Props> = {}) => (
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

  describe('Initial state', () => {
    it('renders PageLoader', () => {
      expect(
        shallow(setupWrapper({ isFetched: false })).exists(PageLoader)
      ).toBeTruthy();
    });
  });

  describe('Messages table', () => {
    describe('With messages', () => {
      const messagesWrapper = shallow(
        setupWrapper({
          messages: [
            {
              partition: 1,
              offset: 2,
              timestamp: new Date('05-05-1994'),
              content: [1, 2, 3],
            },
          ],
        })
      );
      it('renders table', () => {
        expect(
          messagesWrapper.exists('[className="table is-striped is-fullwidth"]')
        ).toBeTruthy();
      });
      it('renders JSONTree', () => {
        expect(messagesWrapper.find(JSONTree).length).toEqual(1);
      });
      it('parses message content correctly', () => {
        const messages = [
          {
            partition: 1,
            offset: 2,
            timestamp: new Date('05-05-1994'),
            content: [1, 2, 3],
          },
        ];
        const content = JSON.stringify(messages[0].content);
        expect(JSON.parse(content)).toEqual(messages[0].content);
      });
    });
    describe('Without messages', () => {
      it('renders string', () => {
        const wrapper = shallow(setupWrapper());
        expect(wrapper.text()).toContain('No messages at selected topic');
      });
    });
  });

  describe('Offset field', () => {
    describe('Seek Type dependency', () => {
      const wrapper = mount(setupWrapper());

      it('renders DatePicker', () => {
        wrapper
          .find('[id="selectSeekType"]')
          .simulate('change', { target: { value: 'TIMESTAMP' } });

        expect(
          wrapper.find('[id="selectSeekType"]').first().props().value
        ).toEqual('TIMESTAMP');

        expect(wrapper.exists(DatePicker)).toBeTruthy();
      });
    });

    describe('With defined offset value', () => {
      const wrapper = mount(setupWrapper());

      it('shows offset value in input', () => {
        const offset = '10';

        wrapper
          .find('#searchOffset')
          .simulate('change', { target: { value: offset } });

        expect(wrapper.find('#searchOffset').first().props().value).toEqual(
          offset
        );
      });
    });
    describe('With invalid offset value', () => {
      const wrapper = mount(setupWrapper());

      it('shows 0 in input', () => {
        const offset = null;

        wrapper
          .find('#searchOffset')
          .simulate('change', { target: { value: offset } });

        expect(wrapper.find('#searchOffset').first().props().value).toBe('0');
      });
    });
  });

  describe('Search field', () => {
    it('renders input correctly', () => {
      const query = 20;
      const mockedUseDebouncedCallback = jest.fn();
      jest
        .spyOn(useDebounce, 'useDebouncedCallback')
        .mockImplementationOnce(() => [mockedUseDebouncedCallback]);

      const wrapper = shallow(setupWrapper());

      wrapper
        .find('#searchText')
        .simulate('change', { target: { value: query } });

      expect(wrapper.find('#searchText').first().props().value).toEqual(query);
      expect(mockedUseDebouncedCallback).toHaveBeenCalledWith({ q: query });
    });
  });

  describe('Submit button', () => {
    it('fetches topic messages', () => {
      const mockedfetchTopicMessages = jest.fn();
      const wrapper = mount(
        setupWrapper({ fetchTopicMessages: mockedfetchTopicMessages })
      );

      wrapper.find('[type="submit"]').simulate('click');
      expect(mockedfetchTopicMessages).toHaveBeenCalled();
    });
  });
});

import React from 'react';
import { mount, shallow } from 'enzyme';
import JSONTree from 'react-json-tree';
import * as useDebounce from 'use-debounce';
import DatePicker from 'react-datepicker';
import Messages, {
  Props,
} from '../../../../components/Topics/Details/Messages/Messages';
import PageLoader from '../../../../components/common/PageLoader/PageLoader';

describe('Messages', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const createMessageComponent = (props: Partial<Props> = {}) =>
    shallow(
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

  it('Messages component should render PageLoader', () => {
    expect(
      createMessageComponent({ isFetched: false }).find(PageLoader)
    ).toBeTruthy();
  });

  describe('Messages component with messages', () => {
    it('should render string', () => {
      const wrapper = createMessageComponent();

      expect(wrapper.text()).toContain('No messages at selected topic');
    });

    it('should render JSONTree', () => {
      expect(
        createMessageComponent({
          messages: [
            {
              partition: 1,
              offset: 2,
              timestamp: new Date('05-05-1994'),
              content: [1, 2, 3],
            },
          ],
        }).find(JSONTree)
      ).toBeTruthy();
    });

    it('JSON.parse should work correctly', () => {
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

  it('input of Search field renders properly', () => {
    const query = 20;
    const mockedUseDebouncedCallback = jest.fn();
    jest
      .spyOn(useDebounce, 'useDebouncedCallback')
      .mockImplementationOnce(() => [mockedUseDebouncedCallback]);

    const wrapper = createMessageComponent();

    wrapper
      .find('#searchText')
      .simulate('change', { target: { value: query } });

    expect(wrapper.find('#searchText').first().props().value).toEqual(query);
    expect(mockedUseDebouncedCallback).toHaveBeenCalledWith({ q: query });
  });

  describe('input of Offset field renders properly', () => {
    const wrapper = createMessageComponent();

    it('with defined value', () => {
      const offset = '10';

      console.log(wrapper.find(DatePicker));
      wrapper
        .find('#searchOffset')
        .simulate('change', { target: { value: offset } });

      expect(wrapper.find('#searchOffset').first().props().value).toEqual(
        offset
      );
    });
    it('with invalid value', () => {
      const offset = null;

      wrapper
        .find('#searchOffset')
        .simulate('change', { target: { value: offset } });

      expect(wrapper.find('#searchOffset').first().props().value).toBe('0');
    });
  });
});

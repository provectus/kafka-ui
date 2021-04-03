import React from 'react';
import { mount } from 'enzyme';
import { Alert as AlertProps } from 'redux/interfaces';
import * as actions from 'redux/actions/actions';
import Alert from '../Alert';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

const id = 'test-id';
const title = 'My Alert Title';
const message = 'My Alert Message';
const statusCode = 123;
const serverSideMessage = 'Server Side Message';
const httpStatusText = 'My Status Text';
const dismiss = jest.fn();

describe('Alert', () => {
  const setupComponent = (props: Partial<AlertProps> = {}) => (
    <Alert
      id={id}
      type="error"
      title={title}
      message={message}
      createdAt={1234567}
      {...props}
    />
  );

  it('renders with initial props', () => {
    const wrapper = mount(setupComponent());
    expect(wrapper.exists('.title.is-6')).toBeTruthy();
    expect(wrapper.find('.title.is-6').text()).toEqual(title);
    expect(wrapper.exists('.subtitle.is-6')).toBeTruthy();
    expect(wrapper.find('.subtitle.is-6').text()).toEqual(message);
    expect(wrapper.exists('button')).toBeTruthy();
    expect(wrapper.exists('.is-flex')).toBeFalsy();
  });

  it('renders alert with server side message', () => {
    const wrapper = mount(
      setupComponent({
        type: 'info',
        response: {
          status: statusCode,
          statusText: 'My Status Text',
          body: {
            message: serverSideMessage,
          },
        },
      })
    );
    expect(wrapper.exists('.is-flex')).toBeTruthy();
    expect(wrapper.find('.is-flex').text()).toEqual(
      `${statusCode}${serverSideMessage}`
    );
  });

  it('renders alert with http status text', () => {
    const wrapper = mount(
      setupComponent({
        type: 'info',
        response: {
          status: statusCode,
          statusText: httpStatusText,
          body: {},
        },
      })
    );
    expect(wrapper.exists('.is-flex')).toBeTruthy();
    expect(wrapper.find('.is-flex').text()).toEqual(
      `${statusCode}${httpStatusText}`
    );
  });

  it('matches snapshot', () => {
    expect(mount(setupComponent())).toMatchSnapshot();
  });

  describe('types', () => {
    it('renders error', () => {
      const wrapper = mount(setupComponent({ type: 'error' }));
      expect(wrapper.exists('.notification.is-danger')).toBeTruthy();
      expect(wrapper.exists('.notification.is-warning')).toBeFalsy();
      expect(wrapper.exists('.notification.is-info')).toBeFalsy();
      expect(wrapper.exists('.notification.is-success')).toBeFalsy();
    });

    it('renders warning', () => {
      const wrapper = mount(setupComponent({ type: 'warning' }));
      expect(wrapper.exists('.notification.is-warning')).toBeTruthy();
      expect(wrapper.exists('.notification.is-danger')).toBeFalsy();
      expect(wrapper.exists('.notification.is-info')).toBeFalsy();
      expect(wrapper.exists('.notification.is-success')).toBeFalsy();
    });

    it('renders info', () => {
      const wrapper = mount(setupComponent({ type: 'info' }));
      expect(wrapper.exists('.notification.is-info')).toBeTruthy();
      expect(wrapper.exists('.notification.is-warning')).toBeFalsy();
      expect(wrapper.exists('.notification.is-danger')).toBeFalsy();
      expect(wrapper.exists('.notification.is-success')).toBeFalsy();
    });

    it('renders success', () => {
      const wrapper = mount(setupComponent({ type: 'success' }));
      expect(wrapper.exists('.notification.is-success')).toBeTruthy();
      expect(wrapper.exists('.notification.is-warning')).toBeFalsy();
      expect(wrapper.exists('.notification.is-info')).toBeFalsy();
      expect(wrapper.exists('.notification.is-danger')).toBeFalsy();
    });
  });

  describe('dismiss', () => {
    it('handles dismiss callback', () => {
      jest.spyOn(actions, 'dismissAlert').mockImplementation(dismiss);
      const wrapper = mount(setupComponent());
      wrapper.find('button').simulate('click');
      expect(dismiss).toHaveBeenCalledWith(id);
    });
  });
});

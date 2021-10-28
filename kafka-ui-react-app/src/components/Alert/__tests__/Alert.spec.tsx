import React from 'react';
import { mount } from 'enzyme';
import { Alert as AlertProps } from 'redux/interfaces';
import * as actions from 'redux/actions/actions';
import Alert from 'components/Alert/Alert';

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
    expect(wrapper.exists('.alert-title')).toBeTruthy();
    expect(wrapper.find('.alert-title').text()).toEqual(title);
    expect(wrapper.exists('.alert-message')).toBeTruthy();
    expect(wrapper.find('.alert-message').text()).toEqual(message);
    expect(wrapper.exists('span')).toBeTruthy();
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
    expect(wrapper.exists('.alert-server-response')).toBeTruthy();
    expect(wrapper.find('.alert-server-response').text()).toEqual(
      `${statusCode} ${serverSideMessage}`
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
    expect(wrapper.exists('.alert-server-response')).toBeTruthy();
    expect(wrapper.find('.alert-server-response').text()).toEqual(
      `${statusCode} ${httpStatusText}`
    );
  });

  it('matches snapshot', () => {
    expect(mount(setupComponent())).toMatchSnapshot();
  });

  describe('dismiss', () => {
    it('handles dismiss callback', () => {
      jest.spyOn(actions, 'dismissAlert').mockImplementation(dismiss);
      const wrapper = mount(setupComponent());
      wrapper.find('span').simulate('click');
      expect(dismiss).toHaveBeenCalledWith(id);
    });
  });
});

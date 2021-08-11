import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import QueryModal, {
  QueryModalProps,
} from 'components/KsqlDb/QueryModal/QueryModal';

const submitMock = jest.fn();
const cancelMock = jest.fn();

describe('QueryModal', () => {
  const setupWrapper = (props: Partial<QueryModalProps> = {}) => (
    <QueryModal
      onCancel={cancelMock}
      onSubmit={submitMock}
      clusterName="test cluster"
      {...props}
    />
  );

  it('renders nothing', () => {
    const wrapper = mount(setupWrapper({ isOpen: false }));
    expect(wrapper.exists(QueryModal)).toBeTruthy();
    expect(wrapper.exists('.modal.is-active')).toBeFalsy();
  });
  it('renders modal and two tabs', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.exists(QueryModal)).toBeTruthy();
    expect(wrapper.exists('.modal.is-active')).toBeTruthy();
    expect(wrapper.find('li').length).toEqual(2);
    expect(wrapper.find('.modal-card-foot button').length).toEqual(1);
  });
  it('renders modal with header', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.find('.modal-card-title').text()).toEqual('Execute a query');
  });
  describe('cancellation', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      wrapper = mount(setupWrapper({ isOpen: true }));
    });
    it('handles onCancel when user clicks on modal-background', () => {
      wrapper.find('.modal-background').simulate('click');
      expect(cancelMock).toHaveBeenCalledTimes(1);
    });
    it('handles onCancel when user clicks on Cancel button', () => {
      const cancelBtn = wrapper.find({ children: 'Cancel' });
      cancelBtn.simulate('click');
      expect(cancelMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('Form', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
      wrapper = mount(setupWrapper({ isOpen: true }));
    });
    it('Not valid form not submitting', () => {
      const submitBtn = wrapper.find({ children: 'Execute' });
      submitBtn.simulate('click');
      expect(submitMock).toHaveBeenCalledTimes(0);
    });
  });
});

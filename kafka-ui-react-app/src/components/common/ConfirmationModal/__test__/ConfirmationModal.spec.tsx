import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import ConfirmationModal, {
  ConfirmationModalProps,
} from 'components/common/ConfirmationModal/ConfirmationModal';

const confirmMock = jest.fn();
const cancelMock = jest.fn();
const body = 'Please Confirm the action!';
describe('ConfiramationModal', () => {
  const setupWrapper = (props: Partial<ConfirmationModalProps> = {}) => (
    <ConfirmationModal onCancel={cancelMock} onConfirm={confirmMock} {...props}>
      {body}
    </ConfirmationModal>
  );

  it('renders nothing', () => {
    const wrapper = mount(setupWrapper({ isOpen: false }));
    expect(wrapper.exists(ConfirmationModal)).toBeTruthy();
    expect(wrapper.exists('.modal.is-active')).toBeFalsy();
  });
  it('renders modal', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.exists(ConfirmationModal)).toBeTruthy();
    expect(wrapper.exists('.modal.is-active')).toBeTruthy();
    expect(wrapper.find('.modal-card-body').text()).toEqual(body);
    expect(wrapper.find('.modal-card-foot button').length).toEqual(2);
  });
  it('renders modal with default header', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.find('.modal-card-title').text()).toEqual(
      'Confirm the action'
    );
  });
  it('renders modal with custom header', () => {
    const title = 'My Custom Header';
    const wrapper = mount(setupWrapper({ isOpen: true, title }));
    expect(wrapper.find('.modal-card-title').text()).toEqual(title);
  });
  it('handles onConfirm when user clicks confirm button', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    const confirmBtn = wrapper.find({ children: 'Confirm' });
    confirmBtn.simulate('click');
    expect(cancelMock).toHaveBeenCalledTimes(0);
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  describe('cancellation', () => {
    let wrapper: ReactWrapper;

    describe('when not confirming', () => {
      beforeEach(() => {
        wrapper = mount(setupWrapper({ isOpen: true }));
      });
      it('handles onCancel when user clicks on modal-background', () => {
        wrapper.find('.modal-background').simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
      it('handles onCancel when user clicks on Cancel button', () => {
        const cancelBtn = wrapper.find({ children: 'Cancel' });
        cancelBtn.simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('when confirming', () => {
      beforeEach(() => {
        wrapper = mount(setupWrapper({ isOpen: true, isConfirming: true }));
      });
      it('does not call onCancel when user clicks on modal-background', () => {
        wrapper.find('.modal-background').simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(0);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
      it('does not call onCancel when user clicks on Cancel button', () => {
        const cancelBtn = wrapper.find({ children: 'Cancel' });
        cancelBtn.simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(0);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
    });
  });
});

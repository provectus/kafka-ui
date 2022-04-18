import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import ConfirmationModal, {
  ConfirmationModalProps,
} from 'components/common/ConfirmationModal/ConfirmationModal';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const confirmMock = jest.fn();
const cancelMock = jest.fn();
const body = 'Please Confirm the action!';
describe('ConfirmationModal', () => {
  const setupWrapper = (props: Partial<ConfirmationModalProps> = {}) => (
    <ThemeProvider theme={theme}>
      <ConfirmationModal
        onCancel={cancelMock}
        onConfirm={confirmMock}
        {...props}
      >
        {body}
      </ConfirmationModal>
    </ThemeProvider>
  );

  it('renders nothing', () => {
    const wrapper = mount(setupWrapper({ isOpen: false }));
    expect(wrapper.exists(ConfirmationModal)).toBeTruthy();
    expect(wrapper.exists('ConfirmationModal > div')).toBeFalsy();
  });
  it('renders modal', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.exists(ConfirmationModal)).toBeTruthy();
    expect(wrapper.exists('div')).toBeTruthy();
    expect(wrapper.find('div > div:last-child > section').text()).toEqual(body);
    expect(wrapper.find('div > div:last-child > footer button').length).toEqual(
      2
    );
  });
  it('renders modal with default header', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.find('div > div:last-child > header > p').text()).toEqual(
      'Confirm the action'
    );
  });
  it('renders modal with custom header', () => {
    const title = 'My Custom Header';
    const wrapper = mount(setupWrapper({ isOpen: true, title }));
    expect(wrapper.find('div > div:last-child > header > p').text()).toEqual(
      title
    );
  });

  it('Check the text on the submit button default behavior', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    expect(wrapper.exists({ children: 'Submit' })).toBeTruthy();
  });

  it('handles onConfirm when user clicks confirm button', () => {
    const wrapper = mount(setupWrapper({ isOpen: true }));
    const confirmBtn = wrapper.find({ children: 'Submit' });
    confirmBtn.at(2).simulate('click');
    expect(cancelMock).toHaveBeenCalledTimes(0);
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  it('Check the text on the submit button', () => {
    const submitBtnText = 'Submit btn Text';
    const wrapper = mount(setupWrapper({ isOpen: true, submitBtnText }));
    expect(wrapper.exists({ children: submitBtnText })).toBeTruthy();
  });

  describe('cancellation', () => {
    let wrapper: ReactWrapper;

    describe('when not confirming', () => {
      beforeEach(() => {
        wrapper = mount(setupWrapper({ isOpen: true }));
      });
      it('handles onCancel when user clicks on modal-background', () => {
        wrapper.find('div > div:first-child').simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
      it('handles onCancel when user clicks on Cancel button', () => {
        const cancelBtn = wrapper.find({ children: 'Cancel' });
        cancelBtn.at(2).simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('when confirming', () => {
      beforeEach(() => {
        wrapper = mount(setupWrapper({ isOpen: true, isConfirming: true }));
      });
      it('does not call onCancel when user clicks on modal-background', () => {
        wrapper.find('div > div:first-child').simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(0);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
      it('does not call onCancel when user clicks on Cancel button', () => {
        const cancelBtn = wrapper.find({ children: 'Cancel' });
        cancelBtn.at(2).simulate('click');
        expect(cancelMock).toHaveBeenCalledTimes(0);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
    });
  });
});

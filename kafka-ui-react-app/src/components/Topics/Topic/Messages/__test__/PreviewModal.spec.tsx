import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import React from 'react';
import { PreviewFilter } from 'components/Topics/Topic/Messages/Message';
import { serdesPayload } from 'lib/fixtures/topicMessages';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import PreviewModal, {
  InfoModalProps,
} from 'components/Topics/Topic/Messages/PreviewModal';

jest.mock('components/common/Icons/CloseIcon', () => () => 'mock-CloseIcon');

jest.mock('lib/hooks/api/topicMessages', () => ({
  useSerdes: jest.fn(),
}));

beforeEach(async () => {
  (useSerdes as jest.Mock).mockImplementation(() => ({
    data: serdesPayload,
  }));
});

const toggleInfoModal = jest.fn();
const mockValues: PreviewFilter[] = [
  {
    field: 'type',
    path: 'schema.type',
  },
];

const renderComponent = (props?: Partial<InfoModalProps>) => {
  render(
    <PreviewModal
      toggleIsOpen={toggleInfoModal}
      values={mockValues}
      setFilters={jest.fn()}
      {...props}
    />
  );
};

describe('PreviewModal component', () => {
  it('closes PreviewModal', () => {
    renderComponent();
    userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[1]);
    expect(toggleInfoModal).toHaveBeenCalledTimes(1);
  });

  it('return if empty inputs', () => {
    renderComponent();
    userEvent.click(screen.getByRole('button', { name: 'Ok' }));
    expect(screen.getByText('Json path is required')).toBeInTheDocument();
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  describe('Input elements', () => {
    const fieldValue = 'type';
    const pathValue = 'schema.type';

    beforeEach(async () => {
      await act(() => {
        renderComponent();
      });
    });

    it('field input', () => {
      const fieldInput = screen.getByPlaceholderText('Field');
      expect(fieldInput).toHaveValue('');
      userEvent.type(fieldInput, fieldValue);
      expect(fieldInput).toHaveValue(fieldValue);
    });

    it('path input', () => {
      const pathInput = screen.getByPlaceholderText('Json Path');
      expect(pathInput).toHaveValue('');
      userEvent.type(pathInput, pathValue);
      expect(pathInput).toHaveValue(pathValue);
    });
  });

  describe('edit and remove functionality', () => {
    const fieldValue = 'type new';
    const pathValue = 'schema.type.new';

    it('remove values', async () => {
      const setFilters = jest.fn();
      await act(() => {
        renderComponent({ setFilters });
      });
      userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[0]);
      expect(setFilters).toHaveBeenCalledTimes(1);
    });

    it('edit values', async () => {
      const setFilters = jest.fn();
      const toggleIsOpen = jest.fn();
      await act(() => {
        renderComponent({ setFilters });
      });
      userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(setFilters).toHaveBeenCalledTimes(1);
      const fieldInput = screen.getByPlaceholderText('Field');
      userEvent.type(fieldInput, fieldValue);
      const pathInput = screen.getByPlaceholderText('Json Path');
      userEvent.type(pathInput, pathValue);
      userEvent.click(screen.getByRole('button', { name: 'Ok' }));
      await act(() => {
        renderComponent({ setFilters, toggleIsOpen });
      });
    });
  });
});

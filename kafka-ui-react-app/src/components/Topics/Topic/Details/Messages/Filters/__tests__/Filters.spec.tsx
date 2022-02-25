import React from 'react';
import Filters, {
  FiltersProps,
} from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const setupWrapper = (props?: Partial<FiltersProps>) =>
  render(
    <Filters
      clusterName="test-cluster"
      topicName="test-topic"
      partitions={[{ partition: 0, offsetMin: 0, offsetMax: 100 }]}
      meta={{}}
      isFetching={false}
      addMessage={jest.fn()}
      resetMessages={jest.fn()}
      updatePhase={jest.fn()}
      updateMeta={jest.fn()}
      setIsFetching={jest.fn()}
      {...props}
    />
  );
describe('Filters component', () => {
  it('renders component', () => {
    setupWrapper();
  });
  describe('when fetching', () => {
    it('shows cancel button while fetching', () => {
      setupWrapper({ isFetching: true });
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
  describe('when fetching is over', () => {
    it('shows submit button while fetching is over', () => {
      setupWrapper();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
  describe('Input elements', () => {
    it('search input', () => {
      setupWrapper();
      const SearchInput = screen.getByPlaceholderText('Search');
      expect(SearchInput).toBeInTheDocument();
      expect(SearchInput).toHaveValue('');
      userEvent.type(SearchInput, 'Hello World!');
      expect(SearchInput).toHaveValue('Hello World!');
    });
    it('offset input', () => {
      setupWrapper();
      const OffsetInput = screen.getByPlaceholderText('Offset');
      expect(OffsetInput).toBeInTheDocument();
      expect(OffsetInput).toHaveValue('');
      userEvent.type(OffsetInput, 'Hello World!');
      expect(OffsetInput).toHaveValue('Hello World!');
    });
    it('timestamp input', () => {
      setupWrapper();
      const seekTypeSelect = screen.getAllByRole('listbox');
      const option = screen.getAllByRole('option');
      userEvent.click(seekTypeSelect[0]);
      userEvent.selectOptions(seekTypeSelect[0], ['Timestamp']);
      expect(option[0]).toHaveTextContent('Timestamp');
      const TimestampInput = screen.getByPlaceholderText('Select timestamp');
      expect(TimestampInput).toBeInTheDocument();
      expect(TimestampInput).toHaveValue('');
      userEvent.type(TimestampInput, 'Hello World!');
      expect(TimestampInput).toHaveValue('Hello World!');
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
  describe('Select elements', () => {
    it('seekType select', () => {
      setupWrapper();
      const seekTypeSelect = screen.getAllByRole('listbox');
      const option = screen.getAllByRole('option');
      expect(option[0]).toHaveTextContent('Offset');
      userEvent.click(seekTypeSelect[0]);
      userEvent.selectOptions(seekTypeSelect[0], ['Timestamp']);
      expect(option[0]).toHaveTextContent('Timestamp');
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
    it('seekDirection select', () => {
      setupWrapper();
      const seekDirectionSelect = screen.getAllByRole('listbox');
      const option = screen.getAllByRole('option');
      userEvent.click(seekDirectionSelect[1]);
      userEvent.selectOptions(seekDirectionSelect[1], ['Newest First']);
      expect(option[1]).toHaveTextContent('Newest First');
    });
  });

  describe('when live mode is active', () => {
    it('stop loading', () => {
      setupWrapper();
      const StopLoading = screen.getByText('Stop loading');
      expect(StopLoading).toBeInTheDocument();
      userEvent.click(StopLoading);
      const option = screen.getAllByRole('option');
      expect(option[1]).toHaveTextContent('Oldest First');
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
});

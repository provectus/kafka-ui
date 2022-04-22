import React from 'react';
import { SeekDirectionOptions } from 'components/Topics/Topic/Details/Messages/Messages';
import Filters, {
  FiltersProps,
  SeekTypeOptions,
} from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { render } from 'lib/testHelpers';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicMessagesContext, {
  ContextProps,
} from 'components/contexts/TopicMessagesContext';
import { SeekDirection } from 'generated-sources';

const defaultContextValue: ContextProps = {
  isLive: false,
  seekDirection: SeekDirection.FORWARD,
  searchParams: new URLSearchParams(''),
  changeSeekDirection: jest.fn(),
};

const setupWrapper = (
  props: Partial<FiltersProps> = {},
  ctx: ContextProps = defaultContextValue
) => {
  render(
    <TopicMessagesContext.Provider value={ctx}>
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
    </TopicMessagesContext.Provider>
  );
};
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
    const inputValue = 'Hello World!';

    it('search input', () => {
      setupWrapper();
      const SearchInput = screen.getByPlaceholderText('Search');
      expect(SearchInput).toBeInTheDocument();
      expect(SearchInput).toHaveValue('');
      userEvent.type(SearchInput, inputValue);
      expect(SearchInput).toHaveValue(inputValue);
    });

    it('offset input', () => {
      setupWrapper();
      const OffsetInput = screen.getByPlaceholderText('Offset');
      expect(OffsetInput).toBeInTheDocument();
      expect(OffsetInput).toHaveValue('');
      userEvent.type(OffsetInput, inputValue);
      expect(OffsetInput).toHaveValue(inputValue);
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
      userEvent.type(TimestampInput, inputValue);
      expect(TimestampInput).toHaveValue(inputValue);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Select elements', () => {
    let seekTypeSelects: HTMLElement[];
    let options: HTMLElement[];
    const selectedDirectionOptionValue = SeekDirectionOptions[0];

    const mockDirectionOptionSelectLabel = selectedDirectionOptionValue.label;

    const selectTypeOptionValue = SeekTypeOptions[0];

    const mockTypeOptionSelectLabel = selectTypeOptionValue.label;

    beforeEach(() => {
      setupWrapper();
      seekTypeSelects = screen.getAllByRole('listbox');
      options = screen.getAllByRole('option');
    });

    it('seekType select', () => {
      expect(options[0]).toHaveTextContent('Offset');
      userEvent.click(seekTypeSelects[0]);
      userEvent.selectOptions(seekTypeSelects[0], [mockTypeOptionSelectLabel]);
      expect(options[0]).toHaveTextContent(mockTypeOptionSelectLabel);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
    it('seekDirection select', () => {
      userEvent.click(seekTypeSelects[1]);
      userEvent.selectOptions(seekTypeSelects[1], [
        mockDirectionOptionSelectLabel,
      ]);
      expect(options[1]).toHaveTextContent(mockDirectionOptionSelectLabel);
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

  describe('add new filter modal', () => {
    it('renders addFilter modal', () => {
      setupWrapper();
      userEvent.click(
        screen.getByRole('button', {
          name: /add filters/i,
        })
      );
      expect(screen.getByTestId('messageFilterModal')).toBeInTheDocument();
    });
  });

  describe('when there is active smart filter', () => {
    beforeEach(async () => {
      setupWrapper();

      await waitFor(() =>
        userEvent.click(
          screen.getByRole('button', {
            name: /add filters/i,
          })
        )
      );

      const filterName = 'filter name';
      const filterCode = 'filter code';

      const messageFilterModal = screen.getByTestId('messageFilterModal');

      await waitFor(() => {
        const textBoxElements =
          within(messageFilterModal).getAllByRole('textbox');
        userEvent.type(textBoxElements[0], filterName);
        userEvent.type(textBoxElements[1], filterCode);
      });
      const textBoxElements =
        within(messageFilterModal).getAllByRole('textbox');
      expect(textBoxElements[0]).toHaveValue(filterName);
      expect(textBoxElements[1]).toHaveValue(filterCode);

      await waitFor(() => {
        return userEvent.click(
          within(messageFilterModal).getByRole('button', {
            name: /add filter/i,
          })
        );
      });
    });

    it('shows saved smart filter', () => {
      expect(screen.getByTestId('activeSmartFilter')).toBeInTheDocument();
    });

    it('delete the active smart Filter', async () => {
      const smartFilterElement = screen.getByTestId('activeSmartFilter');
      const deleteIcon = within(smartFilterElement).getByTestId(
        'activeSmartFilterCloseIcon'
      );
      await waitFor(() => {
        userEvent.click(deleteIcon);
      });

      const anotherSmartFilterElement =
        screen.queryByTestId('activeSmartFilter');
      expect(anotherSmartFilterElement).not.toBeInTheDocument();
    });
  });
});

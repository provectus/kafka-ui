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
const getSubmit = () => screen.getByText('Submit');

describe('Filters component', () => {
  it('shows cancel button while fetching', () => {
    setupWrapper({ isFetching: true });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows submit button while fetching is over', () => {
    setupWrapper();
    expect(getSubmit()).toBeInTheDocument();
  });

  describe('Input elements', () => {
    const inputValue = 'Hello World!';

    beforeEach(() => setupWrapper());

    it('search input', () => {
      const SearchInput = screen.getByPlaceholderText('Search');
      expect(SearchInput).toBeInTheDocument();
      expect(SearchInput).toHaveValue('');
      userEvent.type(SearchInput, inputValue);
      expect(SearchInput).toHaveValue(inputValue);
    });

    it('offset input', () => {
      const OffsetInput = screen.getByPlaceholderText('Offset');
      expect(OffsetInput).toBeInTheDocument();
      expect(OffsetInput).toHaveValue('');
      userEvent.type(OffsetInput, inputValue);
      expect(OffsetInput).toHaveValue(inputValue);
    });

    it('timestamp input', async () => {
      const seekTypeSelect = screen.getAllByRole('listbox');
      const option = screen.getAllByRole('option');

      userEvent.click(seekTypeSelect[0]);
      userEvent.selectOptions(seekTypeSelect[0], ['Timestamp']);
      expect(option[0]).toHaveTextContent('Timestamp');
      const timestampInput = screen.getByPlaceholderText('Select timestamp');
      expect(timestampInput).toBeInTheDocument();
      expect(timestampInput).toHaveValue('');
      userEvent.type(timestampInput, inputValue);
      await waitFor(() => expect(timestampInput).toHaveValue(inputValue));
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

  it('stop loading when live mode is active', () => {
    setupWrapper();
    userEvent.click(screen.getByText('Stop loading'));
    const option = screen.getAllByRole('option');
    expect(option[1]).toHaveTextContent('Oldest First');
    expect(getSubmit()).toBeInTheDocument();
  });

  it('renders addFilter modal', async () => {
    setupWrapper();
    await waitFor(() =>
      userEvent.click(
        screen.getByRole('button', {
          name: /add filters/i,
        })
      )
    );
    expect(screen.getByTestId('messageFilterModal')).toBeInTheDocument();
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

      const textBoxElements =
        within(messageFilterModal).getAllByRole('textbox');

      const textAreaElement = textBoxElements[0] as HTMLTextAreaElement;
      const inputNameElement = textBoxElements[1];
      await waitFor(() => {
        userEvent.paste(textAreaElement, filterName);
        userEvent.type(inputNameElement, filterCode);
      });

      expect(textAreaElement.value).toEqual(`${filterName}\n\n`);
      expect(inputNameElement).toHaveValue(filterCode);

      await waitFor(() =>
        userEvent.click(
          within(messageFilterModal).getByRole('button', {
            name: /add filter/i,
          })
        )
      );
    });

    it('shows saved smart filter', () => {
      expect(screen.getByTestId('activeSmartFilter')).toBeInTheDocument();
    });

    it('delete the active smart Filter', async () => {
      const smartFilterElement = screen.getByTestId('activeSmartFilter');
      const deleteIcon = within(smartFilterElement).getByTestId(
        'activeSmartFilterCloseIcon'
      );
      await waitFor(() => userEvent.click(deleteIcon));

      const anotherSmartFilterElement =
        screen.queryByTestId('activeSmartFilter');
      expect(anotherSmartFilterElement).not.toBeInTheDocument();
    });
  });
});

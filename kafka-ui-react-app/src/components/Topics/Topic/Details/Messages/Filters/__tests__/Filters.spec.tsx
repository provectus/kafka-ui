import React from 'react';
import { SeekDirectionOptions } from 'components/Topics/Topic/Details/Messages/Messages';
import Filters, {
  FiltersProps,
  SeekTypeOptions,
} from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { EventSourceMock, render } from 'lib/testHelpers';
import { act, screen, within, waitFor } from '@testing-library/react';
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

jest.mock('components/common/Icons/CloseIcon', () => () => 'mock-CloseIcon');

const renderComponent = (
  props: Partial<FiltersProps> = {},
  ctx: ContextProps = defaultContextValue
) => {
  render(
    <TopicMessagesContext.Provider value={ctx}>
      <Filters
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
  Object.defineProperty(window, 'EventSource', {
    value: EventSourceMock,
  });

  it('shows cancel button while fetching', () => {
    renderComponent({ isFetching: true });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows submit button while fetching is over', () => {
    renderComponent();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  describe('Input elements', () => {
    const inputValue = 'Hello World!';

    beforeEach(async () => {
      await act(() => {
        renderComponent();
      });
    });

    it('search input', () => {
      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
      userEvent.type(searchInput, inputValue);
      expect(searchInput).toHaveValue(inputValue);
    });

    it('offset input', () => {
      const offsetInput = screen.getByPlaceholderText('Offset');
      expect(offsetInput).toHaveValue('');
      userEvent.type(offsetInput, inputValue);
      expect(offsetInput).toHaveValue(inputValue);
    });

    it('timestamp input', async () => {
      const seekTypeSelect = screen.getAllByRole('listbox');
      const option = screen.getAllByRole('option');

      await act(() => userEvent.click(seekTypeSelect[0]));

      await act(() => {
        userEvent.selectOptions(seekTypeSelect[0], ['Timestamp']);
      });

      expect(option[0]).toHaveTextContent('Timestamp');
      const timestampInput = screen.getByPlaceholderText('Select timestamp');
      expect(timestampInput).toHaveValue('');

      await waitFor(() => userEvent.type(timestampInput, inputValue));

      expect(timestampInput).toHaveValue(inputValue);
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
      renderComponent();
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
    renderComponent();
    userEvent.click(screen.getByText('Stop loading'));
    const option = screen.getAllByRole('option');
    expect(option[1]).toHaveTextContent('Oldest First');
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders addFilter modal', async () => {
    renderComponent();
    await act(() =>
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
      renderComponent();

      await act(() =>
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
      await act(() => {
        userEvent.paste(textAreaElement, filterName);
        userEvent.type(inputNameElement, filterCode);
      });

      expect(textAreaElement.value).toEqual(`${filterName}\n\n`);
      expect(inputNameElement).toHaveValue(filterCode);

      await act(() =>
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
      const deleteIcon = within(smartFilterElement).getByText('mock-CloseIcon');
      await act(() => userEvent.click(deleteIcon));

      const anotherSmartFilterElement =
        screen.queryByTestId('activeSmartFilter');
      expect(anotherSmartFilterElement).not.toBeInTheDocument();
    });
  });
});

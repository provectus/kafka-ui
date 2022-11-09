import React from 'react';
import { SeekDirectionOptions } from 'components/Topics/Topic/Messages/Messages';
import Filters, {
  FiltersProps,
  SeekTypeOptions,
} from 'components/Topics/Topic/Messages/Filters/Filters';
import { EventSourceMock, render, WithRoute } from 'lib/testHelpers';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicMessagesContext, {
  ContextProps,
} from 'components/contexts/TopicMessagesContext';
import { SeekDirection } from 'generated-sources';
import { clusterTopicPath } from 'lib/paths';
import { useTopicDetails } from 'lib/hooks/api/topics';
import { externalTopicPayload } from 'lib/fixtures/topics';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import { serdesPayload } from 'lib/fixtures/topicMessages';

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
}));

jest.mock('lib/hooks/api/topicMessages', () => ({
  useSerdes: jest.fn(),
}));

const defaultContextValue: ContextProps = {
  isLive: false,
  seekDirection: SeekDirection.FORWARD,
  changeSeekDirection: jest.fn(),
};

jest.mock('components/common/Icons/CloseIcon', () => () => 'mock-CloseIcon');

const clusterName = 'cluster-name';
const topicName = 'topic-name';

const renderComponent = (
  props: Partial<FiltersProps> = {},
  ctx: ContextProps = defaultContextValue
) => {
  render(
    <WithRoute path={clusterTopicPath()}>
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
    </WithRoute>,
    { initialEntries: [clusterTopicPath(clusterName, topicName)] }
  );
};

beforeEach(async () => {
  (useTopicDetails as jest.Mock).mockImplementation(() => ({
    data: externalTopicPayload,
  }));
  (useSerdes as jest.Mock).mockImplementation(() => ({
    data: serdesPayload,
  }));
});

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

    it('search input', async () => {
      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
      await userEvent.type(searchInput, inputValue);
      expect(searchInput).toHaveValue(inputValue);
    });

    it('offset input', async () => {
      const offsetInput = screen.getByPlaceholderText('Offset');
      expect(offsetInput).toHaveValue('');
      await userEvent.type(offsetInput, inputValue);
      expect(offsetInput).toHaveValue(inputValue);
    });

    it('timestamp input', async () => {
      const seekTypeSelect = screen.getAllByRole('listbox');
      const option = screen.getAllByRole('option');

      await act(async () => {
        await userEvent.click(seekTypeSelect[0]);
      });

      await act(async () => {
        await userEvent.selectOptions(seekTypeSelect[0], ['Timestamp']);
      });

      expect(option[0]).toHaveTextContent('Timestamp');
      const timestampInput = screen.getByPlaceholderText('Select timestamp');
      expect(timestampInput).toHaveValue('');

      await userEvent.type(timestampInput, inputValue);

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

    it('seekType select', async () => {
      expect(options[0]).toHaveTextContent('Offset');
      await userEvent.click(seekTypeSelects[0]);
      await userEvent.selectOptions(seekTypeSelects[0], [
        mockTypeOptionSelectLabel,
      ]);
      expect(options[0]).toHaveTextContent(mockTypeOptionSelectLabel);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('seekDirection select', async () => {
      await userEvent.click(seekTypeSelects[3]);
      await userEvent.selectOptions(seekTypeSelects[3], [
        mockDirectionOptionSelectLabel,
      ]);
      expect(options[3]).toHaveTextContent(mockDirectionOptionSelectLabel);
    });
  });

  it('stop loading when live mode is active', async () => {
    renderComponent();
    await userEvent.click(screen.getByText('Stop loading'));
    const option = screen.getAllByRole('option');
    expect(option[3]).toHaveTextContent('Oldest First');
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders addFilter modal', async () => {
    renderComponent();
    await act(async () => {
      await userEvent.click(
        screen.getByRole('button', {
          name: /add filters/i,
        })
      );
    });
    expect(screen.getByTestId('messageFilterModal')).toBeInTheDocument();
  });

  describe('when there is active smart filter', () => {
    beforeEach(async () => {
      renderComponent();

      await act(async () => {
        await userEvent.click(
          screen.getByRole('button', {
            name: /add filters/i,
          })
        );
      });

      const filterName = 'filter name';
      const filterCode = 'filter code';

      const messageFilterModal = screen.getByTestId('messageFilterModal');

      const textBoxElements =
        within(messageFilterModal).getAllByRole('textbox');

      const textAreaElement = textBoxElements[0] as HTMLTextAreaElement;
      const inputNameElement = textBoxElements[1];
      await act(async () => {
        textAreaElement.focus();
        await userEvent.paste(filterName);
        await userEvent.type(inputNameElement, filterCode);
      });

      expect(textAreaElement.value).toEqual(`${filterName}\n\n`);
      expect(inputNameElement).toHaveValue(filterCode);

      await act(async () => {
        await userEvent.click(
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
      const deleteIcon = within(smartFilterElement).getByText('mock-CloseIcon');
      await act(async () => {
        await userEvent.click(deleteIcon);
      });

      const anotherSmartFilterElement =
        screen.queryByTestId('activeSmartFilter');
      expect(anotherSmartFilterElement).not.toBeInTheDocument();
    });
  });
});

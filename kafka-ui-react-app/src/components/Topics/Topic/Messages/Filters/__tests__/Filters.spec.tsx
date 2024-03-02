import React from 'react';
import Filters, {
  FiltersProps,
} from 'components/Topics/Topic/Messages/Filters/Filters';
import { EventSourceMock, render, WithRoute } from 'lib/testHelpers';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopicMessagesContext, {
  ContextProps,
} from 'components/contexts/TopicMessagesContext';
import { PollingMode } from 'generated-sources';
import { clusterTopicPath } from 'lib/paths';
import { useRegisterFilter, useTopicDetails } from 'lib/hooks/api/topics';
import { externalTopicPayload } from 'lib/fixtures/topics';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import { serdesPayload } from 'lib/fixtures/topicMessages';
import { PollingModeOptions } from 'lib/constants';

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
  useRegisterFilter: jest.fn(),
}));

jest.mock('lib/hooks/api/topicMessages', () => ({
  useSerdes: jest.fn(),
}));

const defaultContextValue: ContextProps = {
  isLive: false,
  pollingMode: PollingMode.LATEST,
  changePollingMode: jest.fn(),
  page: 1,
  setPage: jest.fn(),
  keySerde: 'String',
  valueSerde: 'String',
  setKeySerde: jest.fn(),
  setValueSerde: jest.fn(),
  serdes: serdesPayload,
};

jest.mock('components/common/Icons/CloseIcon', () => () => 'mock-CloseIcon');

const registerFilter = jest.fn();

const clusterName = 'cluster-name';
const topicName = 'topic-name';

const renderComponent = (
  props: Partial<FiltersProps> = {},
  ctx: ContextProps = defaultContextValue
) =>
  render(
    <WithRoute path={clusterTopicPath()}>
      <TopicMessagesContext.Provider value={ctx}>
        <Filters
          meta={{
            filterApplyErrors: 10,
          }}
          isFetching={false}
          addMessage={jest.fn()}
          resetMessages={jest.fn()}
          updatePhase={jest.fn()}
          updateMeta={jest.fn()}
          setIsFetching={jest.fn()}
          setMessageType={jest.fn}
          messageEventType="Done"
          updateCursor={jest.fn}
          setCurrentPage={jest.fn}
          setLastLoadedPage={jest.fn}
          resetAllMessages={jest.fn}
          currentPage={1}
          {...props}
        />
      </TopicMessagesContext.Provider>
    </WithRoute>,
    { initialEntries: [clusterTopicPath(clusterName, topicName)] }
  );

beforeEach(async () => {
  (useTopicDetails as jest.Mock).mockImplementation(() => ({
    data: externalTopicPayload,
  }));
  (useSerdes as jest.Mock).mockImplementation(() => ({
    data: serdesPayload,
  }));
  (useRegisterFilter as jest.Mock).mockImplementation(() => ({
    mutateAsync: registerFilter,
  }));
});

describe('Filters component', () => {
  Object.defineProperty(window, 'EventSource', {
    value: EventSourceMock,
  });

  it('shows cancel button while fetching', () => {
    renderComponent({ isFetching: true });
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  // it('shows submit button while fetching is over', () => {
  //   renderComponent();
  //   expect(screen.getByText('Submit')).toBeInTheDocument();
  // });

  describe('Input elements', () => {
    const inputValue = 'Hello World!';

    beforeEach(() => {
      renderComponent();
    });

    it('search input', async () => {
      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('');
      await userEvent.type(searchInput, inputValue);
      expect(searchInput).toHaveValue(inputValue);
    });

    // it('offset input', async () => {
    //   const offsetInput = screen.getByPlaceholderText('Offset');
    //   expect(offsetInput).toHaveValue('');
    //   await userEvent.type(offsetInput, inputValue);
    //   expect(offsetInput).toHaveValue(inputValue);
    // });

    // it('timestamp input', async () => {
    //   const seekTypeSelect = screen.getAllByRole('listbox');
    //   const option = screen.getAllByRole('option');

    //   await userEvent.click(seekTypeSelect[0]);

    //   await userEvent.selectOptions(seekTypeSelect[0], ['Timestamp']);

    //   expect(option[0]).toHaveTextContent('Timestamp');
    //   const timestampInput = screen.getByPlaceholderText('Select timestamp');
    //   expect(timestampInput).toHaveValue('');

    //   await userEvent.type(timestampInput, inputValue);

    //   expect(timestampInput).toHaveValue(inputValue);
    //   expect(screen.getByText('Submit')).toBeInTheDocument();
    // });
  });

  describe('Select elements', () => {
    let pollingModeSelects: HTMLElement[];
    let options: HTMLElement[];

    const pollingModeOptionValue = PollingModeOptions[0];
    const mockPollingModeOptionSelectLabel = pollingModeOptionValue.label;

    const livePollingModeOptionValue = PollingModeOptions[3];
    const mockLivePollingModeOptionSelectLabel =
      livePollingModeOptionValue.label;

    beforeEach(() => {
      renderComponent();
      pollingModeSelects = screen.getAllByRole('listbox');
      options = screen.getAllByRole('option');
    });

    it('polling mode select', async () => {
      expect(options[0]).toHaveTextContent('Newest');
      await userEvent.click(pollingModeSelects[0]);
      await userEvent.selectOptions(pollingModeSelects[0], [
        mockPollingModeOptionSelectLabel,
      ]);
      expect(options[0]).toHaveTextContent(mockPollingModeOptionSelectLabel);
      // expect(screen.getByText('Submit')).toBeInTheDocument();
    });
    it('live mode select', async () => {
      await userEvent.click(pollingModeSelects[0]);
      await userEvent.selectOptions(pollingModeSelects[0], [
        mockLivePollingModeOptionSelectLabel,
      ]);
      expect(options[0]).toHaveTextContent(
        mockLivePollingModeOptionSelectLabel
      );
    });
  });

  it('stop loading when live mode is active', async () => {
    renderComponent();
    await userEvent.click(screen.getByText('Stop'));
    const option = screen.getAllByRole('option');
    expect(option[0]).toHaveTextContent('Newest');
    // expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders addFilter modal', async () => {
    renderComponent();
    await userEvent.click(
      screen.getByRole('button', {
        name: /add filters/i,
      })
    );
    expect(screen.getByTestId('messageFilterModal')).toBeInTheDocument();
  });

  describe('when there is active smart filter', () => {
    beforeEach(async () => {
      renderComponent();

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Add Filters',
        })
      );

      const filterName = 'filter name';
      const filterCode = 'filter code';

      const messageFilterModal = screen.getByTestId('messageFilterModal');

      const textBoxElements =
        within(messageFilterModal).getAllByRole('textbox');

      const textAreaElement = textBoxElements[0] as HTMLTextAreaElement;
      const inputNameElement = textBoxElements[1];

      textAreaElement.focus();
      await userEvent.paste(filterCode);
      await userEvent.type(inputNameElement, filterName);

      expect(textAreaElement).toHaveValue(`${filterCode}\n\n`);
      expect(inputNameElement).toHaveValue('filter name');
      expect(
        screen.getByRole('button', {
          name: 'Add filter',
        })
      ).toBeEnabled();
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Add filter',
        })
      );
      await userEvent.tab();
    });

    it('shows saved smart filter', async () => {
      expect(screen.getByTestId('activeSmartFilter')).toBeInTheDocument();
    });

    it('delete the active smart Filter', async () => {
      const smartFilterElement = screen.getByTestId('activeSmartFilter');
      const deleteIcon = within(smartFilterElement).getByText('mock-CloseIcon');
      await userEvent.click(deleteIcon);

      const anotherSmartFilterElement =
        screen.queryByTestId('activeSmartFilter');
      expect(anotherSmartFilterElement).not.toBeInTheDocument();
    });
  });

  describe('show errors when get an filterApplyErrors and message event type', () => {
    it('show errors', () => {
      renderComponent();
      const errors = screen.getByText('10 errors');
      expect(errors).toBeInTheDocument();
    });
    it('message event type when fetching is false ', () => {
      renderComponent();
      const messageType = screen.getByText('Done');
      expect(messageType).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render } from 'lib/testHelpers';
import { screen, waitFor, within } from '@testing-library/react';
import { Route, Router, StaticRouter } from 'react-router-dom';
import ClusterContext, {
  ContextProps,
} from 'components/contexts/ClusterContext';
import List, { TopicsListProps } from 'components/Topics/List/List';
import { createMemoryHistory } from 'history';
import { externalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import { CleanUpPolicy, SortOrder } from 'generated-sources';
import userEvent from '@testing-library/user-event';

describe('List', () => {
  const setupComponent = (props: Partial<TopicsListProps> = {}) => (
    <List
      areTopicsFetching={false}
      topics={[]}
      totalPages={1}
      fetchTopicsList={jest.fn()}
      deleteTopic={jest.fn()}
      deleteTopics={jest.fn()}
      clearTopicsMessages={jest.fn()}
      clearTopicMessages={jest.fn()}
      recreateTopic={jest.fn()}
      search=""
      orderBy={null}
      sortOrder={SortOrder.ASC}
      setTopicsSearch={jest.fn()}
      setTopicsOrderBy={jest.fn()}
      {...props}
    />
  );

  const historyMock = createMemoryHistory();

  const renderComponentWithProviders = (
    contextProps: Partial<ContextProps> = {},
    props: Partial<TopicsListProps> = {},
    history = historyMock
  ) =>
    render(
      <Router history={history}>
        <ClusterContext.Provider
          value={{
            isReadOnly: true,
            hasKafkaConnectConfigured: true,
            hasSchemaRegistryConfigured: true,
            isTopicDeletionAllowed: true,
            ...contextProps,
          }}
        >
          {setupComponent(props)}
        </ClusterContext.Provider>
      </Router>
    );

  describe('when it has readonly flag', () => {
    it('does not render the Add a Topic button', () => {
      renderComponentWithProviders();
      expect(screen.queryByText(/add a topic/)).not.toBeInTheDocument();
    });
  });

  describe('when it does not have readonly flag', () => {
    const fetchTopicsList = jest.fn();

    jest.useFakeTimers();

    afterEach(() => {
      fetchTopicsList.mockClear();
    });

    it('renders the Add a Topic button', () => {
      renderComponentWithProviders({ isReadOnly: false }, { fetchTopicsList });
      expect(screen.getByText(/add a topic/i)).toBeInTheDocument();
    });

    it('calls setTopicsSearch on input', async () => {
      const setTopicsSearch = jest.fn();
      renderComponentWithProviders({}, { setTopicsSearch });
      const query = 'topic';
      const searchElement = screen.getByPlaceholderText('Search by Topic Name');
      userEvent.type(searchElement, query);
      await waitFor(() => {
        expect(setTopicsSearch).toHaveBeenCalledWith(query);
      });
    });

    it('show internal toggle state should be true if user has not used it yet', () => {
      renderComponentWithProviders({ isReadOnly: false }, { fetchTopicsList });
      const internalCheckBox = screen.getByRole('checkbox');

      expect(internalCheckBox).toBeChecked();
    });

    it('show internal toggle state should match user preference', () => {
      localStorage.setItem('hideInternalTopics', 'true');
      renderComponentWithProviders({ isReadOnly: false }, { fetchTopicsList });

      const internalCheckBox = screen.getByRole('checkbox');

      expect(internalCheckBox).not.toBeChecked();
    });

    it('should re-fetch topics on show internal toggle change', async () => {
      renderComponentWithProviders({ isReadOnly: false }, { fetchTopicsList });
      const internalCheckBox: HTMLInputElement = screen.getByRole('checkbox');

      userEvent.click(internalCheckBox);
      const { value } = internalCheckBox;

      await waitFor(() => {
        expect(fetchTopicsList).toHaveBeenLastCalledWith({
          search: '',
          showInternal: value === 'on',
          sortOrder: SortOrder.ASC,
        });
      });
    });

    it('should reset page query param on show internal toggle change', () => {
      const mockedHistory = createMemoryHistory();
      jest.spyOn(mockedHistory, 'push');
      renderComponentWithProviders(
        { isReadOnly: false },
        { fetchTopicsList },
        mockedHistory
      );

      const internalCheckBox: HTMLInputElement = screen.getByRole('checkbox');
      userEvent.click(internalCheckBox);

      expect(mockedHistory.push).toHaveBeenCalledWith('/?page=1&perPage=25');
    });

    it('should set cached page query param on show internal toggle change', async () => {
      const mockedHistory = createMemoryHistory();
      jest.spyOn(mockedHistory, 'push');

      const cachedPage = 5;
      mockedHistory.push(`/?page=${cachedPage}&perPage=25`);

      renderComponentWithProviders(
        { isReadOnly: false },
        { fetchTopicsList, totalPages: 10 },
        mockedHistory
      );

      const searchInput = screen.getByPlaceholderText('Search by Topic Name');
      userEvent.type(searchInput, 'nonEmptyString');

      await waitFor(() => {
        expect(mockedHistory.push).toHaveBeenCalledWith('/?page=1&perPage=25');
      });

      userEvent.clear(searchInput);

      await waitFor(() => {
        expect(mockedHistory.push).toHaveBeenCalledWith(
          `/?page=${cachedPage}&perPage=25`
        );
      });
    });
  });

  describe('when some list items are selected', () => {
    const mockDeleteTopics = jest.fn();
    const mockDeleteTopic = jest.fn();
    const mockClearTopic = jest.fn();
    const mockClearTopicsMessages = jest.fn();
    const mockRecreate = jest.fn();
    const fetchTopicsList = jest.fn();

    jest.useFakeTimers();
    const pathname = '/ui/clusters/local/topics';

    beforeEach(() => {
      render(
        <StaticRouter location={{ pathname }}>
          <Route path="/ui/clusters/:clusterName">
            <ClusterContext.Provider
              value={{
                isReadOnly: false,
                hasKafkaConnectConfigured: true,
                hasSchemaRegistryConfigured: true,
                isTopicDeletionAllowed: true,
              }}
            >
              {setupComponent({
                topics: [
                  {
                    ...externalTopicPayload,
                    cleanUpPolicy: CleanUpPolicy.DELETE,
                  },
                  { ...externalTopicPayload, name: 'external.topic2' },
                ],
                deleteTopics: mockDeleteTopics,
                clearTopicsMessages: mockClearTopicsMessages,
                recreateTopic: mockRecreate,
                deleteTopic: mockDeleteTopic,
                clearTopicMessages: mockClearTopic,
                fetchTopicsList,
              })}
            </ClusterContext.Provider>
          </Route>
        </StaticRouter>
      );
    });

    afterEach(() => {
      mockDeleteTopics.mockClear();
      mockClearTopicsMessages.mockClear();
      mockRecreate.mockClear();
      mockDeleteTopic.mockClear();
    });

    const getCheckboxInput = (at: number) => {
      const rows = screen.getAllByRole('row');
      return within(rows[at + 1]).getByRole('checkbox');
    };

    it('renders delete/purge buttons', () => {
      const firstCheckbox = getCheckboxInput(0);
      const secondCheckbox = getCheckboxInput(1);
      expect(firstCheckbox).not.toBeChecked();
      expect(secondCheckbox).not.toBeChecked();
      // expect(component.find('.buttons').length).toEqual(0);

      // check first item
      userEvent.click(firstCheckbox);
      expect(firstCheckbox).toBeChecked();
      expect(secondCheckbox).not.toBeChecked();

      expect(screen.getByTestId('delete-buttons')).toBeInTheDocument();

      // check second item
      userEvent.click(secondCheckbox);
      expect(firstCheckbox).toBeChecked();
      expect(secondCheckbox).toBeChecked();

      expect(screen.getByTestId('delete-buttons')).toBeInTheDocument();

      // uncheck second item
      userEvent.click(secondCheckbox);
      expect(firstCheckbox).toBeChecked();
      expect(secondCheckbox).not.toBeChecked();

      expect(screen.getByTestId('delete-buttons')).toBeInTheDocument();

      // uncheck first item
      userEvent.click(firstCheckbox);
      expect(firstCheckbox).not.toBeChecked();
      expect(secondCheckbox).not.toBeChecked();

      expect(screen.queryByTestId('delete-buttons')).not.toBeInTheDocument();
    });

    const checkActionButtonClick = async (
      action: 'deleteTopics' | 'clearTopicsMessages'
    ) => {
      const buttonIndex = action === 'deleteTopics' ? 0 : 1;

      const confirmationText =
        action === 'deleteTopics'
          ? 'Are you sure you want to remove selected topics?'
          : 'Are you sure you want to purge messages of selected topics?';
      const mockFn =
        action === 'deleteTopics' ? mockDeleteTopics : mockClearTopicsMessages;

      const firstCheckbox = getCheckboxInput(0);
      const secondCheckbox = getCheckboxInput(1);
      userEvent.click(firstCheckbox);
      userEvent.click(secondCheckbox);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const deleteButtonContainer = screen.getByTestId('delete-buttons');
      const buttonClickedElement = within(deleteButtonContainer).getAllByRole(
        'button'
      )[buttonIndex];
      userEvent.click(buttonClickedElement);

      const modal = screen.getByRole('dialog');
      expect(within(modal).getByText(confirmationText)).toBeInTheDocument();
      userEvent.click(within(modal).getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.queryByTestId('delete-buttons')).not.toBeInTheDocument();
      });

      expect(mockFn).toBeCalledTimes(1);
      expect(mockFn).toBeCalledWith({
        clusterName: 'local',
        topicNames: [externalTopicPayload.name, 'external.topic2'],
      });
    };

    it('triggers the deleteTopics when clicked on the delete button', async () => {
      await checkActionButtonClick('deleteTopics');
      expect(mockDeleteTopics).toBeCalledTimes(1);
    });

    it('triggers the clearTopicsMessages when clicked on the clear button', async () => {
      await checkActionButtonClick('clearTopicsMessages');
      expect(mockClearTopicsMessages).toBeCalledTimes(1);
    });

    it('closes ConfirmationModal when clicked on the cancel button', async () => {
      const firstCheckbox = getCheckboxInput(0);
      const secondCheckbox = getCheckboxInput(1);

      userEvent.click(firstCheckbox);
      userEvent.click(secondCheckbox);

      const deleteButton = screen.getByText('Delete selected topics');

      userEvent.click(deleteButton);

      const modal = screen.getByRole('dialog');
      userEvent.click(within(modal).getByText('Cancel'));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(firstCheckbox).toBeChecked();
      expect(secondCheckbox).toBeChecked();

      expect(screen.getByTestId('delete-buttons')).toBeInTheDocument();

      expect(mockDeleteTopics).not.toHaveBeenCalled();
    });

    const tableRowActionClickAndCheck = async (
      action: 'deleteTopics' | 'clearTopicsMessages' | 'recreate'
    ) => {
      const row = screen.getAllByRole('row')[1];
      userEvent.hover(row);
      const actionBtn = within(row).getByRole('menu', { hidden: true });

      userEvent.click(actionBtn);

      let textBtn;
      let mock: jest.Mock;

      if (action === 'clearTopicsMessages') {
        textBtn = 'Clear Messages';
        mock = mockClearTopic;
      } else if (action === 'deleteTopics') {
        textBtn = 'Remove Topic';
        mock = mockDeleteTopic;
      } else {
        textBtn = 'Recreate Topic';
        mock = mockRecreate;
      }

      const ourAction = screen.getByText(textBtn);

      userEvent.click(ourAction);

      let dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mock).toHaveBeenCalled();
        if (action === 'clearTopicsMessages') {
          expect(fetchTopicsList).toHaveBeenCalled();
        }
      });

      userEvent.click(ourAction);
      dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mock).toHaveBeenCalledTimes(1);
    };

    it('should test the actions of the row and their modal and fetching for removing', async () => {
      await tableRowActionClickAndCheck('deleteTopics');
    });

    it('should test the actions of the row and their modal and fetching for clear', async () => {
      await tableRowActionClickAndCheck('clearTopicsMessages');
    });

    it('should test the actions of the row and their modal and fetching for recreate', async () => {
      await tableRowActionClickAndCheck('recreate');
    });
  });
});

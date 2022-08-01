import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { act, screen, waitFor, within } from '@testing-library/react';
import ClusterContext, {
  ContextProps,
} from 'components/contexts/ClusterContext';
import List, { TopicsListProps } from 'components/Topics/List/List';
import { externalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import { CleanUpPolicy, SortOrder } from 'generated-sources';
import userEvent from '@testing-library/user-event';
import { clusterTopicsPath } from 'lib/paths';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('List', () => {
  afterEach(() => {
    mockNavigate.mockClear();
  });

  const setupComponent = (props: Partial<TopicsListProps> = {}) => (
    <List
      areTopicsFetching={false}
      topics={[]}
      totalPages={1}
      fetchTopicsList={jest.fn()}
      deleteTopics={jest.fn()}
      clearTopicsMessages={jest.fn()}
      clearTopicMessages={jest.fn()}
      search=""
      orderBy={null}
      sortOrder={SortOrder.ASC}
      setTopicsSearch={jest.fn()}
      setTopicsOrderBy={jest.fn()}
      {...props}
    />
  );

  const renderComponentWithProviders = (
    contextProps: Partial<ContextProps> = {},
    props: Partial<TopicsListProps> = {},
    queryParams = ''
  ) =>
    render(
      <WithRoute path={clusterTopicsPath()}>
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
      </WithRoute>,
      { initialEntries: [`${clusterTopicsPath('test')}${queryParams}`] }
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
          clusterName: 'test',
          orderBy: undefined,
          page: undefined,
          perPage: undefined,
          search: '',
          showInternal: value === 'on',
          sortOrder: SortOrder.ASC,
        });
      });
    });

    it('should reset page query param on show internal toggle change', async () => {
      renderComponentWithProviders({ isReadOnly: false }, { fetchTopicsList });

      const internalCheckBox: HTMLInputElement = screen.getByRole('checkbox');
      userEvent.click(internalCheckBox);

      expect(mockNavigate).toHaveBeenCalledWith({
        search: '?page=1&perPage=25',
      });
    });

    it('should set cached page query param on show internal toggle change', async () => {
      const cachedPage = 5;

      renderComponentWithProviders(
        { isReadOnly: false },
        { fetchTopicsList, totalPages: 10 },
        `?page=${cachedPage}&perPage=25`
      );

      const searchInput = screen.getByPlaceholderText('Search by Topic Name');
      userEvent.type(searchInput, 'nonEmptyString');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          search: '?page=1&perPage=25',
        });
      });

      await act(() => {
        userEvent.clear(searchInput);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenLastCalledWith({
          search: `?page=${cachedPage}&perPage=25`,
        });
      });
    });
  });

  describe('when some list items are selected', () => {
    const mockDeleteTopics = jest.fn();
    const mockClearTopic = jest.fn();
    const mockClearTopicsMessages = jest.fn();
    const fetchTopicsList = jest.fn();

    jest.useFakeTimers();
    const pathname = clusterTopicsPath('local');

    beforeEach(() => {
      render(
        <WithRoute path={clusterTopicsPath()}>
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
              clearTopicMessages: mockClearTopic,
              fetchTopicsList,
            })}
          </ClusterContext.Provider>
        </WithRoute>,
        { initialEntries: [pathname] }
      );
    });

    afterEach(() => {
      mockDeleteTopics.mockClear();
      mockClearTopicsMessages.mockClear();
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
  });
});

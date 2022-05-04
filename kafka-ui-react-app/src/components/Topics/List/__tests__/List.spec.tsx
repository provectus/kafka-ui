import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Route, Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import ClusterContext, {
  ContextProps,
} from 'components/contexts/ClusterContext';
import List, { TopicsListProps } from 'components/Topics/List/List';
import { createMemoryHistory } from 'history';
import { StaticRouter } from 'react-router';
import Search from 'components/common/Search/Search';
import { externalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import { ConfirmationModalProps } from 'components/common/ConfirmationModal/ConfirmationModal';
import theme from 'theme/theme';
import { ThemeProvider } from 'styled-components';
import { SortOrder } from 'generated-sources';

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('List', () => {
  const setupComponent = (props: Partial<TopicsListProps> = {}) => (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );

  const historyMock = createMemoryHistory();

  const mountComponentWithProviders = (
    contextProps: Partial<ContextProps> = {},
    props: Partial<TopicsListProps> = {},
    history = historyMock
  ) =>
    mount(
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
      const component = mountComponentWithProviders();
      expect(component.exists('Link')).toBeFalsy();
    });
  });

  describe('when it does not have readonly flag', () => {
    let fetchTopicsList = jest.fn();
    let component: ReactWrapper;

    jest.useFakeTimers();

    beforeEach(() => {
      fetchTopicsList = jest.fn();
      component = mountComponentWithProviders(
        { isReadOnly: false },
        { fetchTopicsList }
      );
    });

    it('renders the Add a Topic button', () => {
      expect(component.exists('Link')).toBeTruthy();
    });

    it('calls setTopicsSearch on input', () => {
      const setTopicsSearch = jest.fn();
      component = mountComponentWithProviders({}, { setTopicsSearch });
      const query = 'topic';
      const input = component.find(Search);
      input.props().handleSearch(query);
      expect(setTopicsSearch).toHaveBeenCalledWith(query);
    });

    it('should refetch topics on show internal toggle change', () => {
      jest.clearAllMocks();
      const toggle = component.find('input[name="ShowInternalTopics"]');
      toggle.simulate('change');
      expect(fetchTopicsList).toHaveBeenLastCalledWith({
        search: '',
        showInternal: false,
        sortOrder: SortOrder.ASC,
      });
    });

    it('should reset page query param on show internal toggle change', () => {
      const mockedHistory = createMemoryHistory();
      jest.spyOn(mockedHistory, 'push');
      component = mountComponentWithProviders(
        { isReadOnly: false },
        { fetchTopicsList },
        mockedHistory
      );

      const toggle = component.find('input[name="ShowInternalTopics"]');
      toggle.simulate('change');

      expect(mockedHistory.push).toHaveBeenCalledWith('/?page=1&perPage=25');
    });

    it('should set cached page query param on show internal toggle change', async () => {
      const mockedHistory = createMemoryHistory();
      jest.spyOn(mockedHistory, 'push');
      component = mountComponentWithProviders(
        { isReadOnly: false },
        { fetchTopicsList, totalPages: 10 },
        mockedHistory
      );

      const cachedPage = 5;

      mockedHistory.push(`/?page=${cachedPage}&perPage=25`);

      const input = component.find(Search);
      input.props().handleSearch('nonEmptyString');

      expect(mockedHistory.push).toHaveBeenCalledWith('/?page=1&perPage=25');

      input.props().handleSearch('');

      expect(mockedHistory.push).toHaveBeenCalledWith(
        `/?page=${cachedPage}&perPage=25`
      );
    });
  });

  describe('when some list items are selected', () => {
    const mockDeleteTopics = jest.fn();
    const mockClearTopicsMessages = jest.fn();
    jest.useFakeTimers();
    const pathname = '/ui/clusters/local/topics';
    const component = mount(
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
                externalTopicPayload,
                { ...externalTopicPayload, name: 'external.topic2' },
              ],
              deleteTopics: mockDeleteTopics,
              clearTopicsMessages: mockClearTopicsMessages,
            })}
          </ClusterContext.Provider>
        </Route>
      </StaticRouter>
    );
    const getCheckboxInput = (at: number) =>
      component.find('TableRow').at(at).find('input[type="checkbox"]').at(0);

    const getConfirmationModal = () =>
      component.find('mock-ConfirmationModal').at(0);

    it('renders delete/purge buttons', () => {
      expect(getCheckboxInput(0).props().checked).toBeFalsy();
      expect(getCheckboxInput(1).props().checked).toBeFalsy();
      expect(component.find('.buttons').length).toEqual(0);

      // check first item
      getCheckboxInput(0).simulate('change', { target: { checked: true } });
      expect(getCheckboxInput(0).props().checked).toBeTruthy();
      expect(getCheckboxInput(1).props().checked).toBeFalsy();

      // check second item
      getCheckboxInput(1).simulate('change', { target: { checked: true } });
      expect(getCheckboxInput(0).props().checked).toBeTruthy();
      expect(getCheckboxInput(1).props().checked).toBeTruthy();
      expect(
        component.find('div[data-testid="delete-buttons"]').length
      ).toEqual(1);

      // uncheck second item
      getCheckboxInput(1).simulate('change', { target: { checked: false } });
      expect(getCheckboxInput(0).props().checked).toBeTruthy();
      expect(getCheckboxInput(1).props().checked).toBeFalsy();
      expect(
        component.find('div[data-testid="delete-buttons"]').length
      ).toEqual(1);

      // uncheck first item
      getCheckboxInput(0).simulate('change', { target: { checked: false } });
      expect(getCheckboxInput(0).props().checked).toBeFalsy();
      expect(getCheckboxInput(1).props().checked).toBeFalsy();
      expect(
        component.find('div[data-testid="delete-buttons"]').length
      ).toEqual(0);
    });

    const checkActionButtonClick = async (action: string) => {
      const buttonIndex = action === 'deleteTopics' ? 0 : 1;
      const confirmationText =
        action === 'deleteTopics'
          ? 'Are you sure you want to remove selected topics?'
          : 'Are you sure you want to purge messages of selected topics?';
      const mockFn =
        action === 'deleteTopics' ? mockDeleteTopics : mockClearTopicsMessages;
      getCheckboxInput(0).simulate('change', { target: { checked: true } });
      getCheckboxInput(1).simulate('change', { target: { checked: true } });
      let modal = getConfirmationModal();
      expect(modal.prop('isOpen')).toBeFalsy();
      component
        .find('div[data-testid="delete-buttons"]')
        .find('button')
        .at(buttonIndex)
        .simulate('click');
      expect(modal.text()).toEqual(confirmationText);
      modal = getConfirmationModal();
      expect(modal.prop('isOpen')).toBeTruthy();
      await act(async () => {
        (modal.props() as ConfirmationModalProps).onConfirm();
      });
      component.update();
      expect(getCheckboxInput(0).props().checked).toBeFalsy();
      expect(getCheckboxInput(1).props().checked).toBeFalsy();
      expect(
        component.find('div[data-testid="delete-buttons"]').length
      ).toEqual(0);
      expect(mockFn).toBeCalledTimes(1);
      expect(mockFn).toBeCalledWith('local', [
        externalTopicPayload.name,
        'external.topic2',
      ]);
    };

    it('triggers the deleteTopics when clicked on the delete button', async () => {
      await checkActionButtonClick('deleteTopics');
    });

    it('triggers the clearTopicsMessages when clicked on the clear button', async () => {
      await checkActionButtonClick('clearTopicsMessages');
    });

    it('closes ConfirmationModal when clicked on the cancel button', async () => {
      getCheckboxInput(0).simulate('change', { target: { checked: true } });
      getCheckboxInput(1).simulate('change', { target: { checked: true } });
      let modal = getConfirmationModal();
      expect(modal.prop('isOpen')).toBeFalsy();
      component
        .find('div[data-testid="delete-buttons"]')
        .find('button')
        .at(0)
        .simulate('click');
      modal = getConfirmationModal();
      expect(modal.prop('isOpen')).toBeTruthy();
      await act(async () => {
        (modal.props() as ConfirmationModalProps).onCancel();
      });
      component.update();
      expect(getConfirmationModal().prop('isOpen')).toBeFalsy();
      expect(getCheckboxInput(0).props().checked).toBeTruthy();
      expect(getCheckboxInput(1).props().checked).toBeTruthy();
      expect(
        component.find('div[data-testid="delete-buttons"]').length
      ).toEqual(1);
      expect(mockDeleteTopics).toBeCalledTimes(0);
    });
  });
});

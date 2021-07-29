import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Router } from 'react-router-dom';
import ClusterContext, {
  ContextProps,
} from 'components/contexts/ClusterContext';
import List, { TopicsListProps } from 'components/Topics/List/List';
import { createMemoryHistory } from 'history';
import { StaticRouter } from 'react-router';
import Search from 'components/common/Search/Search';

describe('List', () => {
  const setupComponent = (props: Partial<TopicsListProps> = {}) => (
    <List
      areTopicsFetching={false}
      topics={[]}
      totalPages={1}
      fetchTopicsList={jest.fn()}
      deleteTopic={jest.fn()}
      clearTopicMessages={jest.fn()}
      search=""
      orderBy={null}
      setTopicsSearch={jest.fn()}
      setTopicsOrderBy={jest.fn()}
      {...props}
    />
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
    it('matches the snapshot', () => {
      component = mount(
        <StaticRouter>
          <ClusterContext.Provider
            value={{
              isReadOnly: false,
              hasKafkaConnectConfigured: true,
              hasSchemaRegistryConfigured: true,
            }}
          >
            {setupComponent()}
          </ClusterContext.Provider>
        </StaticRouter>
      );
      expect(component).toMatchSnapshot();
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
      const toggle = component.find('input#switchRoundedDefault');
      toggle.simulate('change');
      expect(fetchTopicsList).toHaveBeenLastCalledWith({
        search: '',
        showInternal: false,
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

      const toggle = component.find('input#switchRoundedDefault');
      toggle.simulate('change');

      expect(mockedHistory.push).toHaveBeenCalledWith('/?page=1&perPage=25');
    });
  });
});

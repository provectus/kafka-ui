import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
import ClusterContext from 'components/contexts/ClusterContext';
import List from 'components/Topics/List/List';

describe('List', () => {
  describe('when it has readonly flag', () => {
    it('does not render the Add a Topic button', () => {
      const component = mount(
        <StaticRouter>
          <ClusterContext.Provider
            value={{
              isReadOnly: true,
              hasKafkaConnectConfigured: true,
              hasSchemaRegistryConfigured: true,
            }}
          >
            <List
              areTopicsFetching={false}
              topics={[]}
              externalTopics={[]}
              totalPages={1}
              fetchTopicsList={jest.fn()}
              deleteTopic={jest.fn()}
              clearTopicMessages={jest.fn()}
            />
          </ClusterContext.Provider>
        </StaticRouter>
      );
      expect(component.exists('Link')).toBeFalsy();
    });
  });

  describe('when it does not have readonly flag', () => {
    it('renders the Add a Topic button', () => {
      const component = mount(
        <StaticRouter>
          <ClusterContext.Provider
            value={{
              isReadOnly: false,
              hasKafkaConnectConfigured: true,
              hasSchemaRegistryConfigured: true,
            }}
          >
            <List
              areTopicsFetching={false}
              topics={[]}
              externalTopics={[]}
              totalPages={1}
              fetchTopicsList={jest.fn()}
              deleteTopic={jest.fn()}
              clearTopicMessages={jest.fn()}
            />
          </ClusterContext.Provider>
        </StaticRouter>
      );
      expect(component.exists('Link')).toBeTruthy();
    });
  });
});

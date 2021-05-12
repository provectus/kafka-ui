import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Details/Details';
import {
  internalTopicPayload,
  externalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';

describe('Details', () => {
  const mockDelete = jest.fn();
  const mockClusterName = 'local';
  const mockClearTopicMessages = jest.fn();
  const mockInternalTopicPayload = internalTopicPayload.internal;
  const mockExternalTopicPayload = externalTopicPayload.internal;

  describe('when it has readonly flag', () => {
    it('does not render the Action button a Topic', () => {
      const component = mount(
        <StaticRouter>
          <ClusterContext.Provider
            value={{
              isReadOnly: true,
              hasKafkaConnectConfigured: true,
              hasSchemaRegistryConfigured: true,
            }}
          >
            <Details
              clusterName={mockClusterName}
              topicName={internalTopicPayload.name}
              name={internalTopicPayload.name}
              isInternal={mockInternalTopicPayload}
              deleteTopic={mockDelete}
              clearTopicMessages={mockClearTopicMessages}
            />
          </ClusterContext.Provider>
        </StaticRouter>
      );

      expect(component.exists('button')).toBeFalsy();
    });
  });

  describe('when it does not have readonly flag', () => {
    it('renders the Action button a Topic', () => {
      const component = mount(
        <StaticRouter>
          <ClusterContext.Provider
            value={{
              isReadOnly: false,
              hasKafkaConnectConfigured: true,
              hasSchemaRegistryConfigured: true,
            }}
          >
            <Details
              clusterName={mockClusterName}
              topicName={internalTopicPayload.name}
              name={internalTopicPayload.name}
              isInternal={mockExternalTopicPayload}
              deleteTopic={mockDelete}
              clearTopicMessages={mockClearTopicMessages}
            />
          </ClusterContext.Provider>
        </StaticRouter>
      );

      expect(component.exists('button')).toBeTruthy();
    });
  });
});

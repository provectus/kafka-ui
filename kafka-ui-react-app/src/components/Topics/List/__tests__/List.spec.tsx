import { mount } from 'enzyme';
import React from 'react';
import ClusterContext from 'components/contexts/ClusterContext';
import List from '../List';

describe('List', () => {
  describe('when it has readonly flag', () => {
    it('does not render the Add a Topic button', () => {
      const props = {
        clusterName: 'Cluster',
        topics: [],
        externalTopics: [],
      };
      const component = mount(
        <ClusterContext.Provider value={{ isReadOnly: true }}>
          <List {...props} />
        </ClusterContext.Provider>
      );
      expect(component.exists('NavLink')).toBeFalsy();
    });
  });
});

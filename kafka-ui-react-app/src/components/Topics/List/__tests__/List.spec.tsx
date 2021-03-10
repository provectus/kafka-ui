import { mount } from 'enzyme';
import React from 'react';
import List from '../List';
import ReadOnlyContext from '../../../contexts/ReadOnlyContext';

describe('List', () => {
  describe('when it has readonly flag', () => {
    it('does not render the Add a Topic button', () => {
      const props = {
        clusterName: 'Cluster',
        topics: [],
        externalTopics: [],
      };
      const component = mount(
        <ReadOnlyContext.Provider value={{ isReadOnly: true }}>
          <List {...props} />
        </ReadOnlyContext.Provider>
      );
      expect(component.exists('NavLink')).toBeFalsy();
    });
  });
});

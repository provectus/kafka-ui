import { shallow } from 'enzyme';
import React from 'react';
import List from '../List';

describe('List', () => {
  describe('when it has readonly flag', () => {
    it('does not render the Add a Topic button', () => {
      const props = {
        clusterName: 'Cluster',
        topics: [],
        externalTopics: [],
        isReadOnly: true,
      };
      const component = shallow(<List {...props} />);
      expect(component.exists('NavLink')).toBeFalsy();
    });
  });
});

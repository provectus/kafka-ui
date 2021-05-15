import { shallow } from 'enzyme';
import React from 'react';
import MessageContent from 'components/Topics/Topic/Details/Messages/MessageContent';

import { messageContent } from './fixtures';

describe('MessageContent', () => {
  const component = shallow(<MessageContent message={messageContent} />);
  describe('when it is folded', () => {
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });

  describe('when it is unfolded', () => {
    it('matches the snapshot', () => {
      component.find('button').simulate('click');
      expect(component).toMatchSnapshot();
    });
  });
});

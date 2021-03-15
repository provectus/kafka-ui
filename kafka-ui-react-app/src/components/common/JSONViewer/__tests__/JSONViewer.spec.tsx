import { mount } from 'enzyme';
import React from 'react';
import JSONViewer from '../JSONViewer';

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe('JSONViewer', () => {
  describe('copying data', () => {
    jest.spyOn(navigator.clipboard, 'writeText');
    it('copies data to the clipboard', () => {
      const component = mount(<JSONViewer data={{ test: 'test' }} />);
      component.find('DynamicButton').simulate('click');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify({ test: 'test' })
      );
    });
  });
});

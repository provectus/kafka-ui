import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { schemas } from './fixtures';
import ListItem from '../ListItem';

describe('ListItem', () => {
  it('renders schemas', () => {
    const wrapper = mount(
      <Router>
        <ListItem subject={schemas[0]} />
      </Router>
    );

    expect(wrapper.find('NavLink').length).toEqual(1);
    expect(wrapper.find('td').length).toEqual(3);
  });

  it('matches snapshot', () => {
    expect(
      mount(
        <Router>
          <ListItem subject={schemas[0]} />
        </Router>
      )
    ).toMatchSnapshot();
  });
});

import { mount, shallow } from 'enzyme';
import React from 'react';
import Tabs from 'components/common/Tabs/Tabs';

describe('Tabs component', () => {
  const tabs: string[] = ['Tab 1', 'Tab 2', 'Tab 3'];

  const child1 = <div className="child_1" />;
  const child2 = <div className="child_2" />;
  const child3 = <div className="child_3" />;

  const component = mount(
    <Tabs tabs={tabs}>
      {child1}
      {child2}
      {child3}
    </Tabs>
  );

  it('renders the tabs with default index 0', () =>
    expect(component.find(`li`).at(0).hasClass('is-active')).toBeTruthy());
  it('renders the list of tabs', () => {
    component.find(`a`).forEach((link, idx) => {
      expect(link.contains(tabs[idx])).toBeTruthy();
    });
  });
  it('renders the children', () => {
    component.find(`a`).forEach((link, idx) => {
      link.simulate('click');
      expect(component.find(`.child_${idx + 1}`).exists()).toBeTruthy();
    });
  });
  it('matches the snapshot', () => {
    const shallowComponent = shallow(
      <Tabs tabs={tabs}>
        {child1}
        {child2}
        {child3}
      </Tabs>
    );
    expect(shallowComponent).toMatchSnapshot();
  });
});

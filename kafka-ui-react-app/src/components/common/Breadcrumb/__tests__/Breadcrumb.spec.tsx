import { mount, shallow } from 'enzyme';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Breadcrumb, {
  BreadcrumbItem,
} from 'components/common/Breadcrumb/Breadcrumb';

describe('Breadcrumb component', () => {
  const links: BreadcrumbItem[] = [
    {
      label: 'link1',
      href: 'link1href',
    },
    {
      label: 'link2',
      href: 'link2href',
    },
    {
      label: 'link3',
      href: 'link3href',
    },
  ];

  const child = <div className="child" />;

  const component = mount(
    <StaticRouter>
      <Breadcrumb links={links}>{child}</Breadcrumb>
    </StaticRouter>
  );

  it('renders the list of links', () => {
    component.find(`Link`).forEach((link, idx) => {
      expect(link.prop('to')).toEqual(links[idx].href);
      expect(link.contains(links[idx].label)).toBeTruthy();
    });
  });
  it('renders the children', () => {
    const list = component.find('ul').children();
    expect(list.last().containsMatchingElement(child)).toBeTruthy();
  });
  it('matches the snapshot', () => {
    const shallowComponent = shallow(
      <StaticRouter>
        <Breadcrumb links={links}>{child}</Breadcrumb>
      </StaticRouter>
    );
    expect(shallowComponent).toMatchSnapshot();
  });
});

import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import Pagination, {
  PaginationProps,
} from 'components/common/Pagination/Pagination';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('Pagination', () => {
  const setupWrapper = (search = '', props: Partial<PaginationProps> = {}) => (
    <ThemeProvider theme={theme}>
      <StaticRouter location={{ pathname: '/my/test/path/23', search }}>
        <Pagination totalPages={11} {...props} />
      </StaticRouter>
    </ThemeProvider>
  );

  describe('next & prev buttons', () => {
    it('renders disable prev button and enabled next link', () => {
      const wrapper = mount(setupWrapper('?page=1'));
      expect(wrapper.find('button.pagination-btn').instance()).toBeDisabled();
      expect(wrapper.exists('a.pagination-btn')).toBeTruthy();
    });

    it('renders disable next button and enabled prev link', () => {
      const wrapper = mount(setupWrapper('?page=11'));
      expect(wrapper.exists('a.pagination-btn')).toBeTruthy();
      expect(wrapper.exists('button.pagination-btn')).toBeTruthy();
    });

    it('renders next & prev links with correct path', () => {
      const wrapper = mount(setupWrapper('?page=5&perPage=20'));
      expect(wrapper.exists('a.pagination-btn')).toBeTruthy();
      expect(wrapper.find('a.pagination-btn').at(0).prop('href')).toEqual(
        '/my/test/path/23?page=4&perPage=20'
      );
      expect(wrapper.find('a.pagination-btn').at(1).prop('href')).toEqual(
        '/my/test/path/23?page=6&perPage=20'
      );
    });
  });

  describe('spread', () => {
    it('renders 1 spread element after first page control', () => {
      const wrapper = mount(setupWrapper('?page=8'));
      expect(wrapper.find('span.pagination-ellipsis').length).toEqual(1);
      expect(wrapper.find('ul li').at(1).text()).toEqual('…');
    });

    it('renders 1 spread element before last spread control', () => {
      const wrapper = mount(setupWrapper('?page=2'));
      expect(wrapper.find('span.pagination-ellipsis').length).toEqual(1);
      expect(wrapper.find('ul li').at(7).text()).toEqual('…');
    });

    it('renders 2 spread elements', () => {
      const wrapper = mount(setupWrapper('?page=6'));
      expect(wrapper.find('span.pagination-ellipsis').length).toEqual(2);
      expect(wrapper.find('ul li').at(0).text()).toEqual('1');
      expect(wrapper.find('ul li').at(1).text()).toEqual('…');
      expect(wrapper.find('ul li').at(7).text()).toEqual('…');
      expect(wrapper.find('ul li').at(8).text()).toEqual('11');
    });

    it('renders 0 spread elements', () => {
      const wrapper = mount(setupWrapper('?page=2', { totalPages: 8 }));
      expect(wrapper.find('span.pagination-ellipsis').length).toEqual(0);
      expect(wrapper.find('ul li').length).toEqual(8);
    });
  });

  describe('current page', () => {
    it('adds is-current class to correct page if page param is set', () => {
      const wrapper = mount(setupWrapper('?page=8'));
      expect(wrapper.exists('a.pagination-link.is-current')).toBeTruthy();
      expect(wrapper.find('a.pagination-link.is-current').text()).toEqual('8');
    });

    it('adds is-current class to correct page even if page param is not set', () => {
      const wrapper = mount(setupWrapper('', { totalPages: 8 }));
      expect(wrapper.exists('a.pagination-link.is-current')).toBeTruthy();
      expect(wrapper.find('a.pagination-link.is-current').text()).toEqual('1');
    });

    it('adds no is-current class if page numder is invalid', () => {
      const wrapper = mount(setupWrapper('?page=80'));
      expect(wrapper.exists('a.pagination-link.is-current')).toBeFalsy();
    });
  });
});

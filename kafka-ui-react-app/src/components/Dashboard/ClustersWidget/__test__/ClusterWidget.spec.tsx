import React from 'react';
import { shallow } from 'enzyme';
import { ServerStatus } from 'generated-sources';
import { clusterBrokersPath, clusterTopicsPath } from 'lib/paths';
import ClusterWidget from '../ClusterWidget';
import { offlineCluster, onlineCluster } from './fixtures';

describe('ClusterWidget', () => {
  describe('when cluster is online', () => {
    it('renders with correct tag', () => {
      const tag = shallow(<ClusterWidget cluster={onlineCluster} />).find(
        '.tag'
      );
      expect(tag.hasClass('is-primary')).toBeTruthy();
      expect(tag.text()).toEqual(ServerStatus.ONLINE);
    });

    it('renders table', () => {
      const table = shallow(<ClusterWidget cluster={onlineCluster} />).find(
        'table'
      );
      expect(table.hasClass('is-fullwidth')).toBeTruthy();

      expect(
        table.find(`NavLink[to="${clusterBrokersPath(onlineCluster.name)}"]`)
          .exists
      ).toBeTruthy();
      expect(
        table.find(`NavLink[to="${clusterTopicsPath(onlineCluster.name)}"]`)
          .exists
      ).toBeTruthy();
    });

    it('matches snapshot', () => {
      expect(
        shallow(<ClusterWidget cluster={onlineCluster} />)
      ).toMatchSnapshot();
    });
  });

  describe('when cluster is offline', () => {
    it('renders with correct tag', () => {
      const tag = shallow(<ClusterWidget cluster={offlineCluster} />).find(
        '.tag'
      );

      expect(tag.hasClass('is-danger')).toBeTruthy();
      expect(tag.text()).toEqual(ServerStatus.OFFLINE);
    });

    it('renders table', () => {
      const table = shallow(<ClusterWidget cluster={offlineCluster} />).find(
        'table'
      );
      expect(table.hasClass('is-fullwidth')).toBeTruthy();

      expect(
        table.find(`NavLink[to="${clusterBrokersPath(onlineCluster.name)}"]`)
          .exists
      ).toBeTruthy();
      expect(
        table.find(`NavLink[to="${clusterTopicsPath(onlineCluster.name)}"]`)
          .exists
      ).toBeTruthy();
    });

    it('matches snapshot', () => {
      expect(
        shallow(<ClusterWidget cluster={offlineCluster} />)
      ).toMatchSnapshot();
    });
  });
});

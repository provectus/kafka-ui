import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { StaticRouter } from 'react-router';
import DiffContainer from 'components/Schemas/Diff/DiffContainer';
import Diff, { DiffProps } from 'components/Schemas/Diff/Diff';

import { versions } from './fixtures';

const clusterName = 'testCluster';
const subject = 'test';
const mockStore = configureStore();

describe('Diff', () => {
  describe('Container', () => {
    const initialState: Partial<DiffProps> = {};
    const store = mockStore(initialState);

    it('renders view', () => {
      const wrapper = mount(
        <Provider store={store}>
          <StaticRouter>
            <Diff
              versions={versions}
              clusterName={clusterName}
              leftVersionInPath=""
              rightVersionInPath=""
              subject={subject}
              areVersionsFetched
            />
          </StaticRouter>
        </Provider>
      );

      expect(wrapper.exists(Diff)).toBeTruthy();
    });
  });

  describe('View', () => {
    const setupWrapper = (props: Partial<DiffProps> = {}) => (
      <Diff
        subject={subject}
        clusterName={clusterName}
        areVersionsFetched
        versions={[]}
        {...props}
      />
    );

    // describe('Initial state', () => {
    //   it('should call fetchSchemaVersions every render', () => {
    //     mount(
    //       <StaticRouter>
    //         {setupWrapper({ fetchSchemaVersions: fetchSchemaVersionsMock })}
    //       </StaticRouter>
    //     );

    //     expect(fetchSchemaVersionsMock).toHaveBeenCalledWith(
    //       clusterName,
    //       subject
    //     );
    //   });

    //   it('matches snapshot', () => {
    //     expect(
    //       shallow(
    //         setupWrapper({ fetchSchemaVersions: fetchSchemaVersionsMock })
    //       )
    //     ).toMatchSnapshot();
    //   });
    // });

    describe('when page with schema versions is loading', () => {
      const wrapper = shallow(setupWrapper({ areVersionsFetched: false }));

      it('renders PageLoader', () => {
        expect(wrapper.exists('PageLoader')).toBeTruthy();
      });

      it('matches snapshot', () => {
        expect(
          shallow(setupWrapper({ areVersionsFetched: false }))
        ).toMatchSnapshot();
      });
    });

    describe('when schema versions are loaded and no specified versions in path', () => {
      const wrapper = shallow(setupWrapper({ versions }));

      it('renders all options', () => {
        expect(wrapper.find('option')).toHaveLength(6);
      });

      it('renders left select with empty value', () => {
        expect(wrapper.find('#left-select')).toHaveLength(1);
        expect(wrapper.find('#left-select').props().defaultValue).toBe('');
      });

      it('renders right select with empty value', () => {
        expect(wrapper.find('#right-select')).toHaveLength(1);
        expect(wrapper.find('#right-select').props().defaultValue).toBe('');
      });

      it('matches snapshot', () => {
        expect(wrapper).toMatchSnapshot();
      });

      it('renders JSONDiffViewer with latest version on both sides', () => {
        expect(wrapper.exists('JSONDiffViewer')).toBeTruthy();
        expect(wrapper.find('JSONDiffViewer').props().value).toStrictEqual([
          versions[0].schema,
          versions[0].schema,
        ]);
      });
    });

    describe('when schema versions are loaded and two versions in path', () => {
      const wrapper = shallow(
        setupWrapper({
          versions,
          leftVersionInPath: '1',
          rightVersionInPath: '2',
        })
      );

      it('renders left select with version 1', () => {
        expect(wrapper.find('#left-select')).toHaveLength(1);
        expect(wrapper.find('#left-select').props().defaultValue).toBe('1');
      });

      it('renders right select with version 2', () => {
        expect(wrapper.find('#right-select')).toHaveLength(1);
        expect(wrapper.find('#right-select').props().defaultValue).toBe('2');
      });

      it('matches snapshot', () => {
        expect(wrapper).toMatchSnapshot();
      });

      it('renders JSONDiffViewer with version 1 at left, version 2 at right', () => {
        expect(wrapper.exists('JSONDiffViewer')).toBeTruthy();
        expect(wrapper.find('JSONDiffViewer').props().value).toStrictEqual([
          JSON.stringify(JSON.parse(versions[2].schema), null, '\t'),
          JSON.stringify(JSON.parse(versions[1].schema), null, '\t'),
        ]);
      });
    });

    describe('when schema versions are loaded and only one versions in path', () => {
      const wrapper = shallow(
        setupWrapper({
          versions,
          leftVersionInPath: '1',
        })
      );

      it('renders left select with version 1', () => {
        expect(wrapper.find('#left-select')).toHaveLength(1);
        expect(wrapper.find('#left-select').props().defaultValue).toBe('1');
      });

      it('renders right select with empty value', () => {
        expect(wrapper.find('#right-select')).toHaveLength(1);
        expect(wrapper.find('#right-select').props().defaultValue).toBe('');
      });

      it('renders JSONDiffViewer with version 1 at left, version 3 at right', () => {
        expect(wrapper.exists('JSONDiffViewer')).toBeTruthy();
        expect(wrapper.find('JSONDiffViewer').props().value).toStrictEqual([
          JSON.stringify(JSON.parse(versions[2].schema), null, '\t'),
          versions[0].schema,
        ]);
      });

      it('matches snapshot', () => {
        expect(wrapper).toMatchSnapshot();
      });
    });
  });
});

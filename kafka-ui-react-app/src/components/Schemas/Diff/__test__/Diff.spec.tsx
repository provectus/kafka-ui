import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { StaticRouter } from 'react-router';
import Diff, { DiffProps } from 'components/Schemas/Diff/Diff';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import thunk from 'redux-thunk';

import { versions } from './fixtures';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Diff', () => {
  const initialState: Partial<DiffProps> = {};
  const store = mockStore(initialState);

  const setupComponent = (props: DiffProps) =>
    render(
      <Provider store={store}>
        <StaticRouter>
          <Diff
            versions={props.versions}
            leftVersionInPath={props.leftVersionInPath}
            rightVersionInPath={props.rightVersionInPath}
            areVersionsFetched={props.areVersionsFetched}
          />
        </StaticRouter>
      </Provider>
    );
  describe('Container', () => {
    it('renders view', () => {
      setupComponent({
        areVersionsFetched: true,
        versions,
      });
    });
  });

  describe('View', () => {
    setupComponent({
      areVersionsFetched: true,
      versions,
    });
  });
  describe('when page with schema versions is loading', () => {
    beforeAll(() => {
      setupComponent({
        areVersionsFetched: false,
        versions: [],
      });
    });
    it('renders PageLoader', () => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('when schema versions are loaded and no specified versions in path', () => {
    beforeEach(() => {
      setupComponent({
        areVersionsFetched: true,
        versions,
      });
    });

    it('renders all options', () => {
      const selectedOption = screen.getAllByRole('option');
      expect(selectedOption.length).toEqual(2);
    });
    it('renders left select with empty value', () => {
      const select = screen.getAllByRole('listbox')[0];
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent(versions[0].version);
    });

    it('renders right select with empty value', () => {
      const select = screen.getAllByRole('listbox')[1];
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent(versions[0].version);
    });
  });
  describe('when schema versions are loaded and two versions in path', () => {
    beforeEach(() => {
      setupComponent({
        areVersionsFetched: true,
        versions,
        leftVersionInPath: '1',
        rightVersionInPath: '2',
      });
    });

    it('renders left select with version 1', () => {
      const select = screen.getAllByRole('listbox')[0];
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent('1');
    });

    it('renders right select with version 2', () => {
      const select = screen.getAllByRole('listbox')[1];
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent('2');
    });
  });

  describe('when schema versions are loaded and only one versions in path', () => {
    beforeEach(() => {
      setupComponent({
        areVersionsFetched: true,
        versions,
        leftVersionInPath: '1',
      });
    });

    it('renders left select with version 1', () => {
      const select = screen.getAllByRole('listbox')[0];
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent('1');
    });

    it('renders right select with empty value', () => {
      const select = screen.getAllByRole('listbox')[1];
      expect(select).toBeInTheDocument();
      expect(select).toHaveTextContent(versions[0].version);
    });
  });
});

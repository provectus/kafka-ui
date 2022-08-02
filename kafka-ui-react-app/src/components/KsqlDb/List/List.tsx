import React, { FC } from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import * as Metrics from 'components/common/Metrics';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';
import {
  clusterKsqlDbQueryRelativePath,
  ClusterNameRoute,
  clusterKsqlDbStreamsPath,
  clusterKsqlDbTablesPath,
  clusterKsqlDbStreamsRelativePath,
  clusterKsqlDbTablesRelativePath,
} from 'lib/paths';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import Navbar from 'components/common/Navigation/Navbar.styled';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { fetchKsqlDbTables } from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';

import KsqlDbItem, { KsqlDbItemType } from './KsqlDbItem/KsqlDbItem';

const List: FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const dispatch = useAppDispatch();

  const { rows, fetching, tablesCount, streamsCount } =
    useAppSelector(getKsqlDbTables);

  React.useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, [clusterName, dispatch]);

  return (
    <>
      <PageHeading text="KSQL DB">
        <Button
          to={clusterKsqlDbQueryRelativePath}
          buttonType="primary"
          buttonSize="M"
        >
          Execute KSQL Request
        </Button>
      </PageHeading>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Tables" title="Tables" fetching={fetching}>
            {tablesCount}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="Streams"
            title="Streams"
            fetching={fetching}
          >
            {streamsCount}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <div>
        <Navbar role="navigation">
          <NavLink
            to={clusterKsqlDbTablesPath(clusterName)}
            className={({ isActive }) => (isActive ? 'is-active' : '')}
            end
          >
            Tables
          </NavLink>
          <NavLink
            to={clusterKsqlDbStreamsPath(clusterName)}
            className={({ isActive }) => (isActive ? 'is-active' : '')}
            end
          >
            Streams
          </NavLink>
        </Navbar>
        <Routes>
          <Route
            index
            element={<Navigate to={clusterKsqlDbTablesRelativePath} />}
          />
          <Route
            path={clusterKsqlDbTablesRelativePath}
            element={
              <KsqlDbItem
                type={KsqlDbItemType.Tables}
                fetching={fetching}
                rows={rows}
              />
            }
          />
          <Route
            path={clusterKsqlDbStreamsRelativePath}
            element={
              <KsqlDbItem
                type={KsqlDbItemType.Streams}
                fetching={fetching}
                rows={rows}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default List;

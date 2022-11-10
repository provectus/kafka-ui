import React, { FC } from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import * as Metrics from 'components/common/Metrics';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';
import {
  clusterKsqlDbQueryRelativePath,
  clusterKsqlDbStreamsPath,
  clusterKsqlDbStreamsRelativePath,
  clusterKsqlDbTablesPath,
  clusterKsqlDbTablesRelativePath,
  ClusterNameRoute,
} from 'lib/paths';
import PageHeading from 'components/common/PageHeading/PageHeading';
import ActionButton from 'components/common/ActionButton/ActionButton';
import Navbar from 'components/common/Navigation/Navbar.styled';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { fetchKsqlDbTables } from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import { usePermission } from 'lib/hooks/usePermission';
import { Action, UserPermissionResourceEnum } from 'generated-sources';

import KsqlDbItem, { KsqlDbItemType } from './KsqlDbItem/KsqlDbItem';

const List: FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const dispatch = useAppDispatch();
  const canExecuteKSQLRequest = usePermission(
    UserPermissionResourceEnum.KSQL,
    Action.EXECUTE
  );

  const { rows, fetching, tablesCount, streamsCount } =
    useAppSelector(getKsqlDbTables);

  React.useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, [clusterName, dispatch]);

  return (
    <>
      <PageHeading text="KSQL DB">
        <ActionButton
          to={clusterKsqlDbQueryRelativePath}
          buttonType="primary"
          buttonSize="M"
          canDoAction={canExecuteKSQLRequest}
        >
          Execute KSQL Request
        </ActionButton>
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

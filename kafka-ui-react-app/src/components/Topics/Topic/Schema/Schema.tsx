import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';
import {
  fetchLatestSchema,
  getSchemaLatest,
  getAreSchemaLatestFulfilled,
  getAreSchemaLatestRejected,
  SCHEMA_LATEST_FETCH_ACTION,
} from 'redux/reducers/schemas/schemasSlice';
import LatestVersionItem from '../../../Schemas/Details/LatestVersion/LatestVersionItem';
import PageLoader from 'components/common/PageLoader/PageLoader';

import * as S from './Schema.styled';

export enum SchemaType {
  Value,
  Key,
}

interface SchemaProps {
  type: SchemaType;
}

export const Schema: React.FC<SchemaProps> = ({ type }) => {
  const dispatch = useAppDispatch();
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const subject = topicName + '-' + SchemaType[type].toLowerCase();
  React.useEffect(() => {
    dispatch(fetchLatestSchema({ clusterName, subject }));
    return () => {
      dispatch(resetLoaderById(SCHEMA_LATEST_FETCH_ACTION));
    };
  }, [clusterName, dispatch, subject]);

  const schema = useAppSelector(getSchemaLatest);
  const isFetched = useAppSelector(getAreSchemaLatestFulfilled);
  const isRejected = useAppSelector(getAreSchemaLatestRejected);

  if (!isFetched && !isRejected) {
    return <PageLoader />;
  }

  if (isRejected || !schema) {
    return (
      <S.Wrapper>
        <p>
          No {SchemaType[type].toLowerCase()} schema available for {topicName} at {clusterName}
        </p>
      </S.Wrapper>
    );
  }

  return <LatestVersionItem schema={schema} />;
};

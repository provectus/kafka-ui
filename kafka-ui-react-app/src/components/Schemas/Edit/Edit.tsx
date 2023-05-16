import React from 'react';
import { ClusterSubjectParam } from 'lib/paths';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import {
  fetchLatestSchema,
  getSchemaLatest,
  SCHEMA_LATEST_FETCH_ACTION,
  getAreSchemaLatestFulfilled,
} from 'redux/reducers/schemas/schemasSlice';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';

import Form from './Form';

const Edit: React.FC = () => {
  const dispatch = useAppDispatch();

  const { clusterName, subject } = useAppParams<ClusterSubjectParam>();

  React.useEffect(() => {
    dispatch(fetchLatestSchema({ clusterName, subject }));
    return () => {
      dispatch(resetLoaderById(SCHEMA_LATEST_FETCH_ACTION));
    };
  }, [clusterName, dispatch, subject]);

  const schema = useAppSelector((state) => getSchemaLatest(state));
  const isFetched = useAppSelector(getAreSchemaLatestFulfilled);

  if (!isFetched || !schema) {
    return <PageLoader />;
  }
  return <Form />;
};

export default Edit;

import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { clusterSchemaSchemaDiffPath } from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';
import { useHistory, useParams, useLocation } from 'react-router';
import {
  fetchSchemaVersions,
  SCHEMAS_VERSIONS_FETCH_ACTION,
} from 'redux/reducers/schemas/schemasSlice';
import { useForm, Controller } from 'react-hook-form';
import Select from 'components/common/Select/Select';
import { useAppDispatch } from 'lib/hooks/redux';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';

import * as S from './Diff.styled';

export interface DiffProps {
  leftVersionInPath?: string;
  rightVersionInPath?: string;
  versions: SchemaSubject[];
  areVersionsFetched: boolean;
}

const Diff: React.FC<DiffProps> = ({
  leftVersionInPath,
  rightVersionInPath,
  versions,
  areVersionsFetched,
}) => {
  const [leftVersion, setLeftVersion] = React.useState(leftVersionInPath || '');
  const [rightVersion, setRightVersion] = React.useState(
    rightVersionInPath || ''
  );
  const history = useHistory();
  const location = useLocation();

  const { clusterName, subject } =
    useParams<{ clusterName: string; subject: string }>();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchSchemaVersions({ clusterName, subject }));
    return () => {
      dispatch(resetLoaderById(SCHEMAS_VERSIONS_FETCH_ACTION));
    };
  }, [clusterName, subject, dispatch]);

  const getSchemaContent = (allVersions: SchemaSubject[], version: string) => {
    const selectedSchema =
      allVersions.find((s) => s.version === version)?.schema ||
      (allVersions.length ? allVersions[0].schema : '');
    return selectedSchema.trim().startsWith('{')
      ? JSON.stringify(JSON.parse(selectedSchema), null, '\t')
      : selectedSchema;
  };
  const getSchemaType = (allVersions: SchemaSubject[]) => {
    return allVersions[0].schemaType;
  };

  const methods = useForm({ mode: 'onChange' });
  const {
    formState: { isSubmitting },
    control,
  } = methods;

  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );

  return (
    <S.Section>
      {areVersionsFetched ? (
        <S.DiffBox>
          <S.DiffTilesWrapper>
            <S.DiffTile>
              <S.DiffVersionsSelect>
                <Controller
                  defaultValue={leftVersion}
                  control={control}
                  rules={{ required: true }}
                  name="schemaType"
                  render={({ field: { name } }) => (
                    <Select
                      id="left-select"
                      name={name}
                      value={
                        leftVersion === '' ? versions[0].version : leftVersion
                      }
                      onChange={(event) => {
                        history.push(
                          clusterSchemaSchemaDiffPath(clusterName, subject)
                        );
                        searchParams.set('leftVersion', event.toString());
                        searchParams.set(
                          'rightVersion',
                          rightVersion === ''
                            ? versions[0].version
                            : rightVersion
                        );
                        history.push({
                          search: `?${searchParams.toString()}`,
                        });
                        setLeftVersion(event.toString());
                      }}
                      minWidth="100%"
                      disabled={isSubmitting}
                      options={versions.map((type) => ({
                        value: type.version,
                        label: `Version ${type.version}`,
                      }))}
                    />
                  )}
                />
              </S.DiffVersionsSelect>
            </S.DiffTile>
            <S.DiffTile>
              <S.DiffVersionsSelect>
                <Controller
                  defaultValue={rightVersion}
                  control={control}
                  rules={{ required: true }}
                  name="schemaType"
                  render={({ field: { name } }) => (
                    <Select
                      id="right-select"
                      name={name}
                      value={
                        rightVersion === '' ? versions[0].version : rightVersion
                      }
                      onChange={(event) => {
                        history.push(
                          clusterSchemaSchemaDiffPath(clusterName, subject)
                        );
                        searchParams.set(
                          'leftVersion',
                          leftVersion === '' ? versions[0].version : leftVersion
                        );
                        searchParams.set('rightVersion', event.toString());
                        history.push({
                          search: `?${searchParams.toString()}`,
                        });
                        setRightVersion(event.toString());
                      }}
                      minWidth="100%"
                      disabled={isSubmitting}
                      options={versions.map((type) => ({
                        value: type.version,
                        label: `Version ${type.version}`,
                      }))}
                    />
                  )}
                />
              </S.DiffVersionsSelect>
            </S.DiffTile>
          </S.DiffTilesWrapper>
          <S.DiffWrapper>
            <DiffViewer
              value={[
                getSchemaContent(versions, leftVersion),
                getSchemaContent(versions, rightVersion),
              ]}
              setOptions={{
                autoScrollEditorIntoView: true,
              }}
              isFixedHeight={false}
              schemaType={getSchemaType(versions)}
            />
          </S.DiffWrapper>
        </S.DiffBox>
      ) : (
        <PageLoader />
      )}
    </S.Section>
  );
};

export default Diff;

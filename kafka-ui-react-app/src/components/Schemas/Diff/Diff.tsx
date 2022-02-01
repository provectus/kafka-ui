import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import { clusterSchemaSchemaDiffPath } from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';
import { useHistory } from 'react-router';
import { fetchSchemaVersions } from 'redux/reducers/schemas/schemasSlice';
import { useForm, Controller } from 'react-hook-form';
import Select from 'components/common/Select/Select';

import * as S from './Diff.styled';

export interface DiffProps {
  subject: SchemaName;
  clusterName: ClusterName;
  leftVersionInPath?: string;
  rightVersionInPath?: string;
  versions: SchemaSubject[];
  areVersionsFetched: boolean;
}

const Diff: React.FC<DiffProps> = ({
  subject,
  clusterName,
  leftVersionInPath,
  rightVersionInPath,
  versions,
  areVersionsFetched,
}) => {
  const [leftVersion, setLeftVersion] = React.useState(leftVersionInPath || '');
  const [rightVersion, setRightVersion] = React.useState(
    rightVersionInPath || ''
  );
  React.useEffect(() => {
    fetchSchemaVersions({ clusterName, subject });
  }, [fetchSchemaVersions, clusterName]);

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
  const history = useHistory();

  const methods = useForm({ mode: 'onChange' });
  const {
    formState: { isSubmitting },
    control,
  } = methods;

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
                      value={leftVersion}
                      onChange={(event) => {
                        history.push(
                          clusterSchemaSchemaDiffPath(
                            clusterName,
                            subject,
                            event.toString(),
                            !rightVersion && versions.length
                              ? versions[0].version
                              : rightVersion
                          )
                        );
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
                      value={rightVersion}
                      onChange={(event) => {
                        history.push(
                          clusterSchemaSchemaDiffPath(
                            clusterName,
                            subject,
                            event.toString(),
                            !rightVersion && versions.length
                              ? versions[0].version
                              : rightVersion
                          )
                        );
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

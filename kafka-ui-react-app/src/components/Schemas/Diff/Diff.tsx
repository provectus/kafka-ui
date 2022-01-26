import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import { clusterSchemaSchemaDiffPath } from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';
import { useHistory } from 'react-router';
import { fetchSchemaVersions } from 'redux/reducers/schemas/schemasSlice';

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
  const history = useHistory();

  return (
    <div className="section">
      {areVersionsFetched ? (
        <div className="box tile is-ancestor is-vertical">
          <div className="tile">
            <div className="tile is-6">
              <div className="select">
                <select
                  id="left-select"
                  defaultValue={leftVersion}
                  onChange={(event) => {
                    history.push(
                      clusterSchemaSchemaDiffPath(
                        clusterName,
                        subject,
                        event.target.value,
                        !rightVersion && versions.length
                          ? versions[0].version
                          : rightVersion
                      )
                    );
                    setLeftVersion(event.target.value);
                  }}
                >
                  {versions.map((version) => (
                    <option
                      key={`left-${version.version}`}
                      value={version.version}
                    >
                      {`Version ${version.version}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="tile is-6">
              <div className="select">
                <select
                  id="right-select"
                  defaultValue={rightVersion}
                  onChange={(event) => {
                    history.push(
                      clusterSchemaSchemaDiffPath(
                        clusterName,
                        subject,
                        !leftVersion && versions.length
                          ? versions[0].version
                          : leftVersion,
                        event.target.value
                      )
                    );
                    setRightVersion(event.target.value);
                  }}
                >
                  {versions.map((version) => (
                    <option
                      key={`right-${version.version}`}
                      value={version.version}
                    >
                      {`Version ${version.version}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
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
            />
          </S.DiffWrapper>
        </div>
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default Diff;

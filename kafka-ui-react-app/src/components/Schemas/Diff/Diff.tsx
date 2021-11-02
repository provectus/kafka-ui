import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import {
  clusterSchemasPath,
  clusterSchemaPath,
  clusterSchemaSchemaDiffPath,
} from 'lib/paths';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import PageLoader from 'components/common/PageLoader/PageLoader';
import JSONDiffViewer from 'components/common/JSONDiffViewer/JSONDiffViewer';
import { useHistory } from 'react-router';

export interface DiffProps {
  subject: SchemaName;
  clusterName: ClusterName;
  leftVersionInPath?: string;
  rightVersionInPath?: string;
  versions: SchemaSubject[];
  areVersionsFetched: boolean;
  fetchSchemaVersions: (
    clusterName: ClusterName,
    schemaName: SchemaName
  ) => void;
}

const Diff: React.FC<DiffProps> = ({
  subject,
  clusterName,
  leftVersionInPath,
  rightVersionInPath,
  fetchSchemaVersions,
  versions,
  areVersionsFetched,
}) => {
  const [leftVersion, setLeftVersion] = React.useState(leftVersionInPath || '');
  const [rightVersion, setRightVersion] = React.useState(
    rightVersionInPath || ''
  );

  React.useEffect(() => {
    fetchSchemaVersions(clusterName, subject);
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
      <div className="level">
        <Breadcrumb
          links={[
            {
              href: clusterSchemasPath(clusterName),
              label: 'Schema Registry',
            },
            {
              href: clusterSchemaPath(clusterName, subject),
              label: subject,
            },
          ]}
        >
          Compare Versions
        </Breadcrumb>
      </div>
      {areVersionsFetched ? (
        <>
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
            <div className="tile pt-5">
              <JSONDiffViewer
                value={[
                  getSchemaContent(versions, leftVersion),
                  getSchemaContent(versions, rightVersion),
                ]}
                setOptions={{
                  autoScrollEditorIntoView: true,
                }}
                isFixedHeight={false}
              />
            </div>
          </div>
        </>
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default Diff;

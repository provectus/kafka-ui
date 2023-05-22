import React from 'react';
import WarningIcon from 'components/common/Icons/WarningIcon';
import { gitCommitPath } from 'lib/paths';
import { useLatestVersion } from 'lib/hooks/api/latestVersion';
import { formatTimestamp } from 'lib/dateTimeHelpers';

import * as S from './Version.styled';

const Version: React.FC = () => {
  const { data: latestVersionInfo = {} } = useLatestVersion();
  const { buildTime, commitId, isLatestRelease, version } =
    latestVersionInfo.build;
  const { versionTag } = latestVersionInfo?.latestRelease || '';

  const currentVersion =
    isLatestRelease && version?.match(versionTag)
      ? versionTag
      : formatTimestamp(buildTime);

  return (
    <S.Wrapper>
      {!isLatestRelease && (
        <S.OutdatedWarning
          title={`Your app version is outdated. Latest version is ${
            versionTag || 'UNKNOWN'
          }`}
        >
          <WarningIcon />
        </S.OutdatedWarning>
      )}

      {commitId && (
        <div>
          <S.CurrentCommitLink
            title="Current commit"
            target="__blank"
            href={gitCommitPath(commitId)}
          >
            {commitId}
          </S.CurrentCommitLink>
        </div>
      )}
      <S.CurrentVersion>{currentVersion}</S.CurrentVersion>
    </S.Wrapper>
  );
};

export default Version;

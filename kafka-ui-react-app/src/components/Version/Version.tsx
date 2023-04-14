import React from 'react';
import WarningIcon from 'components/common/Icons/WarningIcon';
import { gitCommitPath } from 'lib/paths';
import { useLatestVersion } from 'lib/hooks/api/latestVersion';

import * as S from './Version.styled';

const Version: React.FC = () => {
  const { data: latestVersionInfo = {} } = useLatestVersion();
  const { buildTime, commitId, isLatestRelease } = latestVersionInfo.build;
  const { versionTag } = latestVersionInfo.latestRelease;

  return (
    <S.Wrapper>
      {isLatestRelease && (
        <S.OutdatedWarning
          title={`Your app version is outdated. Current latest version is ${versionTag}`}
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
      <S.CurrentVersion>{buildTime}</S.CurrentVersion>
    </S.Wrapper>
  );
};

export default Version;

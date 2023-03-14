import React from 'react';
import WarningIcon from 'components/common/Icons/WarningIcon';
import { gitCommitPath } from 'lib/paths';
import { useActuatorInfo } from 'lib/hooks/api/actuatorInfo';
import { BUILD_VERSION_PATTERN } from 'lib/constants';
import { useLatestVersion } from 'lib/hooks/api/latestVersion';
import { formatTimestamp } from 'lib/dateTimeHelpers';

import * as S from './Version.styled';
import compareVersions from './compareVersions';

const Version: React.FC = () => {
  const { data: actuatorInfo = {} } = useActuatorInfo();
  const { data: latestVersionInfo = {} } = useLatestVersion();

  const tag = actuatorInfo?.build?.version;
  const commit = actuatorInfo?.git?.commit.id;
  const { tag_name: latestTag } = latestVersionInfo;

  const outdated = compareVersions(tag, latestTag);

  const currentVersion = tag?.match(BUILD_VERSION_PATTERN)
    ? tag
    : formatTimestamp(actuatorInfo?.build?.time);

  if (!tag) return null;

  return (
    <S.Wrapper>
      <S.CurrentVersion>{currentVersion}</S.CurrentVersion>

      {!!outdated && (
        <S.OutdatedWarning
          title={`Your app version is outdated. Current latest version is ${latestTag}`}
        >
          <WarningIcon />
        </S.OutdatedWarning>
      )}

      {commit && (
        <>
          <S.SymbolWrapper>&#40;</S.SymbolWrapper>
          <S.CurrentCommitLink
            title="Current commit"
            target="__blank"
            href={gitCommitPath(commit)}
          >
            {commit}
          </S.CurrentCommitLink>
          <S.SymbolWrapper>&#41;</S.SymbolWrapper>
        </>
      )}
    </S.Wrapper>
  );
};

export default Version;

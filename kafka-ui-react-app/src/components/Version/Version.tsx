import React, { useEffect, useState } from 'react';
import WarningIcon from 'components/common/Icons/WarningIcon';
import { gitCommitPath } from 'lib/paths';
import { useTimeFormat } from 'lib/hooks/useTimeFormat';
import { useActuatorInfoStats } from 'lib/hooks/api/actuatorInfo';
import { GIT_REPO_LATEST_RELEASE_LINK, VERSION_PATTERN } from 'lib/constants';

import compareVersions from './compareVersions';
import * as S from './Version.styled';

export interface VesionProps {
  tag: string;
  commit?: string;
}

const Version: React.FC = () => {
  const { data: actuatorInfo } = useActuatorInfoStats();

  const [latestVersionInfo, setLatestVersionInfo] = useState({
    outdated: false,
    latestTag: '',
  });

  const commit = actuatorInfo.git.commit.id;
  const { time, version: tag } = actuatorInfo.build;
  const dateTime = useTimeFormat(time);
  const { outdated, latestTag } = latestVersionInfo;

  const currentVersion = tag.match(VERSION_PATTERN) ? tag : dateTime;

  useEffect(() => {
    fetch(GIT_REPO_LATEST_RELEASE_LINK)
      .then((response) => response.json())
      .then((data) => {
        setLatestVersionInfo({
          outdated: compareVersions(tag, data.tag_name) === -1,
          latestTag: data.tag_name,
        });
      });
  }, [tag]);

  return (
    <S.Wrapper>
      {tag && (
        <>
          <S.CurrentVersion>{currentVersion}</S.CurrentVersion>

          {outdated && (
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
        </>
      )}
    </S.Wrapper>
  );
};

export default Version;

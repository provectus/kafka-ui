import React, { useEffect, useState } from 'react';
import { gitCommitPath } from 'lib/paths';
import { GIT_REPO_LATEST_RELEASE_LINK } from 'lib/constants';
import WarningIcon from 'components/common/Icons/WarningIcon';
import dayjs from 'dayjs';

import * as S from './Version.styled';
import compareVersions from './compareVersions';

export interface VesionProps {
  tag: string;
  commit?: string;
}

const Version: React.FC<VesionProps> = ({ tag, commit }) => {
  const [latestVersionInfo, setLatestVersionInfo] = useState({
    outdated: false,
    latestTag: '',
    date: '',
  });

  useEffect(() => {
    fetch(GIT_REPO_LATEST_RELEASE_LINK)
      .then((response) => response.json())
      .then((data) => {
        setLatestVersionInfo({
          outdated: compareVersions(tag, data.tag_name) === -1,
          latestTag: data.tag_name,
          date: dayjs(data.published_at).format('MM.DD.YYYY HH:mm:ss'),
        });
      });
  }, [tag]);

  const { outdated, latestTag, date } = latestVersionInfo;
  return (
    <S.Wrapper>
      <S.CurrentVersion>{date}</S.CurrentVersion>

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
    </S.Wrapper>
  );
};

export default Version;

import React, { useState, useEffect } from 'react';
import WarningIcon from 'components/common/Icons/WarningIcon';
import { gitCommitPath } from 'lib/paths';
import { useLatestVersion } from 'lib/hooks/api/latestVersion';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { PreferencesApi } from '../../generated-sources';
import * as S from './Version.styled';
import { preferencesClient as api } from 'lib/api';

const Version: React.FC = () => {
  const [showVersion, setShowVersion] = useState(true);
  const [latestVersionInfo, setLatestVersionInfo] = useState<any>({});

  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const preferencesData = await api.getPreferences();
        const latestVersionInfo = preferencesData?.version || {};
        setLatestVersionInfo(latestVersionInfo);
        setShowVersion(preferencesData?.version || true); // Set showVersion based on the preferences data
      } catch (error) {
        console.error('Error fetching latest version:', error);
        setShowVersion(false); // Set showVersion to false in case of error
      }
    };

    fetchLatestVersion();
  }, []);

  const { buildTime, commitId, isLatestRelease, version, versionTag } = latestVersionInfo;

  const currentVersion =
    isLatestRelease && version?.match(versionTag)
      ? versionTag
      : formatTimestamp(buildTime);

  return showVersion ? (
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
  ) : null;
};

export default Version;

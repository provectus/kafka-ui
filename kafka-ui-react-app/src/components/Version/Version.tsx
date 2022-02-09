import React, { useEffect, useState } from 'react';
import { gitCommitPath } from 'lib/paths';
import { GIT_REPO_LATEST_RELEASE_LINK } from 'lib/constants';
import WarningIcon from 'components/common/Icons/WarningIcon';

import compareVersions from './compareVersions';

export interface VesionProps {
  tag: string;
  commit?: string;
}

const Version: React.FC<VesionProps> = ({ tag, commit }) => {
  const [latestVersionInfo, setLatestVersionInfo] = useState({
    outdated: false,
    latestTag: '',
  });
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

  const { outdated, latestTag } = latestVersionInfo;

  return (
    <div className="is-size-8 has-text-grey">
      <span className="has-text-grey-light mr-1">Version:</span>
      <span className="mr-1">{tag}</span>
      {outdated && (
        <span
          title={`Your app version is outdated. Current latest version is ${latestTag}`}
        >
          <WarningIcon />
        </span>
      )}
      {commit && (
        <>
          <span>&#40;</span>
          <a
            title="Current commit"
            target="__blank"
            href={gitCommitPath(commit)}
          >
            {commit}
          </a>
          <span>&#41;</span>
        </>
      )}
    </div>
  );
};

export default Version;

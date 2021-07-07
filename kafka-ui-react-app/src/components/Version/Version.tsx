import React, { useEffect, useState } from 'react';
import { gitCommitPath } from 'lib/paths';
import { GIT_REPO_LATEST_RELEASE_LINK } from 'lib/constants';

import compareVersions from './compareVersions';

export interface VesionProps {
  tag?: string;
  commit?: string;
}

const Version: React.FC<VesionProps> = ({ tag, commit }) => {
  const [latestTag, setLatestTag] = useState<string>('');
  useEffect(() => {
    if (tag) {
      fetch(GIT_REPO_LATEST_RELEASE_LINK)
        .then((response) => response.json())
        .then((data) => {
          setLatestTag(data.tag_name);
        });
    }
  }, [tag]);
  if (!tag) {
    return null;
  }

  const outdated = compareVersions(tag, latestTag) === -1;
  return (
    <div className="is-size-7 has-text-grey">
      <span className="has-text-grey-light mr-1">Version:</span>
      <span className="mr-1">{tag}</span>
      {outdated && (
        <span
          className="icon has-text-warning"
          title={`Your app version is outdated. Current latest version is ${latestTag}`}
        >
          <i className="fas fa-exclamation-triangle" />
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

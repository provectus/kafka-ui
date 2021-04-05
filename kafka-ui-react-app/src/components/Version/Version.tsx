import React from 'react';
import { GIT_REPO_LINK } from 'lib/constants';

export interface VesionProps {
  tag?: string;
  commit?: string;
}

const Version: React.FC<VesionProps> = ({ tag, commit }) => {
  if (!tag) {
    return null;
  }

  return (
    <div className="is-size-7 has-text-grey">
      <span className="has-text-grey-light mr-1">Version:</span>
      <span className="mr-1">{tag}</span>
      {commit && (
        <>
          <span>&#40;</span>
          <a
            title="Current commit"
            target="__blank"
            href={`${GIT_REPO_LINK}/commit/${commit}`}
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

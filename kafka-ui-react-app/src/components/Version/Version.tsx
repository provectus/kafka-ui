import React from 'react';
import { gitCommitPath } from 'lib/paths';

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

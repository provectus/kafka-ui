import React from 'react';
import { GIT_REPO_LINK, GIT_TAG, GIT_COMMIT } from 'lib/constants';

const Version = () => (
  <div className="is-size-7 has-text-grey-light">
    {GIT_TAG && (
      <p>
        Version:
        <a
          className="ml-1 mr-1"
          title="Latest release"
          href={`${GIT_REPO_LINK}/releases/tag/${GIT_TAG}`}
        >
          {GIT_TAG}
        </a>
        {GIT_COMMIT && (
          <>
            <span>&#40;</span>
            <a
              title="Latest commit"
              href={`${GIT_REPO_LINK}/commit/${GIT_COMMIT}`}
            >
              {GIT_COMMIT}
            </a>
            <span>&#41;</span>
          </>
        )}
      </p>
    )}
  </div>
);

export default Version;

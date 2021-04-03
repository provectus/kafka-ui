import React from 'react';
import { GIT_VERSION } from 'lib/constants';

const GetVersion = GIT_VERSION || 'undefined';

const VersionApp = () => <p className="menu-list git-version">{GetVersion}</p>;

export default VersionApp;

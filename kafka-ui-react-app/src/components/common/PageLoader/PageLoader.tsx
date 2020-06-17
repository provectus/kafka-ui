import React from 'react';
import cx from 'classnames';

interface Props {
  isFullHeight: boolean;
}

const PageLoader: React.FC<Partial<Props>> = ({ isFullHeight = true }) => (
  <section
    className={cx(
      'hero',
      isFullHeight ? 'is-fullheight-with-navbar' : 'is-halfheight'
    )}
  >
    <div
      className="hero-body has-text-centered"
      style={{ justifyContent: 'center' }}
    >
      <div style={{ width: 300 }}>
        <div className="subtitle">Loading...</div>
        <progress
          className="progress is-small is-primary is-inline-block"
          max="100"
        />
      </div>
    </div>
  </section>
);

export default PageLoader;

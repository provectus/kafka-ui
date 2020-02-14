import React from 'react';

const PageLoader: React.FC = () => (
  <section className="hero is-fullheight-with-navbar">
    <div className="hero-body has-text-centered" style={{ justifyContent: 'center' }}>
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

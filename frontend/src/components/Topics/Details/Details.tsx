import React from 'react';

const Details: React.FC = ({
}) => {
  return (
    <div className="section">
      <div className="tabs">
        <ul>
          <li className="is-active">
            <a>Pictures</a>
          </li>
          <li><a>Music</a></li>
          <li><a>Videos</a></li>
          <li><a>Documents</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Details;

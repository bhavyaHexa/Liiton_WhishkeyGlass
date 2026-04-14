import React from 'react';
import { Html } from '@react-three/drei';

export default function Loader({ isLoading, progress = 0, isFullPage = true }) {
  const displayProgress = Math.round(progress);

  const content = (
    <div className={isFullPage ? `loader-overlay ${!isLoading ? 'hidden' : ''}` : 'loader-inline'}>
      <div className="loader-container">
        <svg className="loader-circle" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" className="loader-circle-bg" />
          <circle
            cx="25"
            cy="25"
            r="20"
            className="loader-circle-progress"
            style={{ strokeDashoffset: 126 - (126 * progress) / 100 }}
          />
        </svg>
        <span className="loader-text">{displayProgress}%</span>
      </div>
      {isFullPage && <span className="loader-percentage">LOADING ASSETS...</span>}
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <Html center>
      {content}
    </Html>
  );
}
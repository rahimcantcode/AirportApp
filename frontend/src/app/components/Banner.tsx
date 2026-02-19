import React from 'react';
import { useApp } from '../context/AppContext';

export function Banner() {
  const { currentUser, logout } = useApp();

  return (
    <div className="app-banner">
      <div className="app-banner__inner">
        <div className="app-banner__brand">
          <div className="app-banner__logo">Smooth Luggage</div>
          <div className="app-banner__subtitle">Web Application Demo</div>
        </div>

        <div className="app-banner__right">
          {currentUser ? (
            <>
              <div className="app-banner__user">
                <div className="app-banner__user-label">Signed in as</div>
                <div className="app-banner__user-value">
                  {currentUser.username} ({currentUser.role})
                </div>
              </div>
              <button className="btn btn--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <div className="app-banner__user-value">Not signed in</div>
          )}
        </div>
      </div>
    </div>
  );
}

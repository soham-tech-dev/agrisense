import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * FirebaseErrorBoundary
 * ---------------------
 * Catches Firebase initialization errors (e.g. auth/invalid-api-key when .env
 * values are missing) and shows an actionable message instead of a blank screen.
 */
export class FirebaseErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AgriSense] Firebase initialization error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isApiKeyError =
      this.state.error?.message?.includes('invalid-api-key') ||
      this.state.error?.message?.includes('auth/invalid-api-key') ||
      this.state.error?.message?.includes('Firebase');

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #052013, #0a3320, #0f4a2e)',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '40px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              🔥
            </div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
              {isApiKeyError ? 'Firebase Not Configured' : 'Application Error'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              {isApiKeyError
                ? 'Firebase credentials are missing from the environment. The application cannot start without them.'
                : this.state.error?.message}
            </p>
          </div>

          {isApiKeyError && (
            <div
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <p style={{ color: '#34d399', fontSize: '13px', fontWeight: 700, margin: '0 0 12px' }}>
                ✅ How to fix this:
              </p>
              <ol style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                <li>Go to <strong style={{ color: '#34d399' }}>Firebase Console</strong> → Project <code>agrisense-1b3be</code></li>
                <li>Click <strong>⚙️ Project Settings</strong> → <strong>General</strong></li>
                <li>Scroll to <strong>Your apps</strong> → web app → copy <code>firebaseConfig</code></li>
                <li>Open <code>.env</code> in the <code>frontend/</code> folder</li>
                <li>Fill in all <code>VITE_FIREBASE_*</code> variables</li>
                <li>Restart the dev server (<code>npm run dev</code>)</li>
              </ol>
            </div>
          )}

          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#ef4444',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error?.message}
          </div>
        </div>
      </div>
    );
  }
}

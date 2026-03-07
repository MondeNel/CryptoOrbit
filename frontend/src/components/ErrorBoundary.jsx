import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#060a0e',
          color: '#dce8f0',
          fontFamily: 'Rajdhani, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff3b5c', marginBottom: '20px' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '20px', maxWidth: '400px' }}>
            The game encountered an error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(160deg, #3a2800, #6a4a00)',
              border: '1.5px solid #f0b429',
              color: '#f0b429',
              padding: '12px 24px',
              borderRadius: '8px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Refresh Page
          </button>
          <details style={{ marginTop: '20px', fontSize: '12px', color: '#3d5a72' }}>
            <summary>Error Details</summary>
            <pre style={{ textAlign: 'left', marginTop: '10px', fontSize: '10px' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.name || 'component'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fff3f3',
          border: '1px solid #fcc',
          borderRadius: '6px',
          color: '#c33',
          ...(this.props.style || {})
        }}>
          <strong>{this.props.title || 'Something went wrong'}</strong>
          <p style={{ margin: '8px 0', fontSize: '14px' }}>
            {this.props.message || 'This section failed to load, but the rest of the app is still available.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Button, Result } from 'antd';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Sentry } from '../lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch runtime errors in child components
 * and display a user-friendly error page instead of crashing the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // Send error to Sentry (no-op when DSN is not configured)
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '24px',
          }}
        >
          <Result
            status="error"
            title="Đã xảy ra lỗi"
            subTitle="Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau."
            extra={[
              <Button key="retry" type="primary" onClick={this.handleReset}>
                Thử lại
              </Button>,
              <Button key="reload" onClick={this.handleReload}>
                Tải lại trang
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  backgroundColor: '#fff2f0',
                  borderRadius: 8,
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <strong>Error: </strong>
                {this.state.error.message}
                <br />
                <br />
                <strong>Stack: </strong>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

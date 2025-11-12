import * as React from "react";
import { Text, Box } from "ink";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      return (
        <Box flexDirection="column" padding={1}>
          <Box marginBottom={1}>
            <Text color="red" bold>
              ⚠️ Error
            </Text>
          </Box>
          <Box marginBottom={1}>
            <Text color="red">
              {error?.message || "An unexpected error occurred"}
            </Text>
          </Box>
          {error?.stack && (
            <Box marginTop={1} flexDirection="column">
              <Text color="gray" dimColor>
                Stack trace:
              </Text>
              <Box marginLeft={2} marginTop={1}>
                <Text color="gray" dimColor>
                  {error.stack}
                </Text>
              </Box>
            </Box>
          )}
          {errorInfo?.componentStack && (
            <Box marginTop={1} flexDirection="column">
              <Text color="gray" dimColor>
                Component stack:
              </Text>
              <Box marginLeft={2} marginTop={1}>
                <Text color="gray" dimColor>
                  {errorInfo.componentStack}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

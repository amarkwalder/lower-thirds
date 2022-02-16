import React from "react";

type ErrorBoundaryProps = { children?: React.ReactNode };
type ErrorBoundaryState = { error: unknown; hasError: boolean };

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  render() {
    if (this.state.hasError) {
      return <p>An error has occurred. {JSON.stringify(this.state.error)}</p>;
    }
    return this.props.children;
  }

  componentDidCatch(error: unknown) {
    this.setState({ hasError: true, error });
  }
}

import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-on-surface">
          <div className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest p-8 text-center shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
            <h1 className="text-2xl font-bold text-on-surface">Something went wrong</h1>
            <p className="mt-2 text-on-surface-variant">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition hover:brightness-95"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

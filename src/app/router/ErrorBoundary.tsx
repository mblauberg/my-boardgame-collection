import { Component, type ReactNode, type ErrorInfo } from "react";
import { SurfacePanel } from "../../components/ui/SurfacePanel";

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
          <SurfacePanel className="rounded-2xl border-outline-variant/15 p-8 text-center">
            <h1 className="text-2xl font-bold text-on-surface">Something went wrong</h1>
            <p className="mt-2 text-on-surface-variant">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="glass-action-button-active mt-4 rounded-full px-4 py-2 text-sm font-semibold text-on-primary transition hover:brightness-95"
            >
              Refresh
            </button>
          </SurfacePanel>
        </div>
      );
    }
    return this.props.children;
  }
}

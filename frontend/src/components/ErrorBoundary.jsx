import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected application error.",
    };
  }
  componentDidCatch(error) {
    console.error("YashOS error boundary:", error);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="grid h-full w-full place-items-center overflow-auto bg-slate-950 p-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-7 text-center shadow-2xl">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-500/15 text-red-300 text-2xl">
            !
          </div>
          <h2 className="mt-4 text-xl font-bold">This app hit an error</h2>
          <p className="mt-2 text-sm text-white/55">
            The rest of WebOS is still available. Close this window or reload
            the app.
          </p>
          <p className="mt-4 max-h-28 overflow-auto rounded-xl bg-black/20 p-3 text-left text-xs text-red-200/80">
            {this.state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold hover:bg-violet-500"
          >
            Reload WebOS
          </button>
        </div>
      </div>
    );
  }
}

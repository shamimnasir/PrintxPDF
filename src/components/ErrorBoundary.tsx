import { Component, type ReactNode } from 'react'

type State = { error: Error | null }

/** Keeps the header and footer on screen and offers a reload instead of an empty page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="container section center">
        <h2>Something went wrong on this page</h2>
        <p className="muted">Reloading usually fixes it. Your files stay on your computer, nothing was sent anywhere.</p>
        <button className="btn btn-acid" onClick={() => location.reload()}>
          Reload the page
        </button>
      </div>
    )
  }
}

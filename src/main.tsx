import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Financial data is deliberately not logged. */ }
  render() { return this.state.failed ? <main className="startup"><h1>Something went wrong</h1><p>Your stored records have not been erased. Reload to reopen your workspace.</p><button className="button primary" onClick={() => location.reload()}>Reload application</button></main> : this.props.children; }
}
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App/></ErrorBoundary></StrictMode>);

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'red', background: '#fff' }}>
                    <h1>Something went wrong.</h1>
                    <h3>Error: {this.state.error && this.state.error.toString()}</h3>
                    <p>Component Stack: {this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

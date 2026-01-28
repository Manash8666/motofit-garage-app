import React from 'react';
import { AlertTriangle } from 'lucide-react';

class WebGLErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("WebGL 3D Context Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white p-6 text-center z-50 backdrop-blur-sm border border-white/10 rounded-xl">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">3D Scene Unavailable</h3>
                    <p className="text-gray-400 max-w-md mb-6 text-sm">
                        {this.props.fallbackMessage || "Your device graphics hardware is disabled or not supported."}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors font-medium text-sm"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default WebGLErrorBoundary;

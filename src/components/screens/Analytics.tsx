
import React from 'react';
import { Link } from 'react-router-dom';

export default function Analytics() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard" className="text-blue-500 hover:underline">&larr; Back</Link>
                <h1 className="text-3xl font-bold">Analytics</h1>
            </div>
            <p>View your study analytics here.</p>
        </div>
    );
}

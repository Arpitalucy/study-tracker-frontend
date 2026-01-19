
import React from 'react';
import { Link } from 'react-router-dom';

export default function SubjectManagement() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard" className="text-blue-500 hover:underline">&larr; Back</Link>
                <h1 className="text-3xl font-bold">Subject Management</h1>
            </div>
            <p>Manage your subjects here.</p>
            {/* Placeholder list */}
            <ul className="mt-4 space-y-2">
                <li className="p-4 bg-white rounded shadow">
                    <Link to="/subjects/1/chapters" className="text-lg font-medium hover:text-blue-600">Mathematics</Link>
                </li>
                <li className="p-4 bg-white rounded shadow">
                    <Link to="/subjects/2/chapters" className="text-lg font-medium hover:text-blue-600">Physics</Link>
                </li>
            </ul>
        </div>
    );
}

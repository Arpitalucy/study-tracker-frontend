
import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function ChapterManagement() {
    const { subjectId } = useParams();

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/subjects" className="text-blue-500 hover:underline">&larr; Back to Subjects</Link>
                <h1 className="text-3xl font-bold">Chapters for Subject {subjectId}</h1>
            </div>
            <p>Manage chapters for this subject.</p>
        </div>
    );
}

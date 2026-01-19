import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const SidebarTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    const toggle = () => {
        setIsActive(!isActive);
    };

    const reset = () => {
        setSeconds(0);
        setIsActive(false);
    };

    const formatTime = (time: number) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mx-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Study Timer</span>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-900 text-center py-2">
                {formatTime(seconds)}
            </div>
            <div className="flex justify-center gap-2 mt-2">
                <button
                    onClick={toggle}
                    className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                    onClick={reset}
                    className="p-2 bg-white text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SidebarTimer;

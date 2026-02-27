import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = ({ className = '', size = 200, fullScreen = false }) => {
    const loaderContent = (
        <div
            className={`opacity-70 dark:invert dark:opacity-90 transition-all duration-300 ${!fullScreen && className}`}
            style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <DotLottieReact
                src="/assets/loading-light.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );

    if (fullScreen) {
        return (
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg)]/60 backdrop-blur-md ${className}`}>
                {loaderContent}
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            {loaderContent}
        </div>
    );
};

export default Loader;

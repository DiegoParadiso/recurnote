import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTheme } from '@context/ThemeContext';
import useIsMobile from '@hooks/useIsMobile';

const Loader = ({ className = '', size = 180, fullScreen = false }) => {
    const { isLightTheme } = useTheme();
    const isMobile = useIsMobile();

    const effectiveSize = isMobile ? Math.round(size * 0.6) : size;

    const loaderContent = (
        <div
            className={`opacity-70 transition-all duration-300 ${!fullScreen && className}`}
            style={{ width: effectiveSize, height: effectiveSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <DotLottieReact
                src={isLightTheme ? "/assets/loading-light.lottie" : "/assets/loading-dark.lottie"}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );

    if (fullScreen) {
        return (
            <div className={`fixed inset-0 z-[2147483647] flex items-center justify-center bg-[var(--color-bg)]/60 backdrop-blur-md ${className}`}>
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

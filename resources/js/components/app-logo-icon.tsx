import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/sintf.svg" 
            alt="SINTF Sarl Logo" 
            className={`object-contain ${props.className || ''}`}
        />
    );
}
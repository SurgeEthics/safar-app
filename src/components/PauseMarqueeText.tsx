import React, { useRef, useEffect, useState } from 'react';

interface PauseMarqueeTextProps {
  text: string;
  className?: string;
  speedSec?: number; // duration of translation
  pauseSec?: number; // pause duration (default: 1.5s as requested)
}

export const PauseMarqueeText: React.FC<PauseMarqueeTextProps> = ({
  text,
  className = '',
  speedSec = 4.5,
  pauseSec = 1.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth + 2) {
          setIsOverflowing(true);
          setOverflowDistance(textWidth - containerWidth);
        } else {
          setIsOverflowing(false);
          setOverflowDistance(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const totalCycleDuration = speedSec + pauseSec * 2;
  const scrollPercentage = ((speedSec) / totalCycleDuration) * 100;
  const pausePercentage = ((speedSec + pauseSec) / totalCycleDuration) * 100;

  const keyframeId = `pause-marquee-${Math.abs(hashCode(text))}`;

  return (
    <div ref={containerRef} className={`relative overflow-hidden whitespace-nowrap ${className}`}>
      {isOverflowing && (
        <style>{`
          @keyframes ${keyframeId} {
            0% { transform: translateX(0); }
            ${scrollPercentage.toFixed(1)}% { transform: translateX(-${overflowDistance + 8}px); }
            ${pausePercentage.toFixed(1)}% { transform: translateX(-${overflowDistance + 8}px); }
            100% { transform: translateX(0); }
          }
        `}</style>
      )}

      <span
        ref={textRef}
        style={
          isOverflowing
            ? {
                display: 'inline-block',
                animation: `${keyframeId} ${totalCycleDuration}s ease-in-out infinite`,
                animationDelay: `${pauseSec}s`
              }
            : { display: 'inline-block' }
        }
      >
        {text}
      </span>
    </div>
  );
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

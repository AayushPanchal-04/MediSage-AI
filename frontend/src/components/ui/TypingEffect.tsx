import React, { useState, useEffect } from 'react';

export const TypingEffect = ({ text, speed = 15, className = "" }: { text: string; speed?: number; className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    if (!text) return;
    
    // Safety for very long texts to ensure they don't take forever
    const currentSpeed = text.length > 500 ? Math.max(1, speed / 2) : speed;
    
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, currentSpeed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
};

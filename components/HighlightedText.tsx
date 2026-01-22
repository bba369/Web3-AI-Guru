
import React, { useMemo } from 'react';

interface HighlightedTextProps {
  text: string;
  progress: number; // 0 to 1
  active: boolean;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, progress, active, className }) => {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  
  const wordMetadata = useMemo(() => {
    let charCount = 0;
    const totalChars = text.length;
    return words.map(word => {
      const start = charCount / totalChars;
      charCount += word.length;
      const end = charCount / totalChars;
      return { start, end, isSpace: word.trim().length === 0 };
    });
  }, [words, text]);

  return (
    <div className={className}>
      {words.map((word, i) => {
        const { start, end, isSpace } = wordMetadata[i];
        const isCurrent = active && progress >= start && progress < end;
        
        if (isSpace) return <span key={i}>{word}</span>;

        return (
          <span
            key={i}
            className={`transition-all duration-200 rounded-lg px-1 -mx-1 ${
              isCurrent 
                ? 'bg-indigo-600/10 text-indigo-900 shadow-sm ring-1 ring-indigo-100' 
                : ''
            }`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export default HighlightedText;

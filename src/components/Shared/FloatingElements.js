import React from 'react';
import './FloatingElements.css';

const FloatingElements = () => {
  const elements = ['💖', '✨', '🌸', '🌟', '🥰', '🎀', '💕', '💫'];
  
  return (
    <div className="floating-elements">
      {elements.map((element, index) => (
        <div 
          key={index}
          className={`floating-element fe-${index + 1}`}
          style={{ animationDelay: `${index * 2}s` }}
        >
          {element}
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
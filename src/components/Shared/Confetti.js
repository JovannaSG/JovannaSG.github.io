import React from 'react';
import './Confetti.css';

const Confetti = () => {
  const confettiCount = 150;
  const confettiElements = [];

  for (let i = 0; i < confettiCount; i++) {
    const style = {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 10 + 5}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '0%'
    };

    confettiElements.push(
      <div key={i} className="confetti" style={style} />
    );
  }

  return <div className="confetti-container">{confettiElements}</div>;
};

export default Confetti;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../Shared/AnimatedBackground';
import FloatingElements from '../Shared/FloatingElements';
import Confetti from '../Shared/Confetti';
import './Home.css';

const Home = () => {
  const [complimentCount, setComplimentCount] = useState(0);
  const [smileCount, setSmileCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("И вообще ты самая лучшая! 🌸");
  const [hearts, setHearts] = useState([]);

  const compliments = [
    "Ты умничка!!! 💖",
    "Ты сияешь ярче звезд! ✨",
    "Твоя улыбка делает мир лучше! 😊",
    "Ты вдохновляешь меня каждый день! 🌸",
    "Ты самая невероятная! 💫",
    "Твое сердце полно доброты! 💕",
    "Ты делаешь все вокруг красивее! 🌺",
    "Твоя энергия заряжает позитивом! ⚡"
  ];

  // Эффект для анимации счетчиков при загрузке
  useEffect(() => {
    const animateCounter = (setter, target, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(Math.floor(target));
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(setComplimentCount, 42);
    animateCounter(setSmileCount, 128);
  }, []);

  // Функция для создания летающих сердечек
  const createHearts = () => {
    const newHearts = [];
    for (let i = 0; i < 15; i++) {
      newHearts.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        size: Math.random() * 20 + 10
      });
    }
    setHearts(newHearts);
    
    // Удаляем сердечки через 3 секунды
    setTimeout(() => setHearts([]), 3000);
  };

  const handleMagicClick = () => {
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    setCurrentSubtitle(randomCompliment);
    setComplimentCount(prev => prev + 1);
    setShowConfetti(true);
    
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleLoveClick = () => {
    setSmileCount(prev => prev + 1);
    createHearts();
  };

  const handleAvatarClick = () => {
    setShowModal(true);
  };

  return (
    <div className="home">
      <AnimatedBackground />
      <FloatingElements />
      {showConfetti && <Confetti />}

      {/* Летающие сердечки */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="flying-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            fontSize: `${heart.size}px`
          }}
        >
          💖
        </div>
      ))}

      <div className="container">
        {/* Аватар */}
        <div className="avatar-container">
          <div className="avatar-frame">
            <div className="avatar" onClick={handleAvatarClick}>
              💖 {/* ЗАМЕНИЛИ Font Awesome на эмодзи */}
            </div>
            <div className="avatar-glow"></div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-container">
          <h1 className="main-title">
            <span className="title-word title-word-1">Ты</span>
            <span className="title-word title-word-2">умничка</span>
            <span className="title-word title-word-3">!!!</span>
          </h1>
          <p className="subtitle">{currentSubtitle}</p>
        </div>

        {/* Кнопки */}
        <div className="buttons-container">
          <button className="magic-btn" onClick={handleMagicClick}>
            <span className="btn-text">Волшебство ✨</span>
            <div className="btn-shine"></div>
          </button>

          <button className="love-btn" onClick={handleLoveClick}>
            💖 {/* ЗАМЕНИЛИ Font Awesome на эмодзи */}
            <span>Отправить любовь</span>
          </button>

          <Link to="/game">
            <button className="magic-btn">
              <span className="btn-text">Сыграть в игру 🎮</span>
              <div className="btn-shine"></div>
            </button>
          </Link>

          <Link to="/solitaire">
            <button className="magic-btn">
              <span className="btn-text">Косынка 🃏</span>
              <div className="btn-shine"></div>
            </button>
          </Link>
        </div>

        {/* Статистика */}
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{complimentCount}</div>
            <div className="stat-label">комплиментов</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{smileCount}</div>
            <div className="stat-label">улыбок</div>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Секретное сообщение! 💌</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Каждый день с тобой - это праздник! Ты делаешь мир ярче просто своим присутствием. 💫</p>
              <div className="message-heart">💝</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
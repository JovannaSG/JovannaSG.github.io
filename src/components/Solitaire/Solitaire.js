import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AnimatedBackground from "../Shared/AnimatedBackground";
import FloatingElements from "../Shared/FloatingElements";
import "./Solitaire.css";

const Solitaire = () => {
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
  const [foundations, setFoundations] = useState({
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: [],
  });
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [selectedStack, setSelectedStack] = useState(null);
  const [showCompliment, setShowCompliment] = useState(false);
  const [complimentText, setComplimentText] = useState("");

  const compliments = [
    "Отлично! Ты настоящий карточный гений! ♠️",
    "Блестящий ход! ♥️",
    "Потрясающе! Стратегия на высоте! ♦️",
    "Молодец! Твои навыки впечатляют! ♣️",
    "Идеально! Ты рождена для этой игры! 💫",
  ];
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  // --- helpers ---
  const createDeck = () => {
    const deck = [];
    let idCounter = 0;
    
    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        deck.push({
          suit,
          rank,
          isFaceUp: false,
          id: `${suit}-${rank}-${idCounter++}`, // Гарантированно уникальный ID
        });
      });
    });
    
    return deck;
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const getCardValue = (rank) => {
    if (rank === "A") return 1;
    if (rank === "J") return 11;
    if (rank === "Q") return 12;
    if (rank === "K") return 13;
    return parseInt(rank, 10);
  };

  const isRed = (card) => card.suit === "hearts" || card.suit === "diamonds";
  
  const getSuitSymbol = (s) => ({
    hearts: "♥️",
    diamonds: "♦️",
    clubs: "♣️",
    spades: "♠️"
  }[s]);
  
  const getSuitColor = (s) => (s === "hearts" || s === "diamonds" ? "red" : "black");

  // Проверка победы
  const checkWinCondition = () => {
    const allFoundationsFull = Object.values(foundations).every(
      (foundation) => foundation.length === 13
    );
    
    if (allFoundationsFull && !gameWon) {
      setGameWon(true);
      setComplimentText("Поздравляю! Ты выиграла! 🎉 Ты настоящая чемпионка! 🌟");
      setShowCompliment(true);
      setTimeout(() => setShowCompliment(false), 5000);
    }
    
    return allFoundationsFull;
  };

  // --- game setup ---
  const dealCards = () => {
    let deck = createDeck();
    deck = shuffle(deck);
    
    const newTableau = [[], [], [], [], [], [], []];
    let deckIndex = 0;

    // Раздача карт в tableau
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = { ...deck[deckIndex] };
        card.isFaceUp = (row === col); // Только последняя карта в колонке открыта
        newTableau[col].push(card);
        deckIndex++;
      }
    }

    // Оставшиеся карты идут в сток
    const remainingStock = deck.slice(deckIndex);

    setTableau(newTableau);
    setStock(remainingStock);
    setWaste([]);
    setFoundations({ hearts: [], diamonds: [], clubs: [], spades: [] });
    setMoves(0);
    setScore(0);
    setTime(0);
    setGameStarted(true);
    setGameWon(false);
    setSelectedStack(null);
  };

  useEffect(() => { 
    dealCards(); 
  }, []);
  
  useEffect(() => {
    let timer;
    if (gameStarted && !gameWon) {
      timer = setInterval(() => setTime((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameWon]);

  // Проверяем победу при изменении foundations
  useEffect(() => {
    if (gameStarted) {
      checkWinCondition();
    }
  }, [foundations, gameStarted]);

  // --- draw ---
  const drawFromStock = () => {
    if (gameWon) return;
    
    if (stock.length > 0) {
      const newStock = [...stock];
      const card = { ...newStock.pop(), isFaceUp: true };
      setWaste([...waste, card]);
      setStock(newStock);
      setMoves((m) => m + 1);
    } else if (waste.length > 0) {
      // Переворачиваем отбой обратно в сток
      setStock([...waste].reverse().map((c) => ({ ...c, isFaceUp: false })));
      setWaste([]);
      setMoves((m) => m + 1);
    }
  };

  // --- move logic ---
  const canPlaceStackOnTableau = (stackTop, colIndex) => {
    const col = tableau[colIndex];
    if (!col.length)
      return stackTop.rank === "K"; // На пустую колонку можно класть только короля
    
    const top = col[col.length - 1];
    return (
      isRed(stackTop) !== isRed(top) && 
      getCardValue(stackTop.rank) === getCardValue(top.rank) - 1
    );
  };

  const canPlaceCardOnFoundation = (card, suit) => {
    if (!card || card.suit !== suit) return false;
    const pile = foundations[suit];
    if (!pile.length)
      return card.rank === "A"; // На пустой фундамент можно класть только туза
    
    const topCard = pile[pile.length - 1];
    return getCardValue(card.rank) === getCardValue(topCard.rank) + 1;
  };

  // Функция для проверки валидности стека карт
  const isValidStack = (cards) => {
    if (cards.length <= 1) return true;
    
    for (let i = 0; i < cards.length - 1; i++) {
      const current = cards[i];
      const next = cards[i + 1];
      
      // Проверяем чередование цветов
      if (isRed(current) === isRed(next)) return false;
      
      // Проверяем последовательность (текущая должна быть на 1 больше следующей)
      if (getCardValue(current.rank) !== getCardValue(next.rank) + 1) return false;
    }
    
    return true;
  };

  const removeFromSource = (source) => {
    if (!source) return;
    
    if (source.type === "waste") {
      setWaste((w) => w.slice(0, -1));
      return;
    }
    
    if (source.type === "tableau") {
      setTableau((t) => {
        const newTableau = t.map((col) => [...col]);
        // Удаляем карты начиная с source.index
        newTableau[source.col].splice(source.index);
        
        // Открываем последнюю карту в колонке, если она закрыта
        if (newTableau[source.col].length > 0) {
          const lastCardIndex = newTableau[source.col].length - 1;
          const lastCard = newTableau[source.col][lastCardIndex];
          if (!lastCard.isFaceUp) {
            newTableau[source.col][lastCardIndex] = { ...lastCard, isFaceUp: true };
          }
        }
        return newTableau;
      });
    }
  };

  // Обработчик клика на пустую колонку
  const handleEmptyColumnClick = (colIndex) => {
    if (gameWon || !selectedStack) return;
    
    const { cards, source } = selectedStack;
    const topCard = cards[0];
    
    // На пустую колонку можно класть только короля
    if (topCard.rank === "K") {
      removeFromSource(source);
      setTableau((prev) => {
        const newTableau = prev.map((col) => [...col]);
        newTableau[colIndex] = [...cards];
        return newTableau;
      });
      setSelectedStack(null);
      setMoves((m) => m + 1);
      setScore((s) => s + 5);
      showRandomCompliment();
    } else {
      setSelectedStack(null);
    }
  };

  const handleCardClick = (card, colIndex, cardIndex) => {
    if (gameWon) return;
    
    // Если уже выбран стек - пытаемся переместить
    if (selectedStack) {
      const { cards, source } = selectedStack;
      const topCard = cards[0];
      
      // Перемещение на непустую колонку
      if (colIndex !== undefined && canPlaceStackOnTableau(topCard, colIndex)) {
        removeFromSource(source);
        setTableau((prev) => {
          const newTableau = prev.map((col) => [...col]);
          newTableau[colIndex].push(...cards);
          return newTableau;
        });
        setSelectedStack(null);
        setMoves((m) => m + 1);
        setScore((s) => s + 5);
        showRandomCompliment();
        return;
      }
      
      // Если не удалось - сбрасываем выбор
      setSelectedStack(null);
      return;
    }

    // Выбор карты
    if (!card.isFaceUp) return;
    
    const col = tableau[colIndex];
    const cardsToMove = col.slice(cardIndex);
    
    // Проверяем валидность стека
    if (!isValidStack(cardsToMove)) return;
    
    setSelectedStack({
      cards: cardsToMove,
      source: {
        type: "tableau",
        col: colIndex,
        index: cardIndex
      }
    });
  };

  const handleFoundationClick = (suit) => {
    if (gameWon || !selectedStack) return;

    const { cards, source } = selectedStack;
    
    // На фундамент можно класть только одну карту
    if (cards.length === 1 && canPlaceCardOnFoundation(cards[0], suit)) {
      removeFromSource(source);
      setFoundations((f) => ({ 
        ...f, 
        [suit]: [...f[suit], cards[0]] 
      }));
      setMoves((m) => m + 1);
      setScore((s) => s + 10);
      showRandomCompliment();
      setSelectedStack(null);
    } else {
      setSelectedStack(null);
    }
  };

  const handleWasteClick = () => {
    if (gameWon || waste.length === 0) return;
    
    const topCard = waste[waste.length - 1];
    setSelectedStack({ 
      cards: [topCard], 
      source: { type: "waste" } 
    });
  };

  const showRandomCompliment = (prob = 0.15) => {
    if (Math.random() > prob) return;

    setComplimentText(compliments[Math.floor(Math.random() * compliments.length)]);
    setShowCompliment(true);
    setTimeout(() => setShowCompliment(false), 3000);
  };

  const formatTime = (s) => 
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // --- render ---
  return (
    <div className="solitaire-page">
      <AnimatedBackground />
      <FloatingElements />

      <div className="solitaire-container">
        {/* Заголовок и статистика */}
        <div className="game-header">
          <h1 className="game-title">Косынка 🃏</h1>
          <div className="game-stats">
            <div className="stat-item">
              <div className="stat-label">Ходы</div>
              <div className="stat-value">{moves}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Время</div>
              <div className="stat-value">{formatTime(time)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Очки</div>
              <div className="stat-value">{score}</div>
            </div>
          </div>
        </div>

        {gameWon && (
          <div className="win-message">
            <h2>Поздравляем с победой! 🎉</h2>
            <p>Ты завершила игру за {formatTime(time)} и {moves} ходов!</p>
          </div>
        )}

        {/* Основная игровая область */}
        <div className="game-area">
          {/* Верхняя зона - колоды и фундаменты */}
          <div className="top-zone">
            <div className="deck-container">
              <div className="deck-placeholder stock" onClick={drawFromStock}>
                {stock.length ? (
                  <div className="card card-back">🃏</div>
                ) : (
                  <div className="empty-placeholder">🂠</div>
                )}
              </div>
              <div
                className="deck-placeholder waste"
                onClick={handleWasteClick}
              >
                {waste.length ? (
                  <div className={`card face-up ${getSuitColor(waste[waste.length - 1].suit)} ${
                    selectedStack && selectedStack.source.type === "waste" ? "selected" : ""
                  }`}>
                    <div className="card-rank">{waste[waste.length - 1].rank}</div>
                    <div className="card-suit">{getSuitSymbol(waste[waste.length - 1].suit)}</div>
                  </div>
                ) : (
                  <div className="empty-placeholder">🂠</div>
                )}
              </div>
            </div>

            <div className="foundations">
              {suits.map((suit) => (
                <div
                  key={suit}
                  className={`foundation ${suit}`}
                  onClick={() => handleFoundationClick(suit)}
                >
                  {foundations[suit].length ? (
                    <div className={`card face-up ${getSuitColor(suit)}`}>
                      <div className="card-rank">
                        {foundations[suit][foundations[suit].length - 1].rank}
                      </div>
                      <div className="card-suit">{getSuitSymbol(suit)}</div>
                    </div>
                  ) : (
                    <div className="empty-placeholder">{getSuitSymbol(suit)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Зона tableau */}
          <div className="tableau-zone">
            <div className="tableau">
              {tableau.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className="tableau-column"
                  onClick={() => {
                    if (col.length === 0 && selectedStack) {
                      handleEmptyColumnClick(colIndex);
                    }
                  }}
                >
                  {col.length === 0 ? (
                    <div className="empty-placeholder">🂠</div>
                  ) : (
                    col.map((card, cardIndex) => (
                      <div
                        key={card.id}
                        className={`card ${card.isFaceUp ? "face-up" : "face-down"} ${getSuitColor(card.suit)} ${
                          selectedStack && selectedStack.cards.some((c) => c.id === card.id)
                            ? "selected"
                            : ""
                        }`}
                        style={{ 
                          marginTop: cardIndex > 0 ? "-60px" : 0, 
                          zIndex: cardIndex 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(card, colIndex, cardIndex);
                        }}
                      >
                        {card.isFaceUp ? (
                          <>
                            <div className="card-rank">{card.rank}</div>
                            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
                          </>
                        ) : (
                          <div className="card-back">🃏</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Зона управления */}
        <div className="controls-zone">
          <div className="game-controls">
            <button className="game-button" onClick={dealCards}>
              Новая игра 🔄
            </button>
            <Link to="/" className="back-button">
              ← Назад
            </Link>
          </div>
        </div>
      </div>

      {showCompliment && (
        <div className="compliment-message show">
          <div className="message-heart">💖</div>
          <h3>{complimentText}</h3>
        </div>
      )}
    </div>
  );
};

export default Solitaire;
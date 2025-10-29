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

  const [selectedStack, setSelectedStack] = useState(null);
  const compliments = [
    "Отлично! Ты настоящий карточный гений! ♠️",
    "Блестящий ход! ♥️",
    "Потрясающе! Стратегия на высоте! ♦️",
    "Молодец! Твои навыки впечатляют! ♣️",
    "Идеально! Ты рождена для этой игры! 💫",
  ];
  const [showCompliment, setShowCompliment] = useState(false);
  const [complimentText, setComplimentText] = useState("");

  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  // --- helpers ---
  const createDeck = () =>
    suits.flatMap((suit) =>
      ranks.map((rank) => ({
        suit,
        rank,
        isFaceUp: false,
        id: `${suit}-${rank}-${Math.random().toString(36).slice(2, 9)}`,
      }))
    );

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
  const getSuitSymbol = (s) => (
    {
      hearts: "♥️",
      diamonds: "♦️",
      clubs: "♣️",
      spades: "♠️"
    }[s]
  );
  const getSuitColor = (s) => (s === "hearts" || s === "diamonds" ? "red" : "black");

  // --- game setup ---
  const dealCards = () => {
    const deck = shuffle(createDeck());
    const newTableau = [[], [], [], [], [], [], []];
    let idx = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = { ...deck[idx++] };
        card.isFaceUp = row === col;
        newTableau[col].push(card);
      }
    }
    setTableau(newTableau);
    setStock(deck.slice(idx));
    setWaste([]);
    setFoundations({ hearts: [], diamonds: [], clubs: [], spades: [] });
    setMoves(0);
    setScore(0);
    setTime(0);
    setGameStarted(true);
  };

  useEffect(() => { dealCards(); }, []);
  useEffect(() => {
    let t;
    if (gameStarted) t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [gameStarted]);

  // --- draw ---
  const drawFromStock = () => {
    if (stock.length > 0) {
      const newStock = [...stock];
      const card = { ...newStock.pop(), isFaceUp: true };
      setWaste([...waste, card]);
      setStock(newStock);
    } else {
      setStock([...waste].reverse().map((c) => ({ ...c, isFaceUp: false })));
      setWaste([]);
    }
    setMoves((m) => m + 1);
  };

  // --- move logic ---
  const canPlaceStackOnTableau = (stackTop, colIndex) => {
    const col = tableau[colIndex];
    if (!col.length) return stackTop.rank === "K";
    const top = col[col.length - 1];
    return isRed(stackTop) !== isRed(top) && getCardValue(stackTop.rank) === getCardValue(top.rank) - 1;
  };

  const canPlaceCardOnFoundation = (card, suit) => {
    if (!card || card.suit !== suit) return false;
    const pile = foundations[suit];
    if (!pile.length) return card.rank === "A";
    return getCardValue(card.rank) === getCardValue(pile[pile.length - 1].rank) + 1;
  };

  // Функция для проверки валидности стека карт (правильная последовательность)
  const isValidStack = (cards) => {
    if (cards.length <= 1) return true;
    
    for (let i = 0; i < cards.length - 1; i++) {
      const current = cards[i];
      const next = cards[i + 1];
      
      // Проверяем чередование цветов и последовательность
      if (isRed(current) === isRed(next)) return false;
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
        const newT = t.map((col) => [...col]);
        newT[source.col].splice(source.index);
        if (newT[source.col].length) {
          const top = newT[source.col][newT[source.col].length - 1];
          if (!top.isFaceUp)
            newT[source.col][newT[source.col].length - 1] = { ...top, isFaceUp: true };
        }
        return newT;
      });
    }
  };

  // Обработчик клика на пустую колонку
  const handleEmptyColumnClick = (colIndex) => {
    if (selectedStack) {
      const { cards, source } = selectedStack;
      const topCard = cards[0];
      
      // Проверяем, можно ли поместить карту на пустую колонку (только король)
      if (topCard.rank === "K") {
        // Создаем глубокую копию карт для перемещения
        const cardsToMove = cards.map(card => ({...card}));
        
        removeFromSource(source);
        setTableau((prev) => {
          const copy = prev.map((c) => [...c]);
          copy[colIndex] = [...cardsToMove]; // Заменяем пустой массив новыми картами
          return copy;
        });
        setSelectedStack(null);
        setMoves((m) => m + 1);
        setScore((s) => s + 5);
        showRandomCompliment();
      } else {
        setSelectedStack(null);
      }
    }
  };

  const handleCardClick = (card, colIndex, cardIndex) => {
    // если уже выбрана карта — пытаемся переместить
    if (selectedStack) {
      const { cards, source } = selectedStack;
      const topCard = cards[0];
      
      // перемещение на колонку (не пустую)
      if (colIndex !== undefined && canPlaceStackOnTableau(topCard, colIndex)) {
        // Создаем глубокую копию карт для перемещения
        const cardsToMove = cards.map(card => ({...card}));
        
        removeFromSource(source);
        setTableau((prev) => {
          const copy = prev.map((c) => [...c]);
          copy[colIndex].push(...cardsToMove);
          return copy;
        });
        setSelectedStack(null);
        setMoves((m) => m + 1);
        setScore((s) => s + 5);
        showRandomCompliment();
        return;
      }
      // если не удалось — сброс выбора
      setSelectedStack(null);
      return;
    }

    // если карта выбрана впервые
    if (!card.isFaceUp) return;
    const col = tableau[colIndex];
    const cardsToMove = col.slice(cardIndex); // весь стек открытых карт
    
    // Проверяем, что выбранные карты образуют валидную последовательность
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
    if (!selectedStack)
      return;

    const { cards, source } = selectedStack;
    if (cards.length === 1 && canPlaceCardOnFoundation(cards[0], suit)) {
      // Создаем глубокую копию карты для перемещения
      const cardToMove = {...cards[0]};
      
      removeFromSource(source);
      setFoundations((f) => ({ ...f, [suit]: [...f[suit], cardToMove] }));
      setMoves((m) => m + 1);
      setScore((s) => s + 10);
      showRandomCompliment();
      setSelectedStack(null);
    }
    else {
      setSelectedStack(null);
    }
  };

  const showRandomCompliment = (prob = 0.15) => {
    if (Math.random() > prob)
      return;

    setComplimentText(compliments[Math.floor(Math.random() * compliments.length)]);
    setShowCompliment(true);
    setTimeout(() => setShowCompliment(false), 3000);
  };

  const formatTime = (s) => `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60)
    .toString()
    .padStart(2, "0")}`;

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
                onClick={() => {
                  if (!waste.length) return;
                  const card = waste[waste.length - 1];
                  setSelectedStack({ cards: [card], source: { type: "waste" } });
                }}
              >
                {waste.length ? (
                  <div className={`card face-up ${getSuitColor(waste[waste.length - 1].suit)}`}>
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
                      <div className="card-rank">{foundations[suit][foundations[suit].length - 1].rank}</div>
                      <div className="card-suit">{getSuitSymbol(suit)}</div>
                    </div>
                  ) : (
                    <div className="empty-placeholder">{getSuitSymbol(suit)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Зона tableau с горизонтальной прокруткой */}
          <div className="tableau-zone">
            <div className="tableau">
              {tableau.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className="tableau-column"
                  onClick={() => {
                    // Клик на пустую колонку
                    if (col.length === 0 && selectedStack) {
                      handleEmptyColumnClick(colIndex);
                    }
                  }}
                >
                  {col.length === 0 ? (
                    <div className="empty-placeholder" onClick={() => selectedStack && handleEmptyColumnClick(colIndex)}>🂠</div>
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
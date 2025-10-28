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
  const getSuitSymbol = (s) => ({ hearts: "♥️", diamonds: "♦️", clubs: "♣️", spades: "♠️" }[s]);
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

  const handleCardClick = (card, colIndex, cardIndex) => {
    // если уже выбрана карта — пытаемся переместить
    if (selectedStack) {
      const { cards, source } = selectedStack;
      const topCard = cards[0];
      // перемещение на колонку
      if (canPlaceStackOnTableau(topCard, colIndex)) {
        removeFromSource(source);
        setTableau((prev) => {
          const copy = prev.map((c) => [...c]);
          copy[colIndex].push(...cards);
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
    setSelectedStack({ cards: cardsToMove, source: { type: "tableau", col: colIndex, index: cardIndex } });
  };

  const handleFoundationClick = (suit) => {
    if (!selectedStack) return;
    const { cards, source } = selectedStack;
    if (cards.length === 1 && canPlaceCardOnFoundation(cards[0], suit)) {
      removeFromSource(source);
      setFoundations((f) => ({ ...f, [suit]: [...f[suit], cards[0]] }));
      setMoves((m) => m + 1);
      setScore((s) => s + 10);
      showRandomCompliment();
      setSelectedStack(null);
    } else {
      setSelectedStack(null);
    }
  };

  const showRandomCompliment = (prob = 0.15) => {
    if (Math.random() > prob) return; // 92% случаев — без комплимента
    setComplimentText(compliments[Math.floor(Math.random() * compliments.length)]);
    setShowCompliment(true);
    setTimeout(() => setShowCompliment(false), 3000);
  };

  const formatTime = (s) => `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // --- render ---
  return (
    <div className="solitaire-page">
      <AnimatedBackground />
      <FloatingElements />

      <div className="solitaire-container">
        <h1 className="game-title">Косынка 🃏</h1>

        <div className="game-stats">
          <div>Ходы: {moves}</div>
          <div>Время: {formatTime(time)}</div>
          <div>Очки: {score}</div>
        </div>

        <div className="top-row">
          <div className="deck-container">
            <div className="deck-placeholder stock" onClick={drawFromStock}>
              {stock.length ? <div className="card-back">🃏</div> : <div className="empty-placeholder"></div>}
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
                <div className="empty-placeholder"></div>
              )}
            </div>
          </div>

          <div className="foundations">
            {suits.map((s) => (
              <div
                key={s}
                className={`foundation ${s}`}
                onClick={() => handleFoundationClick(s)}
              >
                {foundations[s].length ? (
                  <div className={`card face-up ${getSuitColor(s)}`}>
                    <div className="card-rank">{foundations[s][foundations[s].length - 1].rank}</div>
                    <div className="card-suit">{getSuitSymbol(s)}</div>
                  </div>
                ) : (
                  <div className="empty-placeholder">{getSuitSymbol(s)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="tableau">
          {tableau.map((col, colIndex) => (
            <div
              key={colIndex}
              className="tableau-column"
              onClick={() => {
                if (selectedStack) handleCardClick(col[col.length - 1], colIndex, col.length);
              }}
            >
              {col.length === 0 && <div className="empty-placeholder">🂠</div>}
              {col.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className={`card ${card.isFaceUp ? "face-up" : "face-down"} ${getSuitColor(card.suit)} ${
                    selectedStack && selectedStack.cards.some((c) => c.id === card.id)
                      ? "selected"
                      : ""
                  }`}
                  style={{ marginTop: cardIndex > 0 ? "-80px" : 0, zIndex: cardIndex }}
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
              ))}
            </div>
          ))}
        </div>

        <div >
          <button className="game-button" onClick={dealCards}>Новая игра 🔄</button>
        </div>

        <Link to="/" className="back-button">
          ← Назад
        </Link>
      </div>

      {showCompliment && (
        <div className="compliment-message show">
          <h3>{complimentText}</h3>
        </div>
      )}
    </div>
  );
};

export default Solitaire;

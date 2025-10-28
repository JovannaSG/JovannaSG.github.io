import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../Shared/AnimatedBackground';
import FloatingElements from '../Shared/FloatingElements';
import './Game.css';

const Game = () => {
  const [board, setBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [combinations, setCombinations] = useState(0);
  const [showCompliment, setShowCompliment] = useState(false);
  const [complimentText, setComplimentText] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const cellTypes = ['💖', '✨', '🌟', '🎀', '💕', '🌸'];
  const compliments = [
    "Молодец! Ты просто умничка! ✨",
    "Великолепно! Ты справляешься просто прекрасно! 💫",
    "Потрясающе! У тебя отлично получается! 🌸",
    "Браво! Твои навыки впечатляют! 💖",
    "Замечательно! Ты находишь лучшие комбинации! 🌟"
  ];

  // Инициализация игры
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newBoard = createInitialBoard();
    setBoard(newBoard);
    setScore(0);
    setCombinations(0);
  };

  const createInitialBoard = () => {
    const newBoard = [];
    for (let i = 0; i < 8; i++) {
      newBoard[i] = [];
      for (let j = 0; j < 8; j++) {
        newBoard[i][j] = getRandomCellType();
      }
    }
    return newBoard;
  };

  const getRandomCellType = () => {
    return cellTypes[Math.floor(Math.random() * cellTypes.length)];
  };

  const handleCellClick = (row, col) => {
    if (isSwapping) return;

    if (!selectedCell) {
      // Первое выделение
      setSelectedCell({ row, col });
    } else {
      // Второе выделение - попытка обмена
      const firstCell = selectedCell;

      // Проверяем, являются ли ячейки соседями
      if (areNeighbors(firstCell.row, firstCell.col, row, col)) {
        swapCells(firstCell.row, firstCell.col, row, col);
      }

      setSelectedCell(null);
    }
  };

  const areNeighbors = (row1, col1, row2, col2) => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const swapCells = (row1, col1, row2, col2) => {
    setIsSwapping(true);

    const newBoard = [...board];
    [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];
    setBoard(newBoard);

    // Проверяем, образовались ли комбинации
    setTimeout(() => {
      const matches = findAllMatches(newBoard);
      if (matches.length > 0) {
        processMatches(matches, newBoard);
      } else {
        // Если комбинаций нет, возвращаем обратно
        const revertedBoard = [...newBoard];
        [revertedBoard[row1][col1], revertedBoard[row2][col2]] = [revertedBoard[row2][col2], revertedBoard[row1][col1]];
        setBoard(revertedBoard);
        setIsSwapping(false);
      }
    }, 300);
  };

  const findAllMatches = (currentBoard) => {
    const matches = [];

    // Проверяем горизонтальные совпадения
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        if (currentBoard[i][j] !== '' &&
          currentBoard[i][j] === currentBoard[i][j + 1] &&
          currentBoard[i][j] === currentBoard[i][j + 2]) {
          
          const match = [];
          for (let k = j; k < 8; k++) {
            if (currentBoard[i][k] === currentBoard[i][j]) {
              match.push({ row: i, col: k });
            } else {
              break;
            }
          }
          if (match.length >= 3) {
            matches.push(match);
          }
          j += match.length - 1;
        }
      }
    }

    // Проверяем вертикальные совпадения
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 6; i++) {
        if (currentBoard[i][j] !== '' &&
          currentBoard[i][j] === currentBoard[i + 1][j] &&
          currentBoard[i][j] === currentBoard[i + 2][j]) {
          
          const match = [];
          for (let k = i; k < 8; k++) {
            if (currentBoard[k][j] === currentBoard[i][j]) {
              match.push({ row: k, col: j });
            } else {
              break;
            }
          }
          if (match.length >= 3) {
            matches.push(match);
          }
          i += match.length - 1;
        }
      }
    }

    return matches;
  };

  const processMatches = (matches, currentBoard) => {
    let newBoard = [...currentBoard];
    
    // Удаляем совпавшие ячейки
    matches.forEach(match => {
      match.forEach(cell => {
        newBoard[cell.row][cell.col] = '';
      });
    });

    setBoard(newBoard);
    setCombinations(prev => prev + matches.length);
    setScore(prev => prev + matches.reduce((sum, match) => sum + match.length * 10, 0));
    showRandomCompliment();

    // Заполняем пустые места через секунду
    setTimeout(() => {
      fillBoard(newBoard);
    }, 500);
  };

  const fillBoard = (currentBoard) => {
    const newBoard = [...currentBoard];
    
    // Опускаем элементы вниз
    for (let j = 0; j < 8; j++) {
      let emptySpaces = 0;
      for (let i = 7; i >= 0; i--) {
        if (newBoard[i][j] === '') {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newBoard[i + emptySpaces][j] = newBoard[i][j];
          newBoard[i][j] = '';
        }
      }

      // Заполняем пустые места сверху
      for (let i = 0; i < emptySpaces; i++) {
        newBoard[i][j] = getRandomCellType();
      }
    }

    setBoard(newBoard);
    setIsSwapping(false);

    // Проверяем новые совпадения после заполнения
    setTimeout(() => {
      const newMatches = findAllMatches(newBoard);
      if (newMatches.length > 0) {
        processMatches(newMatches, newBoard);
      }
    }, 300);
  };

  const showRandomCompliment = () => {
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    setComplimentText(randomCompliment);
    setShowCompliment(true);
    
    setTimeout(() => {
      setShowCompliment(false);
    }, 2000);
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleHint = () => {
    showRandomCompliment();
  };

  return (
    <div className="game-page">
      <AnimatedBackground />
      <FloatingElements />
      
      <div className="game-container">
        <h1 className="game-title">Три в ряд! 💖</h1>

        <div className="game-stats">
          <div className="stat-item">
            <div className="stat-value">{score}</div>
            <div>Очки</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{combinations}</div>
            <div>Комбинации</div>
          </div>
        </div>

        <div className="game-board">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`game-cell ${
                  selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected' : ''
                } ${cell === '' ? 'empty' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            ))
          )}
        </div>

        <div className="game-controls">
          <button className="game-button" onClick={handleHint}>
            Подсказка 💡
          </button>
          <button className="game-button" onClick={handleRestart}>
            Заново 🔄
          </button>
        </div>

        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Вернуться назад
        </Link>
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

export default Game;
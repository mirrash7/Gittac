import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import './App.css';

function App() {
  const GRID_SIZE = 20;
  const [gameOver, setGameOver] = useState(false);
  const [board, setBoard] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [moves, setMoves] = useState([]);
  const [winningCells, setWinningCells] = useState([]);
  const [moveCount, setMoveCount] = useState({ X: 0, O: 0 });
  const [winReason, setWinReason] = useState('');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetGame = () => {
    setBoard(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));
    setCurrentPlayer('X');
    setMoves([]);
    setGameOver(false);
    setWinningCells([]);
    setMoveCount({ X: 0, O: 0 });
    setWinReason('');
  };

  const isValidPosition = (row, col) => {
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
  };

  const handleClick = (row, col) => {
    if (gameOver || board[row][col]) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    const newMoves = [{ row, col, player: currentPlayer }, ...moves];
    setMoves(newMoves);
    
    setMoveCount(prev => ({
      ...prev,
      [currentPlayer]: prev[currentPlayer] + 1
    }));
    
    const checkWin = (row, col) => {
      const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
      const player = newBoard[row][col];
      
      for (const [dx, dy] of directions) {
        let sequence = [[row, col]];
        
        // Check forward direction
        for (let i = 1; i <= 4; i++) {
          const newRow = row + dx * i;
          const newCol = col + dy * i;
          
          if (!isValidPosition(newRow, newCol)) break;
          if (newBoard[newRow][newCol] !== player) break;
          sequence.push([newRow, newCol]);
        }
        
        // Check backward direction
        for (let i = 1; i <= 4; i++) {
          const newRow = row - dx * i;
          const newCol = col - dy * i;
          
          if (!isValidPosition(newRow, newCol)) break;
          if (newBoard[newRow][newCol] !== player) break;
          sequence.push([newRow, newCol]);
        }

        if (sequence.length >= 5) {
          return { count: sequence.length, winCells: sequence };
        }
      }
      return { count: 0, winCells: [] };
    };

    const { count, winCells } = checkWin(row, col);
    if (count >= 5) {
      setWinningCells(winCells);
      setWinReason(count > 5 ? 'SUPER WIN!' : 'five in a row');
      setGameOver(true);
      return;
    } else if (newMoves.length === GRID_SIZE * GRID_SIZE) {
      setWinningCells([]);
      setWinReason('filled the last square');
      setGameOver(true);
      return;
    }
    
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  return (
    <div className="game-container">
      {gameOver && !winReason.includes('filled') && (
        <div className="confetti-container">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={winReason.includes('SUPER') ? 500 : 200}
            colors={winReason.includes('SUPER') ? 
              ['#FFD700', '#FFA500', '#FF4500', '#FF0000'] : 
              ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f']}
          />
        </div>
      )}
      <h1 className="game-title">Tic Tac Five</h1>
      <div className="main-content">
        <div className="board-container">
          <div className="coordinates-top">
            {[1, 5, 10, 15, 20].map((num) => (
              <span key={num} style={{ left: `${(num) * 24.25}px` }}>{num}</span>
            ))}
          </div>
          <div className="coordinates-left">
            {[1, 5, 10, 15, 20].map((num) => (
              <span key={num} style={{ top: `${(num) * 24.25}px` }}>{num}</span>
            ))}
          </div>
          <div className="board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${cell === 'X' ? 'x-cell' : cell === 'O' ? 'o-cell' : ''} ${
                      winningCells.some(([r, c]) => r === rowIndex && c === colIndex) ? 'winning-cell' : ''
                    }`}
                    onClick={() => handleClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="side-panel">
          <div className="game-info">
            <div className="current-player">
              Current Player: <span className={`player-${currentPlayer}`}>{currentPlayer}</span>
            </div>
            <button className="reset-button" onClick={resetGame}>
              Restart Game
            </button>
            {gameOver && (
              <div className={`winner-message ${winReason.includes('SUPER') ? 'super-win' : ''}`}>
                Player {currentPlayer} wins in {moveCount[currentPlayer]} moves - {winReason}!
              </div>
            )}
          </div>
          <div className="moves-list">
            <h3>Move History</h3>
            <div className="moves-container">
              {moves.map((move, index) => (
                <div key={index} className="move">
                  <span className={`player-${move.player}`}>{move.player}</span>: ({move.row + 1}, {move.col + 1})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 
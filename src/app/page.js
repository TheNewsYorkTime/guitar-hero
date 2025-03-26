"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./game.css";
import chordArray from "./chords.js";
const turistaAudio = "/turistaAudio.mp3";
const turistaAudio2 = "/turistaAudio2.mp3";

const stringX = [50, 100, 150, 200, 350, 400, 450, 500];
const speed = 4;

const Game = () => {
  const [buttons, setButtons] = useState(Array(8).fill(false));
  const [buttonsAbleToHit, setButtonsAbleToHit] = useState(Array(8).fill(true));
  const [dots, setDots] = useState([]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameState, setGameState] = useState("start");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const buttonsY = 480;
  const audioRef = useRef(null);
  const scoreGetNote = 5, scoreMissNote = -1, scoreNotePass = -1;

  useEffect(() => {
    if (gameState !== "game") return;
  
    let currentNote = 0;
    const interval = setInterval(() => {
      setDots(prevDots => {
        const newDots = [...prevDots];
        
        // Add notes for first 4 strings (player 1)
        for (let i = 0; i < 4; i++) {
          if (chordArray[currentNote][i]) {
            newDots.push({
              x: stringX[i],
              y: -100
            });
          }
        }
        
        // Add notes for next 4 strings (player 2)
        for (let i = 0; i < 4; i++) {
          if (chordArray[currentNote][i]) {
            newDots.push({
              x: stringX[i + 4],
              y: -100
            });
          }
        }
        
        return newDots;
      });
  
      currentNote = (currentNote + 1) % chordArray.length; // Loop through chords
    }, 500);
  
    return () => clearInterval(interval);
  }, [gameState, chordArray]);

  useEffect(() => {
    const interval = setInterval(() => {
      if(gameState == "game"){
        setDots((prevDots) => {
          prevDots.forEach(dot => {
            if (dot.y > 600) {
              for (let i = 0; i < 7; i++) {
                if (dot.x === stringX[i] && (i <= 3)) {
                  setScore1(prev => prev + scoreNotePass);
                }
                if (dot.x === stringX[i] && (i >= 4)) {
                  setScore2(prev => prev + scoreNotePass);
                }
              }
            }
          });
          return prevDots
            .filter(dot => dot.y <= 600)
            .map(dot => ({
              ...dot,
              y: dot.y + speed
            }));
        });
        
      }
    }, 40);
    return () => clearInterval(interval);
  }, [gameState]);

  const checkForHit = (buttonNum) => {
    if (buttonsAbleToHit[buttonNum]) {
      let hit = false;
      setDots((prevDots) =>
        prevDots.map((dot) => {
          if (
            dot.x === stringX[buttonNum] &&
            dot.y > buttonsY - 30 &&
            dot.y < buttonsY + 30
          ) {
            hit = true;
            if (buttonNum <= 3) setScore1((prev) => prev + scoreGetNote);
            else setScore2((prev) => prev + scoreGetNote);
            return { x: stringX[Math.floor(Math.random() * stringX.length)], y: Math.floor(Math.random() * 40) * -15 };
          }
          
          return dot;
        }),
      );
      if(!hit){
        if (buttonNum <= 3) setScore1((prev) => prev + scoreMissNote);
        else setScore2((prev) => prev + scoreMissNote);
      }
      const newButtonsAbleToHit = [...buttonsAbleToHit];
      newButtonsAbleToHit[buttonNum] = false;
      setButtonsAbleToHit(newButtonsAbleToHit);
    }
  };

  const handleKeyDown = (event) => {
    if(event.repeat) return;

    if(gameState == "start" && !audioPlaying){
      setGameState("game");
      setAudioPlaying(true);
      audioRef.current = new Audio(turistaAudio2);
      audioRef.current.play();

      audioRef.current.addEventListener("ended", () => {
        setGameState("winScreen");
        setAudioPlaying(false);
        audioRef.current = null;
      });
      return;
    }
    
    if(gameState == "winScreen"){
      setScore1(0);
      setScore2(0);
      setGameState("start");
      setDots([]);
      return;
    }
    const keyMap = { q: 0, w: 1, e: 2, r: 3, u: 4, i: 5, o: 6, p: 7 };
    if (keyMap[event.key] !== undefined && gameState == "game") {
      const buttonPressed = keyMap[event.key];
      const newButtons = [...buttons];
      newButtons[buttonPressed] = true;
      setButtons(newButtons);
      checkForHit(buttonPressed);
    }
  };

  
  const handleKeyUp = (event) => {
    const keyMap = { q: 0, w: 1, e: 2, r: 3, u: 4, i: 5, o: 6, p: 7 };
    if (keyMap[event.key] !== undefined) {
      const buttonReleased = keyMap[event.key];
      const newButtons = [...buttons];
      newButtons[buttonReleased] = false;
      setButtons(newButtons);
      const newButtonsAbleToHit = [...buttonsAbleToHit];
      newButtonsAbleToHit[buttonReleased] = true;
      setButtonsAbleToHit(newButtonsAbleToHit);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [buttons, buttonsAbleToHit, gameState, audioPlaying]);

  let highscore = Cookies.get("highscore");

  if (gameState == "game") {
    return (
      <div className="game-container">
        <h1>Score: {score1} : {score2}</h1>
        <svg width="550" height="600" className="game-board">
          {stringX.map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={0}
              x2={x}
              y2={600}
              stroke="white"
              strokeWidth="3"
            />
          ))}
          {dots.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={15} />
          ))}
          {buttons.map((pressed, i) => (
            <rect
              key={i}
              x={stringX[i] - 20}
              y={buttonsY - 20}
              width={40}
              height={40}
              fill={pressed ? "black" : "white"}
              stroke="black"
            />
          ))}
        </svg>
      </div>
    );
  } else if (gameState == "start") {
    return (
      <div className="game-container" id="menu-container">
        <div id="highscore">
          <p>{highscore ? "Highscore: " + highscore : ""}</p>
        </div>
        <div className="game-menu">
          <div className="game-start-text">Turista: El Juego de Guitarra</div>
          <h2>¡Haga clic en cualquier tecla(key) para continuar!</h2>
        </div>
      </div>
    );
  }
  else if(gameState == "winScreen"){
    const winner = score1 > score2 ? "Player 1" : 
                score2 > score1 ? "Player 2" : 
                "It's a tie!";
    return (
      <div className="game-container">
        <h1>Resultado final: {score1} : {score2}</h1>
        <div className="winner-text">¡{winner} ha ganado!</div>
        <div className="restart-instruction">Haga clic en cualquier tecla(key) para jugar de nuevo</div>
      </div>
    );
  }
};

export default Game;

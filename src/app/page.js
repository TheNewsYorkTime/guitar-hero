"use client"
import React, { useState, useEffect } from "react";
import "./game.css";

const turistaAudio = "/turistaAudio.mp3";
const turistaAudio2 = "/turistaAudio2.mp3";

const stringX = [50, 100, 150, 200, 350, 400, 450, 500];
const numDots = 20;
const speed = 4;

const Game = () => {
  const [buttons, setButtons] = useState(Array(8).fill(false));
  const [buttonsAbleToHit, setButtonsAbleToHit] = useState(Array(8).fill(true));
  const [dots, setDots] = useState([]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameState, setGameState] = useState("start");
  const buttonsY = 480;

  useEffect(() => {
    const initialDots = Array.from({ length: numDots }, () => {
      const randIndex = Math.floor(Math.random() * stringX.length);
      return { x: stringX[randIndex], y: Math.floor(Math.random() * 40) * -15 };
    });
    setDots(initialDots);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if(gameState == "game"){
        setDots((prevDots) =>
          prevDots.map((dot) =>
            dot.y > 600
              ? { x: stringX[Math.floor(Math.random() * stringX.length)], y: Math.floor(Math.random() * 40) * -15 }
              : { ...dot, y: dot.y + speed }
          )
        );
      }
    }, 40);
    return () => clearInterval(interval);
  }, [gameState]);

  const checkForHit = (buttonNum) => {
    if (buttonsAbleToHit[buttonNum]) {
      setDots((prevDots) =>
        prevDots.map((dot) => {
          if (
            dot.x === stringX[buttonNum] &&
            dot.y > buttonsY - 30 &&
            dot.y < buttonsY + 30
          ) {
            if (buttonNum <= 3) setScore1((prev) => prev + 0.5);
            else setScore2((prev) => prev + 0.5);
            return { x: stringX[Math.floor(Math.random() * stringX.length)], y: Math.floor(Math.random() * 40) * -15 };
          }
          return dot;
        })
      );
      const newButtonsAbleToHit = [...buttonsAbleToHit];
      newButtonsAbleToHit[buttonNum] = false;
      setButtonsAbleToHit(newButtonsAbleToHit);
    }
  };

  const handleKeyDown = (event) => {
    if(gameState == "start"){
      setGameState("game");
      const audio = new Audio(turistaAudio2);
      audio.play();
    }
    const keyMap = { q: 0, w: 1, e: 2, r: 3, u: 4, i: 5, o: 6, p: 7 };
    if (keyMap[event.key] !== undefined) {
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
  }, [buttons, buttonsAbleToHit]);

  if(gameState == "game"){
    return (
      <div className="game-container">
        <h1>Score: {score1} - {score2}</h1>
        <svg width="550" height="600" className="game-board">
          {stringX.map((x, i) => (
            <line key={i} x1={x} y1={0} x2={x} y2={600} stroke="white" strokeWidth="3" />
          ))}
          {dots.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={15} fill="#E010D6" />
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
  }
  else if(gameState == "start"){
    return(
      <div className="game-container" id="menu-container">
        <div className="game-start-text">Turista Guitar Game</div>
        <h1>Click any key to play!</h1>
      </div>
    )
  }
};

export default Game;

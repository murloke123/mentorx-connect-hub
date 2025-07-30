//This snippet is using styled-components. Install it with npm i styled-components or yarn add styled-components, or copy the styles to your own CSS file for this code to work.

import React from "react";
import styled from 'styled-components';

interface TagHeroProps {
  onClick?: () => void;
  isPublicAccount?: boolean;
}

const TagHero: React.FC<TagHeroProps> = ({ onClick, isPublicAccount = false }) => {
  return (
    <StyledWrapper>
      <button className="hacker-button" onClick={onClick}>
        <span>{isPublicAccount ? "Sua conta ja esta publicada" : "Publicar minha conta"}</span>
        <div className="border-anim" />
        <div className="particles">
          <div className="particle particle-1" />
          <div className="particle particle-2" />
          <div className="particle particle-3" />
          <div className="particle particle-4" />
          <div className="particle particle-5" />
        </div>
        <div className="click-particle click-1" />
        <div className="click-particle click-2" />
        <div className="click-particle click-3" />
        <div className="click-particle click-4" />
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .hacker-button {
    position: relative;
    padding: 12px 24px;
    font-family: "Courier New", monospace;
    font-size: 14px;
    text-transform: uppercase;
    color: #ffcc00; /* Cheetah gold */
    background: #000;
    border: 1px solid #ffcc00; /* Solid border without transparency */
    border-radius: 5px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    z-index: 1;
  }

  /* Scan effect with cheetah speed */
  .hacker-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 204, 0, 0.3),
      transparent
    );
    animation: scan 2s linear infinite; /* Faster for cheetah theme */
  }

  /* Cheetah spots background */
  .hacker-button::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle,
        rgba(255, 204, 0, 0.2) 10%,
        transparent 11%
      ),
      radial-gradient(
        circle at 70% 30%,
        rgba(255, 204, 0, 0.15) 8%,
        transparent 9%
      ),
      radial-gradient(
        circle at 20% 80%,
        rgba(255, 204, 0, 0.25) 7%,
        transparent 8%
      );
    background-size:
      20px 20px,
      25px 25px,
      15px 15px;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: spot-shift 3s infinite ease-in-out;
  }

  /* Simulated particle effects (cheetah dust) */
  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .particle {
    position: absolute;
    width: 5px;
    height: 5px;
    background: #ffcc00;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .particle-1 {
    top: 15%;
    left: 25%;
    animation: particle-move-1 1.8s infinite;
  }
  .particle-2 {
    top: 35%;
    left: 65%;
    animation: particle-move-2 2.2s infinite;
  }
  .particle-3 {
    top: 55%;
    left: 45%;
    animation: particle-move-3 1.6s infinite;
  }
  .particle-4 {
    top: 75%;
    left: 15%;
    animation: particle-move-4 2s infinite;
  }
  .particle-5 {
    top: 25%;
    left: 85%;
    animation: particle-move-5 2.1s infinite;
  }

  .click-particle {
    position: absolute;
    width: 7px;
    height: 7px;
    background: #ffcc00;
    border-radius: 50%;
    opacity: 0;
    z-index: 2;
  }

  .click-1 {
    top: 50%;
    left: 50%;
    animation: click-sparkle-1 0.5s ease-out;
  }
  .click-2 {
    top: 40%;
    left: 60%;
    animation: click-sparkle-2 0.5s ease-out;
  }
  .click-3 {
    top: 60%;
    left: 40%;
    animation: click-sparkle-3 0.5s ease-out;
  }
  .click-4 {
    top: 30%;
    left: 50%;
    animation: click-sparkle-4 0.5s ease-out;
  }

  /* Hover effects - REMOVIDOS */
  .hacker-button:hover {
    /* Sem efeitos de hover */
  }

  .hacker-button:hover .particle {
    /* Sem efeitos de hover nas partículas */
  }

  /* Active effects */
  .hacker-button:active {
    transform: scale(0.95);
    box-shadow: 0 0 10px #ffcc00;
    animation: none;
  }

  .hacker-button:active .click-particle {
    opacity: 1;
  }

  /* Text effects */
  .hacker-button span {
    position: relative;
    display: inline-block;
    transition: transform 0.1s;
  }

  .hacker-button:hover span {
    /* Sem animações de texto no hover */
  }

  /* Border animation */
  .hacker-button .border-anim {
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border: 1px dashed #ffcc00; /* Solid border without transparency */
    opacity: 0.6;
    animation: border-leap 2s infinite linear;
  }

  /* Animations */
  @keyframes scan {
    0% {
      transform: translateX(-100%) skewX(15deg);
    }
    100% {
      transform: translateX(200%) skewX(-15deg);
    }
  }

  @keyframes glitch-text {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-3px, 2px);
    }
    40% {
      transform: translate(-2px, -3px);
    }
    60% {
      transform: translate(3px, 1px);
    }
    80% {
      transform: translate(2px, -2px);
    }
    100% {
      transform: translate(0);
    }
  }

  @keyframes spot-shift {
    0% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(5px, -5px);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(0.9);
      opacity: 0;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.4;
    }
    100% {
      transform: scale(0.9);
      opacity: 0;
    }
  }

  @keyframes pounce {
    0% {
      transform: translateY(-5px) scale(1.05);
    }
    50% {
      transform: translateY(-7px) scale(1.06);
    }
    100% {
      transform: translateY(-5px) scale(1.05);
    }
  }

  @keyframes claw-scratch {
    0% {
      opacity: 1;
    }
    15% {
      opacity: 0.8;
      transform: skewX(5deg);
    }
    30% {
      opacity: 1;
      transform: skewX(-5deg);
    }
    45% {
      opacity: 0.7;
    }
    60% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes border-leap {
    0% {
      transform: scale(1) translateX(10%);
    }
    40% {
      transform: scale(1) translateX(20%);
    }
    60% {
      transform: scale(1) translateX(35%);
    }
    100% {
      transform: scale(1) translateX(100%);
    }
  }

  @keyframes particle-move-1 {
    0% {
      transform: translate(0, 0);
      opacity: 0.8;
    }
    50% {
      transform: translate(12px, -8px);
      opacity: 0.4;
    }
    100% {
      transform: translate(-6px, 4px);
      opacity: 0.8;
    }
  }

  @keyframes particle-move-2 {
    0% {
      transform: translate(0, 0);
      opacity: 0.8;
    }
    50% {
      transform: translate(-10px, 6px);
      opacity: 0.5;
    }
    100% {
      transform: translate(5px, -12px);
      opacity: 0.8;
    }
  }

  @keyframes particle-move-3 {
    0% {
      transform: translate(0, 0);
      opacity: 0.8;
    }
    50% {
      transform: translate(7px, 10px);
      opacity: 0.6;
    }
    100% {
      transform: translate(-7px, -5px);
      opacity: 0.8;
    }
  }

  @keyframes particle-move-4 {
    0% {
      transform: translate(0, 0);
      opacity: 0.8;
    }
    50% {
      transform: translate(-12px, -10px);
      opacity: 0.4;
    }
    100% {
      transform: translate(6px, 8px);
      opacity: 0.8;
    }
  }

  @keyframes particle-move-5 {
    0% {
      transform: translate(0, 0);
      opacity: 0.8;
    }
    50% {
      transform: translate(10px, -7px);
      opacity: 0.5;
    }
    100% {
      transform: translate(-5px, 6px);
      opacity: 0.8;
    }
  }

  @keyframes click-sparkle-1 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(25px, -25px);
      opacity: 0;
    }
  }

  @keyframes click-sparkle-2 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-20px, -20px);
      opacity: 0;
    }
  }

  @keyframes click-sparkle-3 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(15px, 30px);
      opacity: 0;
    }
  }

  @keyframes click-sparkle-4 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-15px, -25px);
      opacity: 0;
    }
  }`;

export default TagHero;

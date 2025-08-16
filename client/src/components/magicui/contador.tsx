import { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface CountdownState {
  startTime: number;
  totalDuration: number; // 15 dias em milissegundos
}

// Chave para armazenar a data de início
const COUNTDOWN_START_KEY = 'global-countdown-start-date';

// Função para obter a data de início (com fallback)
const getCountdownStartDate = (): number => {
  const stored = localStorage.getItem(COUNTDOWN_START_KEY);
  if (stored) {
    return parseInt(stored);
  }
  // Data padrão se não houver nada armazenado
  const defaultDate = new Date('2025-01-29T18:00:00Z').getTime();
  localStorage.setItem(COUNTDOWN_START_KEY, defaultDate.toString());
  return defaultDate;
};

// Função para definir nova data de início
export const setCountdownStartDate = (newDate: Date | number) => {
  const timestamp = typeof newDate === 'number' ? newDate : newDate.getTime();
  localStorage.setItem(COUNTDOWN_START_KEY, timestamp.toString());
  window.location.reload();
};

// Função para resetar o countdown (exportada para uso externo)
export const resetCountdown = () => {
  const newStartDate = Date.now();
  setCountdownStartDate(newStartDate);
};

// Função para obter a data atual de início (exportada para uso externo)
export const getCurrentStartDate = (): Date => {
  return new Date(getCountdownStartDate());
};

const Card = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const TOTAL_DURATION = 15 * 24 * 60 * 60 * 1000; // 15 dias em ms

    // Função para ativar animação de uma unidade específica
    const activateAnimation = (selector: string) => {
      const elements = containerRef.current?.querySelectorAll(selector);
      elements?.forEach((el) => {
        (el as HTMLElement).style.animationPlayState = 'running';
      });
    };

    // Calcular tempo decorrido desde o início GLOBAL (persistido)
    const startDate = getCountdownStartDate();
    const elapsedTime = Date.now() - startDate;

    // Se o countdown já terminou, calcular o ciclo atual
    let currentElapsedTime = elapsedTime;
    if (elapsedTime >= TOTAL_DURATION) {
      // Calcular quantos ciclos completos se passaram
      const completedCycles = Math.floor(elapsedTime / TOTAL_DURATION);
      currentElapsedTime = elapsedTime - (completedCycles * TOTAL_DURATION);
    }

    // Ativar animações baseado no tempo decorrido REAL
    const secondsElapsed = Math.floor(currentElapsedTime / 1000);

    console.log('🕒 Tempo decorrido (segundos):', secondsElapsed); // Debug

    // Minutos: ativam se já passaram 60s
    if (secondsElapsed >= 60) {
      activateAnimation('.nums-minutes-one .num, .nums-minutes-ten .num');
    } else {
      const minutesTimer = setTimeout(() => {
        activateAnimation('.nums-minutes-one .num, .nums-minutes-ten .num');
      }, (60 - (secondsElapsed % 60)) * 1000);
    }

    // Horas: ativam se já passaram 3600s (1h)
    if (secondsElapsed >= 3600) {
      activateAnimation('.nums-hours-one .num, .nums-hours-ten .num');
    } else if (secondsElapsed >= 60) {
      const hoursTimer = setTimeout(() => {
        activateAnimation('.nums-hours-one .num, .nums-hours-ten .num');
      }, (3600 - secondsElapsed) * 1000);
    }

    // Dias: ativam se já passaram 86400s (24h)
    if (secondsElapsed >= 86400) {
      activateAnimation('.nums-days-one .num, .nums-days-ten .num');
    } else if (secondsElapsed >= 3600) {
      const daysTimer = setTimeout(() => {
        activateAnimation('.nums-days-one .num, .nums-days-ten .num');
      }, (86400 - secondsElapsed) * 1000);
    }

    // Limpar timers no cleanup (os timers serão limpos automaticamente se não executados)
    return () => {
      // Os timers são limpos automaticamente quando o componente desmonta
    };
  }, []);
  return (
    <StyledWrapper>
      <div className="container" ref={containerRef}>
        {/* Dias - começam em 15 */}
        <div className="time-unit">
          <div className="nums nums-days-ten">
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={1} />
          </div>
          <div className="nums nums-days-one">
            <div className="num" data-num={5} data-num-next={4} />
            <div className="num" data-num={4} data-num-next={3} />
            <div className="num" data-num={3} data-num-next={2} />
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={9} />
            <div className="num" data-num={9} data-num-next={8} />
            <div className="num" data-num={8} data-num-next={7} />
            <div className="num" data-num={7} data-num-next={6} />
            <div className="num" data-num={6} data-num-next={5} />
          </div>
          <div className="separator">:</div>
        </div>

        {/* Horas - começam em 23 (seguindo padrão dos dias) */}
        <div className="time-unit">
          <div className="nums nums-hours-ten">
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={2} />
          </div>
          <div className="nums nums-hours-one">
            <div className="num" data-num={3} data-num-next={2} />
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={9} />
            <div className="num" data-num={9} data-num-next={8} />
            <div className="num" data-num={8} data-num-next={7} />
            <div className="num" data-num={7} data-num-next={6} />
            <div className="num" data-num={6} data-num-next={5} />
            <div className="num" data-num={5} data-num-next={4} />
            <div className="num" data-num={4} data-num-next={3} />
          </div>
          <div className="separator">:</div>
        </div>

        {/* Minutos - começam em 59 (seguindo padrão dos dias) */}
        <div className="time-unit">
          <div className="nums nums-minutes-ten">
            <div className="num" data-num={5} data-num-next={4} />
            <div className="num" data-num={4} data-num-next={3} />
            <div className="num" data-num={3} data-num-next={2} />
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={5} />
          </div>
          <div className="nums nums-minutes-one">
            <div className="num" data-num={9} data-num-next={8} />
            <div className="num" data-num={8} data-num-next={7} />
            <div className="num" data-num={7} data-num-next={6} />
            <div className="num" data-num={6} data-num-next={5} />
            <div className="num" data-num={5} data-num-next={4} />
            <div className="num" data-num={4} data-num-next={3} />
            <div className="num" data-num={3} data-num-next={2} />
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={9} />
          </div>
          <div className="separator">:</div>
        </div>

        {/* Segundos - começam em 59 (seguindo padrão dos dias) */}
        <div className="time-unit">
          <div className="nums nums-seconds-ten">
            <div className="num" data-num={5} data-num-next={4} />
            <div className="num" data-num={4} data-num-next={3} />
            <div className="num" data-num={3} data-num-next={2} />
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={5} />
          </div>
          <div className="nums nums-seconds-one">
            <div className="num" data-num={9} data-num-next={8} />
            <div className="num" data-num={8} data-num-next={7} />
            <div className="num" data-num={7} data-num-next={6} />
            <div className="num" data-num={6} data-num-next={5} />
            <div className="num" data-num={5} data-num-next={4} />
            <div className="num" data-num={4} data-num-next={3} />
            <div className="num" data-num={3} data-num-next={2} />
            <div className="num" data-num={2} data-num-next={1} />
            <div className="num" data-num={1} data-num-next={0} />
            <div className="num" data-num={0} data-num-next={9} />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    height: 120px;
    position: relative;
    text-align: center;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .time-unit {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .separator {
    font-size: 60px;
    color: #eeeeee;
    font-weight: bold;
    margin: 0 8px;
    text-shadow: 0 1px 2px #333;
  }

  .nums {
    box-shadow: 0 2px 6px #111;
    border-top: 1px solid #393939;
    display: inline-block;
    height: 120px;
    perspective: 1000px;
    position: relative;
    width: 80px;
  }

  /* Responsividade para Mobile */
  @media (max-width: 768px) {
    .container {
      height: 80px;
      gap: 6px;
      transform: scale(0.8);
      transform-origin: center;
    }

    .separator {
      font-size: 40px;
      margin: 0 4px;
    }

    .nums {
      height: 80px;
      width: 55px;
    }
  }

  @media (max-width: 480px) {
    .container {
      height: 60px;
      gap: 4px;
      transform: scale(0.65);
    }

    .separator {
      font-size: 30px;
      margin: 0 2px;
    }

    .nums {
      height: 60px;
      width: 40px;
    }
  }

  .nums:before {
    border-bottom: 2px solid black;
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    transform: translate3d(0, -1px, 0);
    top: 50%;
    width: 100%;
    z-index: 1000;
  }

  .nums:after {
    backface-visibility: hidden;
    background: #2a2a2a;
    border-bottom: 1px solid #444444;
    border-top: 1px solid black;
    border-radius: 0 0 5px 5px;
    bottom: 0;
    box-shadow: inset 0 15px 50px #202020;
    color: #eeeeee;
    content: "0";
    display: block;
    font-size: 85px;
    height: calc(50% - 1px);
    left: 0;
    line-height: 0;
    overflow: hidden;
    position: absolute;
    text-align: center;
    text-shadow: 0 1px 2px #333;
    width: 100%;
    z-index: 0;
  }

  /* Valores iniciais específicos */
  .nums-days-ten:after { content: "1"; }
  .nums-days-one:after { content: "5"; }
  .nums-hours-ten:after { content: "2"; }
  .nums-hours-one:after { content: "3"; }
  .nums-minutes-ten:after { content: "5"; }
  .nums-minutes-one:after { content: "9"; }
  .nums-seconds-ten:after { content: "5"; }
  .nums-seconds-one:after { content: "9"; }

  .num {
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in;
    border-radius: 5px;
    font-size: 85px;
    height: 100%;
    left: 0;
    position: absolute;
    transform: rotateX(0);
    transition: 0.6s;
    transform-style: preserve-3d;
    top: 0;
    width: 100%;
  }

  /* Ajustes de fonte para mobile */
  @media (max-width: 768px) {
    .num {
      font-size: 60px;
    }
    
    .nums:after {
      font-size: 60px;
    }
  }

  @media (max-width: 480px) {
    .num {
      font-size: 45px;
    }
    
    .nums:after {
      font-size: 45px;
    }
  }

  .num:before,
  .num:after {
    backface-visibility: hidden;
    color: #eeeeee;
    display: block;
    height: 50%;
    left: 0;
    overflow: hidden;
    position: absolute;
    text-align: center;
    text-shadow: 0 1px 2px #333;
    width: 100%;
  }

  .num:before {
    background: #181818;
    border-radius: 5px 5px 0 0;
    box-shadow: inset 0 15px 50px #111111;
    content: attr(data-num);
    line-height: 1.38;
    top: 0;
    z-index: 1;
  }

  .num:after {
    background: #2a2a2a;
    border-bottom: 1px solid #444444;
    border-radius: 0 0 5px 5px;
    box-shadow: inset 0 15px 50px #202020;
    content: attr(data-num-next);
    height: calc(50% - 1px);
    line-height: 0;
    top: 0;
    transform: rotateX(180deg);
  }

  /* ANIMAÇÕES CONTROLADAS POR JAVASCRIPT */
  
  /* SEGUNDOS: Animam imediatamente */
  .nums-seconds-one .num:nth-of-type(1) { animation: flip 10s infinite; animation-delay: 0s; z-index: 10; }
  .nums-seconds-one .num:nth-of-type(2) { animation: flip 10s infinite; animation-delay: 1s; z-index: 9; }
  .nums-seconds-one .num:nth-of-type(3) { animation: flip 10s infinite; animation-delay: 2s; z-index: 8; }
  .nums-seconds-one .num:nth-of-type(4) { animation: flip 10s infinite; animation-delay: 3s; z-index: 7; }
  .nums-seconds-one .num:nth-of-type(5) { animation: flip 10s infinite; animation-delay: 4s; z-index: 6; }
  .nums-seconds-one .num:nth-of-type(6) { animation: flip 10s infinite; animation-delay: 5s; z-index: 5; }
  .nums-seconds-one .num:nth-of-type(7) { animation: flip 10s infinite; animation-delay: 6s; z-index: 4; }
  .nums-seconds-one .num:nth-of-type(8) { animation: flip 10s infinite; animation-delay: 7s; z-index: 3; }
  .nums-seconds-one .num:nth-of-type(9) { animation: flip 10s infinite; animation-delay: 8s; z-index: 2; }
  .nums-seconds-one .num:nth-of-type(10) { animation: flip 10s infinite; animation-delay: 9s; z-index: 1; }

  .nums-seconds-ten .num:nth-of-type(1) { animation: flip 60s infinite; animation-delay: 0s; z-index: 6; }
  .nums-seconds-ten .num:nth-of-type(2) { animation: flip 60s infinite; animation-delay: 10s; z-index: 5; }
  .nums-seconds-ten .num:nth-of-type(3) { animation: flip 60s infinite; animation-delay: 20s; z-index: 4; }
  .nums-seconds-ten .num:nth-of-type(4) { animation: flip 60s infinite; animation-delay: 30s; z-index: 3; }
  .nums-seconds-ten .num:nth-of-type(5) { animation: flip 60s infinite; animation-delay: 40s; z-index: 2; }
  .nums-seconds-ten .num:nth-of-type(6) { animation: flip 60s infinite; animation-delay: 50s; z-index: 1; }

  /* MINUTOS, HORAS E DIAS: Pausados inicialmente, ativados via JavaScript */
  .nums-minutes-one .num,
  .nums-minutes-ten .num,
  .nums-hours-one .num,
  .nums-hours-ten .num,
  .nums-days-one .num,
  .nums-days-ten .num {
    animation-play-state: paused;
  }

  /* Definições de animação para when JavaScript ativa */
  .nums-minutes-one .num:nth-of-type(1) { animation: flip 600s infinite; animation-delay: 0s; z-index: 10; }
  .nums-minutes-one .num:nth-of-type(2) { animation: flip 600s infinite; animation-delay: 60s; z-index: 9; }
  .nums-minutes-one .num:nth-of-type(3) { animation: flip 600s infinite; animation-delay: 120s; z-index: 8; }
  .nums-minutes-one .num:nth-of-type(4) { animation: flip 600s infinite; animation-delay: 180s; z-index: 7; }
  .nums-minutes-one .num:nth-of-type(5) { animation: flip 600s infinite; animation-delay: 240s; z-index: 6; }
  .nums-minutes-one .num:nth-of-type(6) { animation: flip 600s infinite; animation-delay: 300s; z-index: 5; }
  .nums-minutes-one .num:nth-of-type(7) { animation: flip 600s infinite; animation-delay: 360s; z-index: 4; }
  .nums-minutes-one .num:nth-of-type(8) { animation: flip 600s infinite; animation-delay: 420s; z-index: 3; }
  .nums-minutes-one .num:nth-of-type(9) { animation: flip 600s infinite; animation-delay: 480s; z-index: 2; }
  .nums-minutes-one .num:nth-of-type(10) { animation: flip 600s infinite; animation-delay: 540s; z-index: 1; }

  .nums-minutes-ten .num:nth-of-type(1) { animation: flip 3600s infinite; animation-delay: 0s; z-index: 6; }
  .nums-minutes-ten .num:nth-of-type(2) { animation: flip 3600s infinite; animation-delay: 600s; z-index: 5; }
  .nums-minutes-ten .num:nth-of-type(3) { animation: flip 3600s infinite; animation-delay: 1200s; z-index: 4; }
  .nums-minutes-ten .num:nth-of-type(4) { animation: flip 3600s infinite; animation-delay: 1800s; z-index: 3; }
  .nums-minutes-ten .num:nth-of-type(5) { animation: flip 3600s infinite; animation-delay: 2400s; z-index: 2; }
  .nums-minutes-ten .num:nth-of-type(6) { animation: flip 3600s infinite; animation-delay: 3000s; z-index: 1; }

  .nums-hours-one .num:nth-of-type(1) { animation: flip 36000s infinite; animation-delay: 0s; z-index: 10; }
  .nums-hours-one .num:nth-of-type(2) { animation: flip 36000s infinite; animation-delay: 3600s; z-index: 9; }
  .nums-hours-one .num:nth-of-type(3) { animation: flip 36000s infinite; animation-delay: 7200s; z-index: 8; }
  .nums-hours-one .num:nth-of-type(4) { animation: flip 36000s infinite; animation-delay: 10800s; z-index: 7; }
  .nums-hours-one .num:nth-of-type(5) { animation: flip 36000s infinite; animation-delay: 14400s; z-index: 6; }
  .nums-hours-one .num:nth-of-type(6) { animation: flip 36000s infinite; animation-delay: 18000s; z-index: 5; }
  .nums-hours-one .num:nth-of-type(7) { animation: flip 36000s infinite; animation-delay: 21600s; z-index: 4; }
  .nums-hours-one .num:nth-of-type(8) { animation: flip 36000s infinite; animation-delay: 25200s; z-index: 3; }
  .nums-hours-one .num:nth-of-type(9) { animation: flip 36000s infinite; animation-delay: 28800s; z-index: 2; }
  .nums-hours-one .num:nth-of-type(10) { animation: flip 36000s infinite; animation-delay: 32400s; z-index: 1; }

  .nums-hours-ten .num:nth-of-type(1) { animation: flip 86400s infinite; animation-delay: 0s; z-index: 3; }
  .nums-hours-ten .num:nth-of-type(2) { animation: flip 86400s infinite; animation-delay: 36000s; z-index: 2; }
  .nums-hours-ten .num:nth-of-type(3) { animation: flip 86400s infinite; animation-delay: 72000s; z-index: 1; }

  .nums-days-one .num:nth-of-type(1) { animation: flip 1296000s infinite; animation-delay: 0s; z-index: 10; }
  .nums-days-one .num:nth-of-type(2) { animation: flip 1296000s infinite; animation-delay: 86400s; z-index: 9; }
  .nums-days-one .num:nth-of-type(3) { animation: flip 1296000s infinite; animation-delay: 172800s; z-index: 8; }
  .nums-days-one .num:nth-of-type(4) { animation: flip 1296000s infinite; animation-delay: 259200s; z-index: 7; }
  .nums-days-one .num:nth-of-type(5) { animation: flip 1296000s infinite; animation-delay: 345600s; z-index: 6; }
  .nums-days-one .num:nth-of-type(6) { animation: flip 1296000s infinite; animation-delay: 432000s; z-index: 5; }
  .nums-days-one .num:nth-of-type(7) { animation: flip 1296000s infinite; animation-delay: 518400s; z-index: 4; }
  .nums-days-one .num:nth-of-type(8) { animation: flip 1296000s infinite; animation-delay: 604800s; z-index: 3; }
  .nums-days-one .num:nth-of-type(9) { animation: flip 1296000s infinite; animation-delay: 691200s; z-index: 2; }
  .nums-days-one .num:nth-of-type(10) { animation: flip 1296000s infinite; animation-delay: 777600s; z-index: 1; }

  .nums-days-ten .num:nth-of-type(1) { animation: flip 1296000s infinite; animation-delay: 0s; z-index: 2; }
  .nums-days-ten .num:nth-of-type(2) { animation: flip 1296000s infinite; animation-delay: 864000s; z-index: 1; }

  @keyframes flip {
    0% { transform: rotateX(0); z-index: 50; }
    10% { transform: rotateX(-180deg); z-index: 50; }
    90% { transform: rotateX(-180deg); z-index: 1; }
    90.0001% { transform: rotateX(0); }
    100% { transform: rotateX(0); }
  }
`;

export default Card;
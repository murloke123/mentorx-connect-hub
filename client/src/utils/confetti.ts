import confetti from 'canvas-confetti';

export const triggerSuccessConfetti = () => {
  // Efeito de confete da esquerda
  confetti({
    angle: 60,
    spread: 55,
    particleCount: 150,
    origin: { x: 0 },
    colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800']
  });

  // Efeito de confete da direita
  confetti({
    angle: 120,
    spread: 55,
    particleCount: 150,
    origin: { x: 1 },
    colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800']
  });

  // Efeito central após um pequeno delay
  setTimeout(() => {
    confetti({
      angle: 90,
      spread: 100,
      particleCount: 100,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800']
    });
  }, 250);
};

export const triggerEnrollmentConfetti = () => {
  // Explosão principal no centro
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  });

  // Efeitos laterais
  setTimeout(() => {
    confetti({
      angle: 60,
      spread: 55,
      particleCount: 100,
      origin: { x: 0 },
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
    });

    confetti({
      angle: 120,
      spread: 55,
      particleCount: 100,
      origin: { x: 1 },
      colors: ['#96CEB4', '#FFEAA7', '#DDA0DD']
    });
  }, 150);

  // Chuva de confete de cima
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 45,
      origin: { x: 0.5, y: 0 },
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    });
  }, 400);
}; 
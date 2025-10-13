class SweetApp {
  constructor() {
    this.complimentCount = 0;
    this.smileCount = 0;
    this.compliments = [
      "Ты умничка!!! 💖",
      "Ты сияешь ярче звезд! ✨",
      "Твоя улыбка делает мир лучше! 😊",
      "Ты вдохновляешь меня каждый день! 🌸",
      "Ты самая невероятная! 💫",
      "Твое сердце полно доброты! 💕",
      "Ты делаешь все вокруг красивее! 🌺",
      "Твоя энергия заряжает позитивом! ⚡"
    ];

    this.init();
  }

  init() {
    this.initTelegram();
    this.initEventListeners();
    this.startAnimations();
    this.initConfetti();
  }

  initTelegram() {
    if (window.Telegram && Telegram.WebApp) {
      const tg = Telegram.WebApp;
      tg.expand();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#667eea');
      tg.setBackgroundColor('#667eea');
    }
  }

  initEventListeners() {
    // Кнопка волшебства
    document.getElementById('magicBtn').addEventListener('click', () => {
      this.createMagicEffect();
      this.showRandomCompliment();
      this.createConfetti();
      this.incrementCounter('complimentCount');
    });

    // Кнопка любви
    document.getElementById('loveBtn').addEventListener('click', () => {
      this.sendLove();
      this.incrementCounter('smileCount');
    });

    // Закрытие модального окна
    document.getElementById('closeModal').addEventListener('click', () => {
      this.hideModal();
    });

    // Анимация аватара при клике
    document.getElementById('mainAvatar').addEventListener('click', () => {
      this.animateAvatar();
    });
  }

  startAnimations() {
    // Запуск счетчиков с анимацией
    this.animateCounter('complimentCount', 0, 42, 2000);
    this.animateCounter('smileCount', 0, 128, 2000);

    // Случайное изменение подзаголовка
    setInterval(() => {
      this.animateSubtitle();
    }, 3000);
  }

  animateCounter(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = value;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }

  incrementCounter(counterType) {
    const element = document.getElementById(counterType);
    const currentValue = parseInt(element.textContent);
    element.textContent = currentValue + 1;

    // Анимация увеличения
    element.style.transform = 'scale(1.3)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 300);
  }

  createMagicEffect() {
    const btn = document.getElementById('magicBtn');
    const rect = btn.getBoundingClientRect();

    // Создание частиц
    for (let i = 0; i < 10; i++) {
      this.createParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    // Анимация кнопки
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 150);
  }

  createParticle(x, y) {
    const particle = document.createElement('div');
    particle.innerHTML = ['✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 4)];
    particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${Math.random() * 20 + 10}px;
            pointer-events: none;
            z-index: 1000;
            transition: all 0.8s ease-out;
        `;

    document.body.appendChild(particle);

    // Анимация частицы
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    const targetX = x + Math.cos(angle) * distance;
    const targetY = y + Math.sin(angle) * distance;

    setTimeout(() => {
      particle.style.left = targetX + 'px';
      particle.style.top = targetY + 'px';
      particle.style.opacity = '0';
      particle.style.transform = 'scale(0)';
    }, 10);

    // Удаление частицы
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }

  showRandomCompliment() {
    const randomCompliment = this.compliments[Math.floor(Math.random() * this.compliments.length)];
    const subtitle = document.getElementById('subtitle');

    // Анимация смены текста
    subtitle.style.opacity = '0';
    subtitle.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      subtitle.textContent = randomCompliment;
      subtitle.style.opacity = '1';
      subtitle.style.transform = 'translateY(0)';
    }, 300);
  }

  animateSubtitle() {
    const subtitles = [
      "И вообще ты самая лучшая! 🌸",
      "Твои глаза как звезды! ✨",
      "Ты делаешь мир ярче! 💫",
      "Твоя улыбка - солнце! 🌞",
      "Ты невероятно талантлива! 🎨"
    ];

    const randomSubtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
    const subtitle = document.getElementById('subtitle');

    if (subtitle.textContent !== randomSubtitle) {
      subtitle.style.opacity = '0';
      setTimeout(() => {
        subtitle.textContent = randomSubtitle;
        subtitle.style.opacity = '1';
      }, 500);
    }
  }

  sendLove() {
    // Создание летающих сердечек
    for (let i = 0; i < 8; i++) {
      this.createFlyingHeart();
    }

    // Вибрация (если доступна)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  createFlyingHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '💖';
    heart.style.cssText = `
            position: fixed;
            bottom: 0;
            left: ${Math.random() * 100}vw;
            font-size: ${Math.random() * 20 + 20}px;
            pointer-events: none;
            z-index: 100;
            animation: flyUp ${Math.random() * 2 + 2}s ease-in forwards;
        `;

    document.body.appendChild(heart);

    setTimeout(() => {
      if (heart.parentNode) {
        heart.parentNode.removeChild(heart);
      }
    }, 3000);
  }

  animateAvatar() {
    const avatar = document.getElementById('mainAvatar');
    avatar.style.transform = 'scale(1.2) rotate(15deg)';
    setTimeout(() => {
      avatar.style.transform = 'scale(1) rotate(0deg)';
    }, 300);

    this.showSurpriseModal();
  }

  showSurpriseModal() {
    const modal = document.getElementById('surpriseModal');
    const messages = [
      "Каждый день с тобой - это праздник! 🎉",
      "Ты делаешь мою жизнь осмысленной! 💝",
      "Твое присутствие - самый лучший подарок! 🎁",
      "Я восхищаюсь твоей силой и добротой! 🌟",
      "Ты вдохновляешь меня становиться лучше! ✨"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('secretMessage').textContent = randomMessage;

    modal.classList.add('active');
  }

  hideModal() {
    const modal = document.getElementById('surpriseModal');
    modal.classList.remove('active');
  }

  initConfetti() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createConfetti() {
    const confettiCount = 150;
    const confetti = [];

    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        size: Math.random() * 10 + 5,
        color: this.getRandomColor(),
        speed: Math.random() * 3 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.2 - 0.1
      });
    }

    this.animateConfetti(confetti);
  }

  getRandomColor() {
    const colors = ['#ff6b8b', '#ffd166', '#48cae4', '#c77dff', '#ff9a76'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animateConfetti(confetti) {
    let animationId;
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeParticles = 0;

      confetti.forEach(particle => {
        particle.y += particle.speed;
        particle.x += Math.sin(particle.angle) * 2;
        particle.angle += particle.spin;

        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.angle);
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        this.ctx.restore();

        if (particle.y < this.canvas.height) {
          activeParticles++;
        }
      });

      if (activeParticles > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationId);
      }
    };

    animate();
  }
}

// Добавляем CSS для анимации летающих сердечек
const style = document.createElement('style');
style.textContent = `
    @keyframes flyUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  new SweetApp();
});
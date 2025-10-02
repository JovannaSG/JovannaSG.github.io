class TelegramApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    if (this.tg) {
      this.init();
    }
  }

  init() {
    // Расширяем на весь экран
    this.tg.expand();

    // Устанавливаем цвет фона
    this.tg.setBackgroundColor('#17212b');

    // Настраиваем основную кнопку
    this.tg.MainButton.setText('Готово');
    this.tg.MainButton.hide();

    // Обработчик закрытия
    this.tg.MainButton.onClick(() => {
      this.tg.close();
    });
  }

  showMainButton() {
    this.tg.MainButton.show();
  }

  hideMainButton() {
    this.tg.MainButton.hide();
  }

  // Получаем данные пользователя
  getUser() {
    return this.tg.initDataUnsafe?.user;
  }

  // Показываем уведомление
  showAlert(message) {
    this.tg.showAlert(message);
  }
}

// Создаем глобальный экземпляр
const telegramApp = new TelegramApp();
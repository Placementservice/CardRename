/*Addon.initialize({
  'card_buttons': async (cardButtonsContext) => {
    const buttons = [];
    buttons.push({
      text: 'Тестовая кнопка (не нажимать)',
      callback: async (callbackContext, callbackOptions) => {
        console.log('card test button 1 clicked, i will fetch all card properties and console log them');
        
        try {
          // Используем рекомендуемую функцию для получения всех данных
          const cardData = await callbackContext.getCardProperties();
          
          // Выводим весь объект целиком, чтобы изучить структуру
          console.log('Full card data object:', cardData);
          
          // Для удобства выведем ключевые блоки данных отдельно
          console.log('Title:', cardData.title);
          console.log('Custom Properties (Поля):', cardData.properties);
          
          // Если нужно увидеть структуру конкретного поля, можно развернуть properties
          if (cardData.properties) {
            console.table(cardData.properties);
          }

        } catch (err) {
          console.error('Error while fetching card properties:', err);
        }
      }
    });
    return buttons;
  }
});

// Оборачиваем в проверку, чтобы убедиться, что SDK загружен
if (typeof Addon !== 'undefined') {
  Addon.initialize({
    'card_buttons': (cardButtonsContext) => {
      // Возвращаем массив кнопок
      return [
        {
          text: 'Вывести свойства карточки',
          callback: async (callbackContext) => {
            console.log('--- Start fetching card properties ---');
            try {
              // Важно: getCardProperties — это асинхронный метод
              const properties = await callbackContext.getCardProperties();
              console.log('Данные карточки получены:', properties);
              
              // Дополнительно выведем в читаемом виде заголовок, если он есть
              if (properties && properties.title) {
                console.log('Название карточки: ' + properties.title);
              }
            } catch (err) {
              console.error('Ошибка при получении свойств:', err);
            }
          }
        }
      ];
    }
  });
} else {
  console.error('Kaiten Web SDK (Addon) не найден. Проверьте подключение скрипта в HTML.');
}


Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [];
      buttons.push({
        text: 'Вывести свойства карточки',
        callback: async (callbackContext, callbackOptions) => {
          console.log('Fetching card properties...');
          try {
            const properties = await callbackContext.getCardProperties();
            console.log('Card properties received:', properties);
          } catch (err) {
            console.error('Error while fetching card properties:', err);
          }
        }
      });
      return buttons;
    }
});
*/
Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [];
      buttons.push({
        text: 'Тестовая кнопка (не нажимать)',
        callback: async (callbackContext, callbackOptions) => {
          console.log('card test button 1 clicked, i will fetch card and simply console log it');
          try {
            const card = await callbackContext.getCardProperties(type);
            console.log('here is card title: ', card.name);
          } catch (err) {
            console.log('error while fetching card');
          }
        }
      });
      return buttons;
    }
  })


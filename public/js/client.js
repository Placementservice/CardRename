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

/*Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [];
      buttons.push({
        text: 'Тестовая кнопка (пока не нажимать 😜)',
        callback: async (callbackContext, callbackOptions) => {
          console.log('card test button 1 clicked, i will fetch card and simply console log it');
          try {
            const card = await callbackContext.getCard();
            console.log('here is card title: ', card.title);
          } catch (err) {
            console.log('error while fetching card');
          }
        }
      });
      return buttons;
    }
  })*/

Addon.initialize({
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
  })

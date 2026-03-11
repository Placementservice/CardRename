Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [];
      buttons.push({
        text: 'Тестовая кнопка (не нажимать)',
        callback: async (callbackContext, callbackOptions) => {
          console.log('Кнопка нажата');
          try {
            const card = await callbackContext.getCard();
            console.log('Весь массив card:', card);
          } catch (err) {
            console.log('error while fetching card');
          }
        }
      });
      return buttons;
    }
  })

/* const card = await callbackContext.getCard();
console.log('here is card title: ', card.title);*/ // Старая строка 9-10

/* const card = await callbackContext.getCard();
console.log('Весь массив card:', card);*/ // Старая строка 9-10 (не вывелся объект)

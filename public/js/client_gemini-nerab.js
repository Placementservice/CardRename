Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [];
      buttons.push({
        text: 'Test button 1',
        callback: async (callbackContext, callbackOptions) => {
          console.log('card test button 1 clicked, i will fetch card properties');
          try {
            // Используем метод getCardProperties для получения доп. полей
            const properties = await callbackContext.getCardProperties();
            
            // Выводим весь массив customProperties в консоль
            console.log('Custom Properties:', properties.customProperties);
          } catch (err) {
            console.log('error while fetching card properties', err);
          }
        }
      });
      return buttons;
    }
});

Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
      const buttons = [];
      buttons.push({
        text: 'Проверка API',
        callback: async (callbackContext, callbackOptions) => {
          console.log('Кнопка нажата');
          try {
            const card = await callbackContext.getCard();
            console.log('Название карточки: ', card.title);

            const api = window.Addon.iframe().getApiClient();

            const { access_token, expires_at } = await api.authorize();
            console.log('Authorized, token expires at:', expires_at);
              
          } catch (err) {
            console.log('error while fetching card or api');
          }
        }
      });
      return buttons;
    }
  })

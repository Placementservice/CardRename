Addon.initialize({
    settings: (settingsContext) => {
      return settingsContext.openPopup({
        title: 'Timer settings',
        url: './settings.html',
        height: 200,
        width: 300
      });
    },
    'card_body_section': async (bodySectionContext) => {
      const timerLogs = await bodySectionContext.getData('card', 'private', 'timerLogs');
  
      if (!timerLogs || !timerLogs.length) {
        return [];
      }
  
      return [{
        title: '📝 Timer logs',
        content: {
          type: 'iframe',
          url: bodySectionContext.signUrl('./timeLogs.html'),
          height: 200,
        }
      }]
    },
    'card_buttons': async (cardButtonsContext) => {
      const settings = await cardButtonsContext.getSettings();
      const buttons = [];
  
      const permissions = cardButtonsContext.getPermissions();
  
      if (!permissions.card.update) {
        return [];
      }
  
      if (settings && settings[0]) {
        const currentSpaceSettings = settings[0];
        
        if (currentSpaceSettings.showTestButton) {
          buttons.push({
            text: 'Test button 1',
            callback: async (callbackContext, callbackOptions) => {
              console.log('card test button 1 clicked, i will fetch card and simply console log it');
              try {
                const card = await callbackContext.getCard();
                console.log('here is card title: ', card.title);
              } catch (err) {
                console.log('error while fetching card');
              }
            }
          })
        }
      }
  
      const timerStartTime = await cardButtonsContext.getData('card', 'private', 'timerStartTime');
      
      if (!timerStartTime) {
        buttons.push({
          text: '🟢 Start timer',
          callback: async (buttonContext) => {
            const now = Date.now();
            await buttonContext.setData('card', 'private', 'timerStartTime', now);
          }
        })
      } else {
        buttons.push({
          text: '📝 Add log to timer',
          callback: (buttonContext) => {
            return buttonContext.openPopup({
              title: 'Add text log to current timer',
              url: './timerLog.html',
              height: 200,
              width: 300,
            });
          }
        })
        buttons.push({
          text: '🔴 Stop timer',
          callback: async (buttonContext) => {
            const now = Date.now();
            const startTime = await buttonContext.getData('card', 'private', 'timerStartTime');
            const currentLog = await buttonContext.getData('card', 'private', 'timerLog');
  
            await buttonContext.setData('card', 'private', 'timerStartTime', null);
            
            if (currentLog) {
              await buttonContext.setData('card', 'private', 'timerLog', null);
            }
  
            const data = {
              startTime,
              endTime: now,
              log: currentLog || null,
            }
            const logs = (await buttonContext.getData('card', 'private', 'timerLogs')) || [];
            await buttonContext.setData('card', 'private', 'timerLogs', logs);
          }
        })
      }
      return buttons;
    }
  })

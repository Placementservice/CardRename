Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
        const buttons = [];
        buttons.push({
            text: 'Тестовая кнопка (не нажимать)',
            callback: async (callbackContext, callbackOptions) => {
                console.log('Кнопка нажата (v2_18/03/2026 - 16:35)');
                try {
                    // Получаем список тегов карточки
                    const tags = await callbackContext.getCardProperties('tags');
                    console.log('Теги карточки:', tags);

                    // Получаем пользовательские свойства (custom fields)
                    const customProps = await callbackContext.getCardProperties('customProperties');
                    console.log('Пользовательские свойства:', customProps);

                    // Получаем тип карточки (например, "Задача", "Дефект")
                    const cardType = await callbackContext.getCardProperties('type');
                    console.log('Тип карточки:', cardType);
                    // --- КОНЕЦ НОВОГО КОДА ---

                } catch (err) {
                    console.log('Ошибка при получении данных карточки:', err);
                }
            }
        });
        return buttons;
    }
});

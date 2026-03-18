Addon.initialize({
    'card_buttons': async (cardButtonsContext) => {
        const buttons = [];
        buttons.push({
            text: 'Тестовая кнопка (не нажимать)',
            callback: async (callbackContext, callbackOptions) => {
                console.log('Кнопка нажата');
                try {
                    // Получаем основные данные карточки (как у вас уже есть)
                    const card = await callbackContext.getCard();
                    console.log('Основные данные карточки:', card);

                    // --- НОВЫЙ КОД: Получаем дополнительные свойства ---
                    // Получаем список участников карточки
                    const members = await callbackContext.getCardProperties('members');
                    console.log('Участники карточки:', members);

                    // Получаем список тегов карточки
                    const tags = await callbackContext.getCardProperties('tags');
                    console.log('Теги карточки:', tags);

                    // Получаем пользовательские свойства (custom fields)
                    const customProps = await callbackContext.getCardProperties('customProperties');
                    console.log('Пользовательские свойства:', customProps);

                    // Получаем прикрепленные файлы
                    const files = await callbackContext.getCardProperties('files');
                    console.log('Файлы карточки:', files);

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

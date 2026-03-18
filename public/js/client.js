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

                    // Проверяем наличие метки "Корректировка ТУ" в массиве тегов
                    const hasCorrectionTag = Array.isArray(tags) && tags.some(tag => tag.name === 'Корректировка ТУ');
                    
                    // Присваиваем результат переменной
                    let correctionTagExists = hasCorrectionTag;
                    
                    console.log('Результат проверки наличия метки "Корректировка ТУ":', correctionTagExists);
                    
                    // Можно использовать переменную correctionTagExists для дальнейшей логики
                    if (correctionTagExists) {
                        console.log('Метка "Корректировка ТУ" найдена');
                        // Здесь можно выполнить нужные действия
                    } else {
                        console.log('Метка "Корректировка ТУ" не найдена');
                        // Здесь можно выполнить другие действия
                    }

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

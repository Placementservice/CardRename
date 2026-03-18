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

                    // Получаем пользовательские свойства (custom fields)
                    const customProps = await callbackContext.getCardProperties('customProperties');
                    console.log('Пользовательские свойства:', customProps);

                    // Функция для получения значения по имени поля
                    const getCustomFieldValue = (fieldName) => {
                        if (!Array.isArray(customProps)) return 'XXXX';
                        
                        const field = customProps.find(item => item.property?.name === fieldName);
                        
                        if (!field) return 'XXXX';
                        
                        // Обработка различных типов значений
                        if (field.value === null || field.value === undefined) return 'XXXX';
                        
                        if (typeof field.value === 'object' && field.value !== null) {
                            // Для объектов (например, catalog или select)
                            return field.value.name || field.value.value || 'XXXX';
                        } else if (typeof field.value === 'string') {
                            // Для строковых полей
                            return field.value.trim() || 'XXXX';
                        } else {
                            // Для других типов (числа, булевы и т.д.)
                            return String(field.value) || 'XXXX';
                        }
                    };

                    // Получаем значения из пользовательских свойств
                    const objectValue = getCustomFieldValue('Объект');
                    const sublessorValue = getCustomFieldValue('Субарендатор (Оператор)');
                    const workTypeValue = getCustomFieldValue('Тип работ');
                    const bsNumberValue = getCustomFieldValue('Номер БС');

                    // Присваиваем значения переменным
                    let objectField = objectValue;
                    let sublessorField = sublessorValue;
                    let workTypeField = workTypeValue;
                    let bsNumberField = bsNumberValue;

                    // Получаем значение name из типа карточки
                    const cardType = await callbackContext.getCardProperties('type');
                    console.log('Тип карточки:', cardType);
                    
                    // Извлекаем name из типа карточки (если это объект с полем name)
                    let cardTypeName = 'XXXX';
                    if (cardType && typeof cardType === 'object' && cardType.name) {
                        cardTypeName = cardType.name;
                    } else if (typeof cardType === 'string') {
                        cardTypeName = cardType;
                    }

                    // Присваиваем переменной значение name
                    let typeNameField = cardTypeName;

                    // Выводим все переменные с их названиями и значениями в консоль
                    console.log('=== РЕЗУЛЬТАТЫ ===');
                    console.log('correctionTagExists (Наличие метки "Корректировка ТУ"):', correctionTagExists);
                    console.log('objectField (Объект):', objectField);
                    console.log('sublessorField (Субарендатор (Оператор)):', sublessorField);
                    console.log('workTypeField (Тип работ):', workTypeField);
                    console.log('bsNumberField (Номер БС):', bsNumberField);
                    console.log('typeNameField (Тип карточки - name):', typeNameField);
                    console.log('=== КОНЕЦ РЕЗУЛЬТАТОВ ===');

                    // Можно использовать переменные для дальнейшей логики
                    if (correctionTagExists) {
                        console.log('Метка "Корректировка ТУ" найдена');
                        // Здесь можно использовать полученные поля
                        console.log('Данные карточки с меткой:',
                            objectField, sublessorField, workTypeField, bsNumberField, typeNameField
                        );
                    } else {
                        console.log('Метка "Корректировка ТУ" не найдена');
                        // Здесь можно выполнить другие действия
                    }

                } catch (err) {
                    console.log('Ошибка при получении данных карточки:', err);
                }
            }
        });
        return buttons;
    }
});

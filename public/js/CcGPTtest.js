/* client.js
 * Kaiten Addon: Card Rename by template
 *
 * Промежуточный режим:
 *  - DRY_RUN = true  => только вывод в консоль, без переименования
 *  - DRY_RUN = false => реально обновляет title карточки
 */

(() => {
  "use strict";

  const DRY_RUN = true; // <-- для старта true. Когда проверишь логику — поставь false.

  const ADDON_BUTTON_TEXT = "Переименовать по шаблону";

  const FIELD_BS_NUMBER = "Номер БС";
  const FIELD_OPERATOR = "Субарендатор (Оператор)";
  const FIELD_OBJECT = "Объект";
  const FIELD_WORK_TYPE = "Тип работ";
  const TAG_CORRECTION = "Корректировка ТУ";
  const OBJECT_CODE_COLUMN = "Код объекта";
  const CORR_SUFFIX = "_корр";

  const WORK_TYPE_MAP = {
    "Модернизация": "Мод",
    "Новая стройка": "НС",
    "ВОЛС": "ВОЛС",
  };

  function isEmpty(v) {
    return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
  }

  function asString(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number") return String(v);
    if (typeof v === "boolean") return v ? "true" : "false";
    // Часто селекты/справочники приходят объектами { id, title/name/value/... }
    if (typeof v === "object") {
      // самые частые поля
      if (typeof v.value === "string") return v.value.trim();
      if (typeof v.title === "string") return v.title.trim();
      if (typeof v.name === "string") return v.name.trim();
      if (typeof v.text === "string") return v.text.trim();
      if (typeof v.label === "string") return v.label.trim();
      if (typeof v.display === "string") return v.display.trim();
      // если это массив значений
      if (Array.isArray(v) && v.length > 0) return asString(v[0]);
    }
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  function normalizeCustomPropsContainer(cardProps) {
    // Пытаемся найти список/словарь кастомных полей в разных форматах
    return (
      cardProps?.custom_properties ||
      cardProps?.customProperties ||
      cardProps?.properties ||
      cardProps?.props ||
      null
    );
  }

  function findCustomPropValue(cardProps, propName) {
    const container = normalizeCustomPropsContainer(cardProps);

    if (!container) return undefined;

    // Вариант 1: массив объектов
    if (Array.isArray(container)) {
      const found = container.find((p) => {
        const n = p?.name || p?.title || p?.property_name || p?.propertyTitle;
        return typeof n === "string" && n.trim() === propName;
      });
      return found?.value ?? found?.values ?? found?.selected ?? found?.data ?? found;
    }

    // Вариант 2: объект-словарь по имени
    if (typeof container === "object") {
      // прямое попадание
      if (container[propName] !== undefined) return container[propName];

      // иногда ключи — id, а имя лежит внутри, тогда перебираем
      for (const k of Object.keys(container)) {
        const p = container[k];
        const n = p?.name || p?.title || p?.property_name || p?.propertyTitle;
        if (typeof n === "string" && n.trim() === propName) {
          return p?.value ?? p?.values ?? p?.selected ?? p?.data ?? p;
        }
      }
    }

    return undefined;
  }

  function extractObjectCode(objectFieldValue) {
    // Нужно взять значение первого столбца "Код объекта" из выбранной записи справочника.
    // Реальные структуры могут отличаться — пробуем несколько вариантов.

    if (objectFieldValue === null || objectFieldValue === undefined) return "";

    // Если вдруг уже строка — вернём как есть
    if (typeof objectFieldValue === "string" || typeof objectFieldValue === "number") {
      return asString(objectFieldValue);
    }

    // Частый вариант: { columns: { "Код объекта": "ABC123" , ... } }
    if (typeof objectFieldValue === "object") {
      const direct = objectFieldValue[OBJECT_CODE_COLUMN];
      if (!isEmpty(direct)) return asString(direct);

      const cols = objectFieldValue.columns || objectFieldValue.values || objectFieldValue.fields || objectFieldValue.data;
      if (cols) {
        if (typeof cols === "object" && cols[OBJECT_CODE_COLUMN] !== undefined) {
          return asString(cols[OBJECT_CODE_COLUMN]);
        }
        // если массив значений по порядку столбцов
        if (Array.isArray(cols) && cols.length > 0) {
          // иногда 1-й столбец = [0]
          return asString(cols[0]);
        }
      }

      // Иногда запись справочника приходит как { items: [ { columns: {...} } ] } или подобное
      const items = objectFieldValue.items || objectFieldValue.records || objectFieldValue.rows;
      if (Array.isArray(items) && items.length > 0) {
        return extractObjectCode(items[0]);
      }
    }

    return "";
  }

  function extractCardTypeName(cardProps) {
    // "dd" — наименование типа карточки
    const t =
      cardProps?.type?.name ||
      cardProps?.type?.title ||
      cardProps?.card_type?.name ||
      cardProps?.card_type?.title ||
      cardProps?.cardType?.name ||
      cardProps?.cardType?.title ||
      cardProps?.type_name ||
      cardProps?.typeTitle ||
      cardProps?.typeName;

    return asString(t);
  }

  function extractTags(cardProps) {
    // "Метки" обычно как массив объектов/строк
    const tags =
      cardProps?.tags ||
      cardProps?.labels ||
      cardProps?.markings ||
      cardProps?.card_tags ||
      cardProps?.cardTags ||
      [];

    if (Array.isArray(tags)) {
      return tags.map((x) => (typeof x === "string" ? x : (x?.name || x?.title || x?.text || asString(x)))).filter(Boolean);
    }
    if (typeof tags === "object" && tags) {
      // иногда словарь
      return Object.values(tags).map((x) => (typeof x === "string" ? x : (x?.name || x?.title || x?.text || asString(x)))).filter(Boolean);
    }
    return [];
  }

  async function safeGetCardProperties(webSdk, ctx) {
    // ctx иногда содержит card_id / cardId / id и т.п.
    const cardId = ctx?.card_id ?? ctx?.cardId ?? ctx?.id ?? ctx?.card?.id;

    // Пытаемся вызвать рекомендованный метод getCardProperties
    const candidates = [
      () => webSdk?.getCardProperties?.(),
      () => webSdk?.getCardProperties?.(cardId),
      () => webSdk?.getCardProperties?.({ cardId }),
      () => webSdk?.data?.getCardProperties?.(),
      () => webSdk?.data?.getCardProperties?.(cardId),
      () => webSdk?.data?.getCardProperties?.({ cardId }),
      // запасной вариант: иногда есть getCard / card.get
      () => webSdk?.getCard?.(cardId),
      () => webSdk?.card?.get?.(cardId),
      () => webSdk?.data?.getCard?.(cardId),
    ];

    let lastErr = null;
    for (const fn of candidates) {
      try {
        const res = await fn();
        if (res) return { cardId, cardProps: res };
      } catch (e) {
        lastErr = e;
      }
    }

    throw new Error(
      "Не удалось получить данные карточки через webSdk.*. " +
        "Проверь, какие методы реально доступны (см. лог доступных ключей webSdk). " +
        (lastErr ? `Последняя ошибка: ${String(lastErr)}` : "")
    );
  }

  async function safeUpdateCardTitle(webSdk, cardId, newTitle) {
    // Пытаемся обновить title разными способами (в зависимости от реального SDK)
    const payloadVariants = [
      { id: cardId, title: newTitle },
      { cardId, title: newTitle },
      { card_id: cardId, title: newTitle },
      { id: cardId, name: newTitle },
      { cardId, name: newTitle },
    ];

    const callVariants = [];

    for (const p of payloadVariants) {
      callVariants.push(() => webSdk?.updateCard?.(p));
      callVariants.push(() => webSdk?.cards?.update?.(p));
      callVariants.push(() => webSdk?.card?.update?.(p));
      callVariants.push(() => webSdk?.setCardTitle?.(cardId, newTitle));
      callVariants.push(() => webSdk?.setCardName?.(cardId, newTitle));
      callVariants.push(() => webSdk?.updateCardTitle?.(cardId, newTitle));
      callVariants.push(() => webSdk?.updateCardName?.(cardId, newTitle));
      // универсальный request/patch если есть
      callVariants.push(() => webSdk?.request?.({ method: "PATCH", url: `/cards/${cardId}`, body: { title: newTitle } }));
      callVariants.push(() => webSdk?.api?.request?.({ method: "PATCH", url: `/cards/${cardId}`, body: { title: newTitle } }));
    }

    let lastErr = null;
    for (const fn of callVariants) {
      try {
        const res = await fn();
        if (res !== undefined) return res;
      } catch (e) {
        lastErr = e;
      }
    }

    throw new Error(
      "Не удалось обновить название карточки через webSdk.*. " +
        "Скинь в ответ Object.keys(webSdk) и структуру cardProps из консоли — подгоню точный вызов. " +
        (lastErr ? `Последняя ошибка: ${String(lastErr)}` : "")
    );
  }

  function buildNewTitle({ bsNumber, operator, objectCode, cardTypeName, workTypeShort, hasCorrectionTag }) {
    const base = `${bsNumber}_${operator}_${objectCode}_${cardTypeName}_${workTypeShort}`;
    return hasCorrectionTag ? `${base}${CORR_SUFFIX}` : base;
  }

  function validateOrThrow({ bsNumber, operator, objectCode, cardTypeName, workTypeShort }) {
    const missing = [];

    if (isEmpty(bsNumber)) missing.push(FIELD_BS_NUMBER);
    if (isEmpty(operator)) missing.push(FIELD_OPERATOR);
    if (isEmpty(objectCode)) missing.push(`${FIELD_OBJECT} → ${OBJECT_CODE_COLUMN}`);
    if (isEmpty(cardTypeName)) missing.push("Тип карточки");
    if (isEmpty(workTypeShort)) missing.push(FIELD_WORK_TYPE);

    if (missing.length > 0) {
      throw new Error(`Переименование не выполнено: пустые/не заполнены поля: ${missing.join(", ")}`);
    }
  }

  async function onRenameClick(webSdk, ctx) {
    console.group("[CardRename] click");

    // Полезно для первичной диагностики: какие вообще методы доступны
    try {
      console.log("webSdk keys:", Object.keys(webSdk || {}));
      console.log("ctx:", ctx);
    } catch {}

    const { cardId, cardProps } = await safeGetCardProperties(webSdk, ctx);

    console.log("cardId:", cardId);
    console.log("cardProps (raw):", cardProps);

    const bsNumberRaw = findCustomPropValue(cardProps, FIELD_BS_NUMBER);
    const operatorRaw = findCustomPropValue(cardProps, FIELD_OPERATOR);
    const objectRaw = findCustomPropValue(cardProps, FIELD_OBJECT);
    const workTypeRaw = findCustomPropValue(cardProps, FIELD_WORK_TYPE);

    const bsNumber = asString(bsNumberRaw);
    const operator = asString(operatorRaw);
    const objectCode = extractObjectCode(objectRaw);
    const cardTypeName = extractCardTypeName(cardProps);

    const workTypeFull = asString(workTypeRaw);
    const workTypeShort = WORK_TYPE_MAP[workTypeFull] || ""; // если значение не из списка — считаем ошибкой

    const tags = extractTags(cardProps);
    const hasCorrectionTag = tags.includes(TAG_CORRECTION);

    console.log("Parsed fields:", {
      bsNumber,
      operator,
      objectCode,
      cardTypeName,
      workTypeFull,
      workTypeShort,
      tags,
      hasCorrectionTag,
    });

    validateOrThrow({ bsNumber, operator, objectCode, cardTypeName, workTypeShort });

    const newTitle = buildNewTitle({ bsNumber, operator, objectCode, cardTypeName, workTypeShort, hasCorrectionTag });
    console.log("NEW TITLE =>", newTitle);

    if (DRY_RUN) {
      console.warn("[CardRename] DRY_RUN=true — название НЕ обновляю.");
      console.groupEnd();
      return;
    }

    const updateRes = await safeUpdateCardTitle(webSdk, cardId, newTitle);
    console.log("[CardRename] title updated, response:", updateRes);

    console.groupEnd();
  }

  // Инициализация аддона: кнопка в карточке
  function initAddon() {
    if (typeof Addon === "undefined" || !Addon?.initialize) {
      console.error("[CardRename] Addon.initialize не найден. Проверь, что SDK подключен на странице.");
      return;
    }

    // По документации Kaiten: Addon.initialize({ card_buttons: (webSdk) => [...] })
    // :contentReference[oaicite:0]{index=0}
    Addon.initialize({
      card_buttons: (webSdk) => {
        return [
          {
            text: ADDON_BUTTON_TEXT,
            // на разных версиях может называться handler / onClick / action
            handler: (ctx) => onRenameClick(webSdk, ctx),
            onClick: (ctx) => onRenameClick(webSdk, ctx),
            action: (ctx) => onRenameClick(webSdk, ctx),
            // Если вдруг нужно показывать кнопку даже без прав редактирования — в доках есть параметр для этого (точное имя может отличаться)
            // :contentReference[oaicite:1]{index=1}
          },
        ];
      },
    });
  }

  // запуск
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAddon);
  } else {
    initAddon();
  }
})();

# framebuffer-studio.github.io

Сайт FrameBuffer Studio: **https://framebuffer-studio.github.io/**

| Путь | Что там |
|------|---------|
| `/` | Главная студии: продукты, команда, поддержка |
| `/Bloom/` | Документация [Bloom](https://github.com/FrameBuffer-Studio/Bloom). Её обновляет workflow репозитория Bloom |

## Настройка через `studio.json`

Всё содержимое главной лежит в [`studio.json`](studio.json). Код менять не нужно: поправь JSON, сделай push, и через минуту сайт обновится.

| Поле | Что задаёт |
|------|------------|
| `brand` | Название (`name`), подпись рядом (`suffix`), год в подвале (`year`) |
| `languages`, `defaultLanguage` | Языки сайта и язык по умолчанию |
| `links.github`, `links.donate` | Ссылка на GitHub и кнопка доната. Без `donate` вкладка «поддержать» скрывается |
| `ui` | Все надписи интерфейса: вкладки, заголовки, кнопки |
| `marquee` | Слова в бегущей строке |
| `principles` | Блоки «принципов» на главной |
| `products` | Продукты: `id`, `name`, `status` (`released`, `development`, `archived`), `tagline`, `description`, `specs`, `links` |
| `team` | Команда: `name`, `role`, `url` |

Любой текст можно задать строкой (`"Luau"`) или отдельно для каждого языка (`{ "en": "...", "ru": "..." }`).

Ссылки разрешены только трёх видов:

- `https://...`;
- `./...` — путь внутри сайта;
- `#/...` — переход к вкладке.

Пример продукта:

```json
{
  "id": "my-tool",
  "name": "MyTool",
  "status": "development",
  "description": { "en": "What it does", "ru": "Что он делает" },
  "specs": [{ "label": { "en": "language", "ru": "язык" }, "value": "Luau" }],
  "links": [{ "label": "GitHub ↗", "url": "https://github.com/FrameBuffer-Studio/MyTool", "primary": true }]
}
```

### Проверка

Рядом лежит [`studio.schema.json`](studio.schema.json): VS Code по нему подсказывает поля и подчёркивает ошибки прямо в `studio.json`. Полную проверку делает backend. Её запускает приватный репозиторий `studio-server`: `npm run validate:remote` проверяет `studio.json` прямо на GitHub и показывает точный путь к ошибке, например `studio.json: products[1].status must be one of: released, development, archived`.

## Backend

Код сервера лежит в отдельном приватном репозитории `FrameBuffer-Studio/studio-server`. Сервер не хранит копию сайта: при сборке он клонирует этот репозиторий, а `studio.json` может подтягивать с GitHub на лету. Поэтому содержимое сайта по-прежнему правится только здесь.

Тот же CI каждый час проверяет `studio.json` из этого репозитория. Если в нём ошибка, проверка во вкладке Actions репозитория `studio-server` станет красной.

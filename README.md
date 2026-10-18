# framebuffer-studio.github.io

Сайт FrameBuffer Studio: **https://framebuffer-studio.github.io/**

| Путь | Что там |
|------|---------|
| `/` | Главная студии: продукты, команда, поддержка |
| `/Bloom/` | Документация [Bloom](https://github.com/FrameBuffer-Studio/Bloom) |

## Что здесь править, а что нет

| Файл | Откуда берётся |
|------|----------------|
| `index.html`, `assets/` | Правится здесь: вёрстка, стили и скрипт главной |
| `studio.json` | **Генерируется** приватным репозиторием `studio-server` из `configs/sites/framebuffer/*.json` |
| `Bloom/` | **Генерируется** приватным репозиторием `studio-server` из `docs/` репозитория Bloom и `configs/sites/bloom/` |

Руками `studio.json` и `Bloom/` не трогай: при следующей публикации `studio-server` их перезапишет. Все настройки (продукты, команда, тексты, ссылки, титры Bloom) меняются в `studio-server`.

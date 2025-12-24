# Architecture Overview

## Структура проекта

```
[root]/
├── src/
│   ├── shared/          # api/eventsApi.ts, styles/global.css
│   ├── entities/        # event types + Pinia store
│   ├── widgets/         # EventCard, EventDetails, EventsList
│   ├── pages/           # HomePage (/), EventPage (/event/:id)
│   ├── router/          #
│   └── main.ts, App.vue # app shell
├── public/              # static assets
├── vite.config.ts       # dev mocks (HTTP/WS)
└── package.json, tsconfig*, etc.
```

## Архитектура и слои

- **Стек**: Vue 3 (Composition API, TS strict), Pinia, Vue Router, Vite.
- **Слои**:
  - `shared` — HTTP API (`/api/events`), глобальные стили.
  - `entities` — типы и сторы (события).
  - `widgets` — самодостаточные UI-блоки (лист, карточка, детали).
  - `pages` — сборка экранов `/` и `/event/:id`.
  - `router`, `App` — оболочка и маршруты.
- **Нормализация**: данные событий в словаре `events` + массив `ids` для порядка; флаги загрузки/ошибок отдельно.

## Оптимизации под частые обновления

- Точечные мутации: ws-апдейт меняет только `events[id]`, `ids` не пересобирается.
- Рендер по `ids` + словарю без лишних `map` в геттерах: `EventsList` получает `ids` и `events`.
- Локальная подсветка up/down в карточках/деталях рассчитывается по `prevCoeff`, не хранится в сторе.
- Таргетированный WS для деталей `/ws/events/:id` — меньше лишних сообщений.

## Pinia store (src/entities/event/store.ts)

- **State** (`EventsState`):
  - `events: Record<number, Event>`
  - `ids: number[]`
  - `loading: boolean`, `error: string | null`, `liveConnected: boolean`
- **Event**: `id`, `teamA`, `teamB`, `score`, `coeff`, `prevCoeff?`, `lastUpdatedAt`.
- **Getters**: `byId(id)` — вернуть событие или `null`.
- **Actions**:
  - `loadEvents()` — HTTP `/api/events`, кладёт снапшот через `updateEvents`.
  - `updateEvents(events[])` — пересобирает словарь и `ids`, сохраняя `prevCoeff` при наличии.
  - `updateSingleEvent({ id, coeff, at })` — точечное обновление коэффициента (ws).
  - `enableLiveUpdates(eventId?)` — открывает WS `/ws/events` или `/ws/events/:id`, парсит сообщения, вызывает `updateSingleEvent`, ведёт `liveConnected`.
  - `disableLiveUpdates()` — закрывает ws, сбрасывает флаг.

## Логика WebSocket-хэндлеров (моки в vite.config.ts)
#### Моки только в dev-режиме. Если нужны в проде или на демо-стенде, заюзал бы `msw`

- HTTP мок: `/api/events` возвращает фиксированный список.
- WS сервер (через стандартный `ws`):
  - `/ws/events` — общий поток.
  - `/ws/events/:id` — поток для конкретного события.
- Генерация: каждые 1–3 секунды, случайный id из активных подписок, коэффициент `1…3` (рандом).
- Клиент: список подключается к `/ws/events`, детали — к `/ws/events/:id`.

## Масштабирование до 10k+ событий

1. Виртуализация списка (vue-virtual-scroller) — рендерить только видимые карточки.
2. Батчинг ws-апдейтов — собирать пришедшие апдейты в очередь и писать в `Store` в через requestIddleCallback. Имеет смысл, если апдейты приходят не раз в 3 секунды, а часто. Перед реализацией неплохо бы померять, влияет ли частота апдейтов из WS на производительность, так как такая оптимизация довольно сильно усложнит логику работы с бэком
3. На уровне бэка собирать обновления по нескольким `id` пачкой и отправлять не точечные обновления, а список. Тут надо смотреть на бизнес-логику. Этот вариант возможен, если пользователю ок, что события приходят с небольшой задержкой
4. Мемоизация карточек (`v-memo`/`shallowReadonly` props) — реагировать только на свои пропсы.
5. Ленивая загрузка дополнительных данных на деталях по запросу.

## UI-компоненты

- `pages/HomePage.vue` — загрузка списка, запуск общего WS, передача `ids`/`events` в лист.
- `pages/EventPage.vue` — при необходимости загружает список, подключает WS к `/ws/events/:id`, рендерит детали.
- `widgets/events-list/EventsList.vue` — заголовок/индикатор Live, сетка карточек по `ids`.
- `widgets/event-card/EventCard.vue` — команды, счёт, коэффициент, локальная подсветка up/down.
- `widgets/event-details/EventDetails.vue` — команды, счёт, коэффициент, время обновления, подсветка up/down.
- `App.vue` + `shared/styles/global.css` — базовый каркас, тема glassmorphism от ChatGPT.

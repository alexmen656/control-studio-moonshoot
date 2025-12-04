# Reelmia

Reelmia is a social media management platform. I originally had big ambitions for it, but since working with many different social media APIs is quite complex, only part of the functionality has been implemented so far.
Currently, Reelmia supports video uploads, post scheduling, team collaboration features, and provides channel analytics for Facebook, Instagram, YouTube, and TikTok.

## Currently supported platforms:

- Instagram
- Facebook
- YouTube
- TitTok

### WIP:

- X
- Reddit

### Planned:
- Snapchat
- LinkedIn

Reelmia is tool for managing social media accounts.

The core of Reelmia is the worker system, every worker is a own docker containe, so Reelmia is easily scalable, if tyou need more capacity just start up some more containers, and done!

## Demo

- Website: reelmia.com
- Youtube: <youtube link later>

Disclaimer
Because of the complexness of the project I had to scrape many features.

## Setup

The project is splitted up in 3 main parts:

- Frontend
- Backend
- Workers:
  - Upload Worker
  - Analytics Worker
  - Comments Worker

## How to setup frontend?

npm run dev for dev mode
npm run build

## How to setup backend?

cd backend
configure .env
node server.js
node server_for_worker.js

## How to setup workers?

cd a_workers

cd analytics
configure .env
npm start / docker compose up
cd upload
configure .env
npm start / docker compose up
cd comments
configure .env
npm start / docker compose up

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

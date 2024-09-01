# StyleMe


## Intro

The demo app is built on top of [Banuba WebAR SDK](https://docs.banuba.com/face-ar-sdk-v1/web/web_overview) and [Makeup](https://docs.banuba.com/face-ar-sdk-v1/effect_api/makeup) effect. It reveals common patterns of consuming the [WebAR SDK JavaScript API](https://docs.banuba.com/face-ar-sdk-v1/generated/typedoc/) as well as the [Makeup effect API](https://docs.banuba.com/face-ar-sdk-v1/effect_api/makeup).

## Environment

1. Install node.js environment. Then run the command below:

```bash
npm install
```

2. Create .env file and change the openai key.

## Usage

Run locally

```bash
npm start
```

## Deployment

We recommand `pm2`.

To install:

```bash
npm install -g pm2
```

Run the service:

```bash
pm2 start server.mjs
```
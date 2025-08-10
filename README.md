# Samples

This repository contains example web apps. The `next-app` directory is a [Next.js](https://nextjs.org/) application ready to deploy on [Vercel](https://vercel.com/).

## Static game demos

- `suika-game`: a UI mock of the fruit-merging puzzle.
- `monst-game`: a simple drag-launch mini game inspired by Monster Strike.


## Development

```bash
cd next-app
npm install
npm run dev
```

## Deploying to Vercel

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Run `vercel` in the repository root and follow the prompts to link your Vercel project. The provided `vercel.json` routes requests to the `next-app` directory.


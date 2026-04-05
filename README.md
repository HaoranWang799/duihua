# Signal After Midnight

A premium-feeling branching audio story built with React, TypeScript, and Vite.

## Features

- cinematic title screen
- automatic per-node voice playback
- subtitle cue support for near-synced captions
- premium branching choices
- multiple endings
- restart flow
- state tracking for current node, visited nodes, and ending reached
- mobile-responsive full-screen layout

## Project structure

```text
src/
  components/
  data/story.ts
  hooks/
  pages/
  types/
  utils/
```

## Development

```bash
npm install
npm run dev
```

## AI story generation

Create a `.env.local` file and configure Grok:

```bash
XAI_API_KEY=your_xai_api_key
XAI_STORY_MODEL=grok-4-1-fast-non-reasoning
```

## Demo audio

Demo audio files live in `public/audio/story/`.

To replace them with your own:

1. Add your new `.mp3`, `.wav`, or `.ogg` files under `public/audio/story/`
2. Update the `audio` path in `src/data/story.ts`
3. Adjust `subtitleCues` timing in `src/data/story.ts` if you want tighter sync

More detail is in `public/audio/README.md`.

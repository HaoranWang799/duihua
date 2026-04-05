# Replacing the demo audio

Put your own `.mp3`, `.wav`, or `.ogg` files inside `public/audio/story/`.

Then update the `audio` field for each node in:

- `src/data/story.ts`

Example:

```ts
{
  id: 'arrival',
  subtitle: 'Your subtitle here',
  audio: '/audio/story/arrival-voice.mp3',
}
```

For tighter subtitle sync, also update `subtitleCues` in the same node:

```ts
subtitleCues: [
  { start: 0, end: 1.8, text: 'First subtitle beat.' },
  { start: 1.8, end: 4.1, text: 'Second subtitle beat.' },
]
```

The path is rooted at `public`, so:

- `public/audio/story/arrival-voice.mp3`
- becomes
- `/audio/story/arrival-voice.mp3`

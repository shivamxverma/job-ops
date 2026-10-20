# interview-lab

Spoken mock interviews. A question appears on screen, Shivam hits record and answers out
loud, whisper transcribes it locally, and the agent running the interview reads the
transcript and asks the next question based on what he actually said.

Built because the first half of the pipeline (sourcing, research, tailoring) works and the
second half (performing in the room) had never been practised. Reading a prep doc did not
prevent the Scenr call going badly. Reps might.

## Run it

```bash
# terminal 1 — the lab (opens http://localhost:4646 automatically)
node interview-lab/server.mjs --company scenr --role "Founding Engineer" --kind system-design

# terminal 2 — one command per turn. Blocks until he has answered.
node interview-lab/ask.mjs --company scenr "Tell me about a system you designed yourself."
```

Normally you do not type these: `/mock-interview` drives them, then `/interview-debrief`
scores the session.

In the browser, **space** starts and stops recording.

## How the two sides talk

They do not. Both sides only touch one file:

```
applications/{company}/mock/session-<timestamp>.json
```

```
agent: ask.mjs writes a question   -> status "awaiting_answer"
browser: polls, sees it, records   -> POST /api/answer
server: ffmpeg -> whisper -> text  -> status "awaiting_question"
agent: ask.mjs unblocks, prints the transcript
```

**No model runs inside the server.** It transcribes audio and moves a state machine; the
interviewer is whatever agent is calling `ask.mjs`. That is what makes this runnable by a
smaller model: the entire agent-side contract is *one blocking command that prints text*,
with no polling logic, no API keys and no orchestration to get wrong.

Session writes are write-then-rename, so a poller never reads a half-written file.

## Transcription quality

`ffmpeg` (webm/opus → 16kHz mono wav) → `whisper-cli` (whisper.cpp) → cleanup.

Three things do the work, in order of impact:

1. **`--prompt` with Shivam's actual vocabulary** (`lib/transcribe.mjs`). whisper conditions
   on it, so `Kubernetes`, `Terraform`, `idempotency`, `lifelog`, `SHA-1` come back spelled
   right instead of as the nearest common English word. This matters more than model size
   for technical speech. Measured: a test clip returned "lifelog", "JSONL", "flock-guarded",
   "content-addressed" and "SHA-1" all correct on the *small* model.
2. **Model size.** The biggest `.bin` present is picked automatically. Currently
   `ggml-small.en`. To upgrade with no code change:
   ```bash
   curl -L -o ~/.whisper-models/ggml-large-v3-turbo.bin \
     https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
   ```
3. **A fixups table** for the few terms whisper still mangles regardless (`zlib` came back
   as "slig"). Same idea as `video/fixes/*.json` in the /job-video pipeline. Add to it when
   you spot a repeat offender.

Roughly 3s of transcription per 15s of speech on an M3, so a two-minute answer takes about
25s. The UI says `transcribing…` while it runs.

## Files

| | |
|---|---|
| `server.mjs` | HTTP server + state machine. No dependencies. |
| `ask.mjs` | Agent side. One command = one turn. Blocks, prints transcript to stdout. |
| `lib/session.mjs` | Session file read/write, atomic saves. |
| `lib/transcribe.mjs` | ffmpeg + whisper + cleanup. Vocab prompt and fixups live here. |
| `public/` | The UI. Vanilla JS, no build step. |

## Notes

- Local only, binds `127.0.0.1`. Nothing leaves the machine; whisper runs on device.
- Audio (`turn-NN.webm`) is kept next to the session for re-listening and is gitignored.
  The transcripts are committed, the recordings are not.
- `ask.mjs` exit codes: `0` answered, `3` timed out, `4` session ended from the browser.
- It refuses to overwrite a question that is still pending, so two agents cannot race.
- Restarting the server resumes the newest unfinished session rather than orphaning it.

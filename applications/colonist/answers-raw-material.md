# Colonist — raw material for the fields only you can answer (2026-09-29)

Form: https://jobs.ashbyhq.com/colonist/109d62c4-52f3-4980-9c49-d31773818736/application

**Only you can do these, and the lane won't guess them:**
- **Colonist Profile** (required): play a game on colonist.io, then paste your profile URL (e.g. https://colonist.io/profile/YourName).
- **"Up to how many players can be played in a game on Colonist at the moment?"** (4 / 6 / 8 / 10): check in the game lobby. It's a did-you-actually-play test.
- **"How much has AI increased your development speed?"** (I don't use AI / 20% / 50% / 2x / 5x): your honest number.
- **"What's one task you've handed off to AI? Explain why in one sentence."** Your real example. Bonus for a link.
- **"What is your motivation to apply?"** Max 200 characters, **"Please don't use AI."** Write it yourself. Facts you could draw on: they run 60M games a year on ~20 people; it's fully remote and async. Do you actually play board games? Their requirements list "Passionate about board games". If you don't, this seat isn't a fit.
- **Salary (USD monthly):** your number (TODO in facts.yaml).
- **Website** must be a portfolio, not GitHub: https://www.shivamworks.dev/

**Drafted, because it has no AI warning (edit freely):**
"Describe something you built or significantly improved in the last 6 months" (max 150 words):

> At poiro.com our asset storage had no protection against duplicate uploads, and AI-generation surfaces create a lot of them. The obvious fix, trusting a hash the client sends, is wrong because the client can lie or be buggy. I built SHA-256 dedup where the server verifies the stored content itself, backed by a database uniqueness constraint so two concurrent uploads can't race past an app-level check, plus a client-side preflight that skips uploading files we already have. The result: no duplicate writes to R2 and no trust placed in client input. In the same months I cleared about 1,041 lint findings across 7 Python trees and made lint blocking in CI, with package discovery so new packages are covered without anyone remembering to add them.

(119 words, no em dashes. poiro.com work is proprietary, so no link.)

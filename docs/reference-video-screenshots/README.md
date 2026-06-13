# Reference Video Screenshots — FIND real-estate site walkthrough

Frame-by-frame capture of a screen recording, extracted so an AI agent can review the
screenshots in sequence and understand how the website looks and behaves.

## Source
- **File:** `~/Desktop/Screen Recording 2026-06-13 at 6.33.34 PM.mov`
  - ⚠️ Filename contains a U+202F narrow no-break space before "PM" — reference via glob, not a typed path.
- **Duration:** 46.6 s · **Resolution:** 1736 × 1166 · **Codec:** h264 · **Capture:** ~56 fps (2,618 total frames)

## How these frames were chosen
- **Sampling: fixed-rate 1 fps → 46 frames**, native resolution, JPEG `-q:v 2`.
- **Why 1 fps:** Motion in this video is smooth/continuous (scrolling + animation), with **no hard cuts**.
  Scene-detection under-sampled (only 3 changes > 0.2) and dedup was useless (2,554/2,618 frames
  "distinct"), so **fixed-rate temporal sampling is the correct method**, not scene/dedup. 1 fps is the
  industry-standard default for AI on-screen understanding (Gemini API default; common video-LLM rate).

## Reading the frames
- **Naming:** `frame_<index>_t<seconds>s.jpg` — e.g. `frame_013_t012.0s.jpg` = 13th frame, captured at 12.0 s.
- Read in numerical/timestamp order to follow the scroll-through as a continuous flow.
- **Frame i → timestamp = (i − 1) seconds.**

## Motion map (where to look)
| Window | Activity |
|---|---|
| 0–5 s | Static — hero landing ("Find What Moves You") |
| 5–10 s | Motion begins |
| **10–15 s** | **Densest — fast scroll** through the "Why FIND" section |
| 15–46 s | Continuous scrolling through body sections down to the footer |
| ~46 s | Static — footer ("Find You. We'll Help You Get There", newsletter, nav, contact) |

## Inventory
46 frames: `frame_001_t000.0s.jpg` … `frame_046_t045.0s.jpg` (~7.2 MB total).

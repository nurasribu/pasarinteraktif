# Pasar Interaktif — interactive stall (mouse MVP)

Pixel-art interactive stall. Mouse cursor hovers items (WAU, GASING, KOMPANG);
click an item to open its history card; click anywhere to close.

## Run

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Fullscreen by default. Options:

- `--windowed` — run in a window (testing)
- `--frames=N` — run N frames then exit (headless smoke test)

## Controls

- Move mouse — move cursor
- Click an item — open history card
- Click anywhere — close card
- `F` — toggle fullscreen
- `ESC` — quit

## Configuration

Everything lives in `config.py`:

- Virtual grid is 10 x 8 points, origin top-left.
- Items are positioned in grid units: WAU (2,2), GASING (3,5), KOMPANG (7,5).
- Item hit radius, palette, menu layout, and placeholder history text are all
  editable there.

Real art, layered background:

- `assets/items/bg.jpg` — backdrop photo, scaled-to-cover (supports animated
  GIFs too; `BACKDROP_BLUR_RADIUS` in config for slight blur).
- `assets/items/PASAR1.png` — static stall art on top of the backdrop
  (1920×1080, RGBA; transparent regions reveal the backdrop below).

Item art: each item points at a PNG in `config.py` (`image` key) — WAU
(`assets/items/wau.png`), GASING (`gasing.png`), KOMPANG (`kompang.png`).
Scales to fit the item radius, nearest-neighbour. Falls back to a coloured
circle if a PNG is missing. Pixel font: `assets/fonts/press_start_2p.ttf`
(fallback: pygame default font).

## Upgrade path (webcam / joystick)

Input is isolated behind the `Pointer` interface in `pointer.py`
(`position()` in grid units, `just_clicked()`). Add a `HandPointer` or
`JoystickPointer` subclass and swap the instance in `main.py`; stall layout,
state machine, and menu logic do not change. Grid units map directly to a
normalised camera plane, so only the camera-to-grid calibration lives in the
new pointer.

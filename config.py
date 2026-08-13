import os
import sys

if getattr(sys, "frozen", False):
    BASE_DIR = sys._MEIPASS  # PyInstaller onefile bundle
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def asset_path(rel):
    """Resolve an asset path. Desktop/exe: BASE_DIR-joined. Browser (wasm):
    filesystem root is the project root, so absolute host paths do not exist
    and the relative path is returned instead."""
    p = os.path.join(BASE_DIR, rel)
    return p if os.path.exists(p) else rel

# Window
SCREEN_SIZE = (1920, 1080)
FULLSCREEN = True
FPS = 60

# Virtual interaction grid (points), origin = top-left
VIRTUAL_W = 10.0
VIRTUAL_H = 8.0

# Hit radius around an item centre, in grid units
ITEM_RADIUS = 1.2

# Item art box size (diameter) in grid units
ITEM_ART_SIZE = 2.4

# Palette (pixel-art inspired)
BG_TOP = (20, 16, 34)
BG_BOTTOM = (37, 26, 51)
ITEM_FILL = (237, 225, 181)
ITEM_EDGE = (62, 45, 66)
HOVER_RING = (255, 208, 96)
TEXT = (238, 234, 214)
MUTED = (160, 150, 170)
PANEL_BG = (24, 20, 40)
PANEL_BORDER = (255, 208, 96)
CURSOR = (255, 255, 255)
DIM_ALPHA = 170

# Items: position in grid units, image = real pixel art, colour = fallback.
ITEMS = [
    {
        "name": "WAU",
        "x": 1.0,
        "y": 3.0,
        "image": os.path.join("assets", "items", "wau.png"),
        "color": (232, 92, 92),
        "history": (
            "PLACEHOLDER COPY. Wau is the giant moon-kite of the Malay "
            "east coast, named for its crescent shape. Flown after the "
            "rice harvest, it once appeared on the RM50 banknote. "
            "Swap this text in config.py."
        ),
    },
    {
        "name": "GASING",
        "x": 3.0,
        "y": 5.0,
        "image": os.path.join("assets", "items", "gasing.png"),
        "color": (92, 150, 232),
        "history": (
            "PLACEHOLDER COPY. Gasing is the Malay spinning top from "
            "Kelantan and Malacca. Champion tops weigh up to five "
            "kilograms and spins can last over two hours. "
            "Swap this text in config.py."
        ),
    },
    {
        "name": "KOMPANG",
        "x": 7.0,
        "y": 5.0,
        "image": os.path.join("assets", "items", "kompang.png"),
        "color": (128, 200, 110),
        "history": (
            "PLACEHOLDER COPY. Kompang is a shallow single-headed frame "
            "drum played in groups at weddings and processions, keeping "
            "rhythm for silat and zapin. "
            "Swap this text in config.py."
        ),
    },
]

# Menu overlay (screen-space, pixel units)
MENU_RATIO_W = 0.60
MENU_RATIO_H = 0.72
MENU_PAD = 48
TITLE_FONT = 44
BODY_FONT = 22
HINT_FONT = 16
THUMB_SIZE = 220

# Cursor
CURSOR_SIZE = 16

# Optional assets (relative; resolved via asset_path())
BACKDROP_IMAGE = os.path.join("assets", "items", "bg.jpg")
BACKDROP_BLUR_RADIUS = 0.0
BG_IMAGE = os.path.join("assets", "items", "PASAR1.png")
FONT_FILE = os.path.join("assets", "fonts", "press_start_2p.ttf")

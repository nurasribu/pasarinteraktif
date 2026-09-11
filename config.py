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
WEB_SCREEN_SIZE = (1280, 720)
FULLSCREEN = True
FPS = 60

# Virtual interaction grid (points), origin = top-left
VIRTUAL_W = 10.0
VIRTUAL_H = 8.0

# Hit radius around an item centre, in grid units
ITEM_RADIUS = 0.9

# Item art box size (diameter) in grid units; items may carry a "scale"
# multiplier (e.g. SAPE scale 2.0, KOMPANG scale 1.5)
ITEM_ART_SIZE = 1.7

# Hover: item pops up — lifts this many pixels, scales by (1 + HOVER_POP),
# and shows its name above it
HOVER_LIFT = 16
HOVER_POP = 0.35
GLOW_BLUR_RADIUS = 10  # px, softness of the outline glow

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
        "x": 1.8,
        "y": 2.14,
        "image": os.path.join("assets", "newassets", "wau.png"),
        "desc": os.path.join("assets", "itemsdesc", "waud.png"),
        "color": (232, 92, 92),
        "history": (
            "Wau is the giant moon-kite of the Malay world, named for its "
            "crescent shape. Flown after the rice harvest, these handcrafted "
            "kites were once so prized they appeared on the RM50 banknote. In "
            "Sarawak, master craftsmen keep wau-making alive with bamboo, "
            "vine and paper."
        ),
    },
    {
        "name": "TAMBOK",
        "x": 8.2,
        "y": 2.14,
        "image": os.path.join("assets", "newassets", "bakulsarawak.png"),
        "desc": os.path.join("assets", "itemsdesc", "tambok2.png"),
        "color": (150, 120, 200),
        "history": (
            "The tambok is the handwoven basket of Sarawak's "
            "indigenous communities, coiled from rattan, pandan and "
            "mangrove bark. Used for carrying garden harvests and sago, "
            "each basket carries its weaver's patterns and remains a "
            "treasured craft in Kuching's markets."
        ),
    },
    {
        "name": "BAHULU",
        "x": 1.312,
        "y": 4.72,
        "image": os.path.join("assets", "newassets", "bahulu.png"),
        "desc": os.path.join("assets", "itemsdesc", "kuihbahulud.png"),
        "color": (128, 200, 110),
        "history": (
            "Kuih bahulu is a beloved Malaysian sponge cake baked in "
            "flower-shaped moulds. Crisp on the outside and soft within, "
            "the small kampung versions called 'telinga keling' are a "
            "festive favourite, enjoyed with palm-sugar syrup during "
            "gatherings."
        ),
    },
    {
        "name": "TEBALOI",
        "x": 2.8,
        "y": 4.72,
        "image": os.path.join("assets", "newassets", "tebaloi.png"),
        "desc": os.path.join("assets", "itemsdesc", "tebaloid.png"),
        "color": (222, 184, 90),
        "history": (
            "Tebaloi is Sarawak's classic sago biscuit, crisp and lightly "
            "sweetened with coconut and palm sugar. A staple of the Melanau "
            "community, its long shelf life made it the essential travelling "
            "food along the old trading river routes of Sarawak."
        ),
    },
    {
        "name": "KUIH CINCIN",
        "x": 4.288,
        "y": 5.016,
        "image": os.path.join("assets", "newassets", "kuihcincin.png"),
        "desc": os.path.join("assets", "itemsdesc", "kuihcincind.png"),
        "color": (232, 120, 168),
        "history": (
            "Kuih cincin, or ring cake, is a Sarawakian rice-flour pastry "
            "shaped like a golden ring. Deep-fried until crisp and glazed "
            "with sugar, it graces Kuching's festive sweet platters and is "
            "best with a hot cup of Sarawak kopi."
        ),
    },
    {
        "name": "KOMPANG",
        "x": 6.556,
        "y": 4.72,
        "scale": 1.5,
        "image": os.path.join("assets", "newassets", "kompang.png"),
        "desc": os.path.join("assets", "itemsdesc", "kompangd.png"),
        "color": (232, 156, 92),
        "history": (
            "Kompang is a shallow single-headed frame drum played in "
            "groups. Its sharp, driving rhythm marks wedding processions, "
            "welcoming ceremonies and festive parades, keeping the beat "
            "for silat displays across the Malay world."
        ),
    },
    {
        "name": "SAPE",
        "x": 8.2,
        "y": 4.72,
        "rot": 23.0,  # clockwise degrees
        "scale": 2.0,
        "image": os.path.join("assets", "newassets", "sape.png"),
        "desc": os.path.join("assets", "itemsdesc", "saped.png"),
        "color": (92, 150, 232),
        "history": (
            "The sape is the traditional lute of the Orang Ulu of Sarawak "
            "and Kalimantan, carved from a single block of wood. Its gentle, "
            "plucked melodies took longhouse journeys and healing rituals, "
            "and today it headlines Kuching's Rainforest World Music "
            "Festival."
        ),
    },
]

# Item detail popup (full-bleed design PNG, 16:9) — scale to ~90% of screen
# on each axis (~81% screen area). Fallback drawn menu uses the same box.
DESC_RATIO_W = 0.90
DESC_RATIO_H = 0.90
MENU_PAD = 48
TITLE_FONT = 44
BODY_FONT = 22
HINT_FONT = 16
THUMB_SIZE = 220

# Cursor
CURSOR_SIZE = 16

# Idle help: show the how-to-controls popup after this many idle seconds
IDLE_HELP_DELAY = 5.0

# Optional assets (relative; resolved via asset_path())
BACKDROP_IMAGE = os.path.join("assets", "items", "bgpsr.jpg")
BACKDROP_BLUR_RADIUS = 6.0
BACKDROP_GRAYSCALE = True
BACKDROP_DARKEN = 0.55  # brightness multiplier for the backdrop
BG_IMAGE = os.path.join("assets", "items", "PASAR2.png")
ROOF_IMAGE = os.path.join("assets", "items", "roof.png")
FONT_FILE = os.path.join("assets", "fonts", "press_start_2p.ttf")

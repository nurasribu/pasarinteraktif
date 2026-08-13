"use strict";

// Mirrors config.py (desktop source of truth). Palette, layout, item data.

const W = 1920;
const H = 1080;

const VIRTUAL_W = 10.0;
const VIRTUAL_H = 8.0;
const ITEM_RADIUS = 1.2;
const ITEM_ART_SIZE = 2.4;

const PALETTE = {
  BG_TOP: "#141022",
  BG_BOTTOM: "#251A33",
  ITEM_FILL: "#EDE1B5",
  ITEM_EDGE: "#3E2D42",
  HOVER_RING: "#FFD060",
  TEXT: "#EEEAD6",
  MUTED: "#A096AA",
  PANEL_BG: "#181428",
  PANEL_BORDER: "#FFD060",
  CURSOR: "#FFFFFF",
  DIM_ALPHA: 170,
};

const ITEMS = [
  {
    name: "WAU",
    x: 1.0,
    y: 3.0,
    image: "assets/items/wau.png",
    color: "#E85C5C",
    history:
      "PLACEHOLDER COPY. Wau is the giant moon-kite of the Malay " +
      "east coast, named for its crescent shape. Flown after the " +
      "rice harvest, it once appeared on the RM50 banknote.",
  },
  {
    name: "GASING",
    x: 3.0,
    y: 5.0,
    image: "assets/items/gasing.png",
    color: "#5C96E8",
    history:
      "PLACEHOLDER COPY. Gasing is the Malay spinning top from " +
      "Kelantan and Malacca. Champion tops weigh up to five " +
      "kilograms and spins can last over two hours.",
  },
  {
    name: "KOMPANG",
    x: 7.0,
    y: 5.0,
    image: "assets/items/kompang.png",
    color: "#80C86E",
    history:
      "PLACEHOLDER COPY. Kompang is a shallow single-headed frame " +
      "drum played in groups at weddings and processions, keeping " +
      "rhythm for silat and zapin.",
  },
];

const MENU_RATIO_W = 0.60;
const MENU_RATIO_H = 0.72;
const MENU_PAD = 48;
const TITLE_FONT = 44;
const BODY_FONT = 22;
const HINT_FONT = 16;
const THUMB_SIZE = 220;
const CURSOR_SIZE = 16;

const FONT_URL = "assets/fonts/press_start_2p.ttf";
const FONT_FAMILY = "Press Start 2P";
const BACKDROP_IMAGE = "assets/items/bg.jpg";
const BG_IMAGE = "assets/items/PASAR1.png";

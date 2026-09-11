"use strict";

// Mirrors config.py (desktop source of truth). Palette, layout, item data.

const W = 1920;
const H = 1080;

const VIRTUAL_W = 10.0;
const VIRTUAL_H = 8.0;
const ITEM_RADIUS = 0.9;
const ITEM_ART_SIZE = 1.7; // diameter in grid units; items may carry "scale" (e.g. SAPE×2, KOMPANG×1.5)
const HOVER_LIFT = 16;
const HOVER_POP = 0.35;
const GLOW_BLUR_RADIUS = 10;

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
    x: 1.8,
    y: 2.14,
    image: "assets/newassets/wau.png",
    desc: "assets/itemsdesc/waud.png",
    color: "#E85C5C",
    history:
      "Wau is the giant moon-kite of the Malay world, named for its " +
      "crescent shape. Flown after the rice harvest, these handcrafted " +
      "kites were once so prized they appeared on the RM50 banknote. In " +
      "Sarawak, master craftsmen keep wau-making alive with bamboo, " +
      "vine and paper.",
  },
  {
    name: "TAMBOK",
    x: 8.2,
    y: 2.14,
    image: "assets/newassets/bakulsarawak.png",
    desc: "assets/itemsdesc/tambok2.png",
    color: "#9678C8",
    history:
      "The tambok is the handwoven basket of Sarawak's " +
      "indigenous communities, coiled from rattan, pandan and " +
      "mangrove bark. Used for carrying garden harvests and sago, " +
      "each basket carries its weaver's patterns and remains a " +
      "treasured craft in Kuching's markets.",
  },
  {
    name: "BAHULU",
    x: 1.312,
    y: 4.72,
    image: "assets/newassets/bahulu.png",
    desc: "assets/itemsdesc/kuihbahulud.png",
    color: "#80C86E",
    history:
      "Kuih bahulu is a beloved Malaysian sponge cake baked in " +
      "flower-shaped moulds. Crisp on the outside and soft within, " +
      "the small kampung versions called 'telinga keling' are a " +
      "festive favourite, enjoyed with palm-sugar syrup during " +
      "gatherings.",
  },
  {
    name: "TEBALOI",
    x: 2.8,
    y: 4.72,
    image: "assets/newassets/tebaloi.png",
    desc: "assets/itemsdesc/tebaloid.png",
    color: "#DEB85A",
    history:
      "Tebaloi is Sarawak's classic sago biscuit, crisp and lightly " +
      "sweetened with coconut and palm sugar. A staple of the Melanau " +
      "community, its long shelf life made it the essential travelling " +
      "food along the old trading river routes of Sarawak.",
  },
  {
    name: "KUIH CINCIN",
    x: 4.288,
    y: 5.016,
    image: "assets/newassets/kuihcincin.png",
    desc: "assets/itemsdesc/kuihcincind.png",
    color: "#E878A8",
    history:
      "Kuih cincin, or ring cake, is a Sarawakian rice-flour pastry " +
      "shaped like a golden ring. Deep-fried until crisp and glazed " +
      "with sugar, it graces Kuching's festive sweet platters and is " +
      "best with a hot cup of Sarawak kopi.",
  },
  {
    name: "KOMPANG",
    x: 6.556,
    y: 4.72,
    scale: 1.5,
    image: "assets/newassets/kompang.png",
    desc: "assets/itemsdesc/kompangd.png",
    color: "#E89C5C",
    history:
      "Kompang is a shallow single-headed frame drum played in " +
      "groups. Its sharp, driving rhythm marks wedding processions, " +
      "welcoming ceremonies and festive parades, keeping the beat " +
      "for silat displays across the Malay world.",
  },
  {
    name: "SAPE",
    x: 8.2,
    y: 4.72,
    rot: 23.0,
    scale: 2.0,
    image: "assets/newassets/sape.png",
    desc: "assets/itemsdesc/saped.png",
    color: "#5C96E8",
    history:
      "The sape is the traditional lute of the Orang Ulu of Sarawak " +
      "and Kalimantan, carved from a single block of wood. Its gentle, " +
      "plucked melodies took longhouse journeys and healing rituals, " +
      "and today it headlines Kuching's Rainforest World Music " +
      "Festival.",
  },
];

const DESC_RATIO_W = 0.9;
const DESC_RATIO_H = 0.9;
const MENU_PAD = 48;
const TITLE_FONT = 44;
const BODY_FONT = 22;
const HINT_FONT = 16;
const THUMB_SIZE = 220;
const CURSOR_SIZE = 16;
const IDLE_HELP_DELAY = 5.0;

const FONT_URL = "assets/fonts/press_start_2p.ttf";
const FONT_FAMILY = "Press Start 2P";
const BACKDROP_IMAGE = "assets/items/bgpsr.jpg";
const BACKDROP_BLUR_RADIUS = 6;
const BACKDROP_GRAYSCALE = true;
const BACKDROP_DARKEN = 0.55;
const BG_IMAGE = "assets/items/PASAR2.png";
const ROOF_IMAGE = "assets/items/roof.png";

// Hand tracking tuning
const HAND_CONFIG = {
  SMOOTHING: 0.35,       // EMA alpha (0 = frozen, 1 = no smoothing)
  PINCH_THRESHOLD: 0.15, // Normalised pinch distance to trigger click
  CLICK_COOLDOWN: 400,   // Ms minimum between clicks
  MIRROR_X: true,        // Flip x-axis for selfie/mirror view
};

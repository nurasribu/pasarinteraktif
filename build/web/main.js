"use strict";

// Pasar Interaktif — web port. Vanilla canvas, mirrors main.py behaviour.

// Safety: work even if a cached config.js lacks the newest constants.
const CFG_LIFT = typeof HOVER_LIFT === "number" ? HOVER_LIFT : 16;
const CFG_POP = typeof HOVER_POP === "number" ? HOVER_POP : 0.35;
const CFG_GLOW_BLUR = typeof GLOW_BLUR_RADIUS === "number" ? GLOW_BLUR_RADIUS : 10;
const CFG_BG_BLUR = typeof BACKDROP_BLUR_RADIUS === "number" ? BACKDROP_BLUR_RADIUS : 0;
const CFG_BG_GRAY = typeof BACKDROP_GRAYSCALE === "boolean" ? BACKDROP_GRAYSCALE : false;
const CFG_BG_DARK = typeof BACKDROP_DARKEN === "number" ? BACKDROP_DARKEN : 1;

(async function main() {
  const canvas = document.getElementById("screen");
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  const P = PALETTE;
  const scaleX = W / VIRTUAL_W;
  const scaleY = H / VIRTUAL_H;
  const radius = Math.min(scaleX, scaleY) * ITEM_RADIUS;
  const artSize = Math.min(scaleX, scaleY) * ITEM_ART_SIZE;

  // ---------- assets ----------
  const img = (src) =>
    new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });

  let overlay = null;
  let roof = null;
  let backdrop = null;
  let itemSurfs = {};
  let itemGlows = {};
  let descSurfs = {};

  const font = new FontFace(FONT_FAMILY, `url(${FONT_URL})`);
  try {
    await font.load();
    document.fonts.add(font);
    await document.fonts.load(`30px "${FONT_FAMILY}"`);
    await document.fonts.ready;
  } catch (e) {
    console.warn("font load failed", e);
  }

  const loads = [];
  loads.push(img(BG_IMAGE).then((i) => (overlay = i)).catch(() => {}));
  loads.push(img(ROOF_IMAGE).then((i) => (roof = i)).catch(() => {}));
  loads.push(img(BACKDROP_IMAGE).then((i) => (backdrop = i)).catch(() => {}));
  for (const item of ITEMS) {
    loads.push(
      img(item.image)
        .then((i) => {
          if (!item.rot) {
            itemSurfs[item.name] = i;
            return;
          }
          // Pre-rotate (clockwise) into a canvas — glow follows the sprite.
          const r = (item.rot * Math.PI) / 180;
          const w = Math.ceil(Math.abs(i.width * Math.cos(r)) + Math.abs(i.height * Math.sin(r)));
          const h = Math.ceil(Math.abs(i.width * Math.sin(r)) + Math.abs(i.height * Math.cos(r)));
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          const cc = c.getContext("2d");
          cc.translate(w / 2, h / 2);
          cc.rotate(r);
          cc.drawImage(i, -i.width / 2, -i.height / 2);
          itemSurfs[item.name] = c;
        })
        .catch(() => {})
    );
    loads.push(
      img(item.desc)
        .then((i) => (descSurfs[item.name] = i))
        .catch(() => {})
    );
  }
  await Promise.all(loads);
  for (const item of ITEMS) {
    if (itemSurfs[item.name]) itemGlows[item.name] = makeGlow(itemSurfs[item.name]);
  }

  // ---------- background (composed once, like _compose_bg) ----------
  const bg = document.createElement("canvas");
  bg.width = W;
  bg.height = H;
  const bctx = bg.getContext("2d");

  if (backdrop) {
    const scale = Math.max(W / backdrop.width, H / backdrop.height);
    const tw = backdrop.width * scale;
    const th = backdrop.height * scale;
    const blur = CFG_BG_BLUR;
    let f = (CFG_BG_GRAY ? "grayscale(1)" : "") +
            (CFG_BG_DARK !== 1 ? ` brightness(${CFG_BG_DARK})` : "");
    if (blur > 0) f = `blur(${blur}px) ${f}`.trim();
    if (f) bctx.filter = f;
    bctx.drawImage(backdrop, (W - tw) / 2, (H - th) / 2, tw, th);
    bctx.filter = "none";
  } else {
    const g = bctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, P.BG_TOP);
    g.addColorStop(1, P.BG_BOTTOM);
    bctx.fillStyle = g;
    bctx.fillRect(0, 0, W, H);
  }
  if (overlay) bctx.drawImage(overlay, 0, 0);

  // ---------- helpers ----------
  const gridToScreen = (gx, gy) => [gx * scaleX, gy * scaleY];

  const FONT_STACK = `"${FONT_FAMILY}", "Courier New", monospace`;

  const text = (s, size, color, x, y, { center = true, shadow = false } = {}) => {
    ctx.font = `${size}px ${FONT_STACK}`;
    ctx.textBaseline = center ? "middle" : "top";
    ctx.textAlign = center ? "center" : "left";
    if (shadow) {
      ctx.fillStyle = "#000000";
      ctx.fillText(s, x + 3, y + 3);
    }
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
  };

  const wrapText = (s, size, maxWidth) => {
    ctx.font = `${size}px ${FONT_STACK}`;
    const words = s.split(" ");
    const lines = [];
    let cur = "";
    for (const word of words) {
      const trial = cur ? cur + " " + word : word;
      if (ctx.measureText(trial).width <= maxWidth) {
        cur = trial;
      } else {
        if (cur) lines.push(cur);
        cur = word;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const fitImage = (im, box) => {
    const scale = Math.min(box / im.width, box / im.height);
    return { w: Math.max(1, Math.round(im.width * scale)), h: Math.max(1, Math.round(im.height * scale)) };
  };

  // Soft halo that follows the sprite silhouette (via canvas shadow blur)
  function makeGlow(im) {
    const pad = 56;
    const g = document.createElement("canvas");
    g.width = im.width + pad * 2;
    g.height = im.height + pad * 2;
    const gc = g.getContext("2d");
    gc.shadowColor = P.HOVER_RING;
    gc.shadowBlur = CFG_GLOW_BLUR * 3;
    gc.drawImage(im, pad, pad);
    return g;
  };

  // ---------- input ----------
  // Mouse fallback — always available
  const mouseInput = (() => {
    let gx = 0;
    let gy = 0;
    let clicked = false;
    const toGrid = (e) => {
      const r = canvas.getBoundingClientRect();
      return [
        ((e.clientX - r.left) / r.width) * VIRTUAL_W,
        ((e.clientY - r.top) / r.height) * VIRTUAL_H,
      ];
    };
    canvas.addEventListener("pointermove", (e) => {
      const [x, y] = toGrid(e);
      gx = x;
      gy = y;
      lastAction = performance.now();
    });
    canvas.addEventListener("pointerdown", (e) => {
      const [x, y] = toGrid(e);
      gx = x;
      gy = y;
      clicked = true;
      lastAction = performance.now();
    });
    return {
      position: () => [gx, gy],
      justClicked: () => {
        const c = clicked;
        clicked = false;
        return c;
      },
    };
  })();

  // Hand tracking — auto-detect webcam
  const handInput = new HandInput();
  handInput.onActivity = () => {
    lastAction = performance.now();
  };
  handInput.init().then((ok) => {
    if (ok) console.log("Hand tracking active — pinch to click");
    else console.log("Hand tracking unavailable — using mouse");
  });

  // Unified input: hand wins when active, mouse is fallback
  const input = {
    position: () => (handInput.active ? handInput.position() : mouseInput.position()),
    justClicked: () => (handInput.active ? handInput.justClicked() : mouseInput.justClicked()),
  };

  // ---------- rendering ----------
  const hitTest = ([gx, gy]) => {
    for (const item of ITEMS) {
      const dx = gx - item.x;
      const dy = gy - item.y;
      if (dx * dx + dy * dy <= ITEM_RADIUS * ITEM_RADIUS) return item;
    }
    return null;
  };

  const renderStall = () => {
    ctx.drawImage(bg, 0, 0);
    text("Pasar Interaktif", 30, P.TEXT, W / 2, H - 100, { shadow: true });
    text("klik item untuk lihat sejarahnya", HINT_FONT, P.TEXT, W / 2, H - 58, { shadow: true });
  };

const renderItem = (item, hovered) => {
    let [cx, cy] = gridToScreen(item.x, item.y);
    // Pop: on hover, lift the item up, scale it bigger, and show a
    // floating name tag above it
    const k = 1 + (hovered ? CFG_POP : 0);
    const artK = item.scale || 1;
    if (hovered) cy -= CFG_LIFT;
    const surf = itemSurfs[item.name];
    if (hovered) {
      const glow = itemGlows[item.name];
      if (surf && glow) {
        const s = fitImage(surf, artSize * artK * k);
        const kk = s.w / surf.width;
        ctx.drawImage(glow, cx - (glow.width * kk) / 2, cy - (glow.height * kk) / 2, glow.width * kk, glow.height * kk);
      }
      if (!surf) {
        ctx.strokeStyle = P.HOVER_RING;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (surf) {
      const s = fitImage(surf, artSize * artK * k);
      ctx.drawImage(surf, cx - s.w / 2, cy - s.h / 2, s.w, s.h);
    } else {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = P.ITEM_EDGE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (hovered) {
      const tagY = Math.max(cy - (artSize * artK * k) / 2 - 30, 28);
      text(item.name, BODY_FONT, P.HOVER_RING, cx, tagY, { shadow: true });
    }
    ctx.restore();
  };

  const renderCursor = ([gx, gy]) => {
    const [cx, cy] = gridToScreen(gx, gy);
    const s = CURSOR_SIZE / 2;
    ctx.strokeStyle = P.CURSOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - s, cy - s, CURSOR_SIZE, CURSOR_SIZE);
    ctx.strokeStyle = P.HOVER_RING;
    ctx.beginPath();
    ctx.moveTo(cx - s - 4, cy);
    ctx.lineTo(cx + s + 4, cy);
    ctx.moveTo(cx, cy - s - 4);
    ctx.lineTo(cx, cy + s + 4);
    ctx.stroke();
  };

  const renderMenu = (item) => {
    ctx.fillStyle = `rgba(0,0,0,${P.DIM_ALPHA / 255})`;
    ctx.fillRect(0, 0, W, H);

    const pw = Math.round(W * DESC_RATIO_W);
    const ph = Math.round(H * DESC_RATIO_H);
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;

    const desc = descSurfs[item.name];
    if (desc) {
      const scale = Math.min(pw / desc.width, ph / desc.height);
      const s = {
        w: Math.max(1, Math.round(desc.width * scale)),
        h: Math.max(1, Math.round(desc.height * scale)),
      };
      ctx.drawImage(desc, (W - s.w) / 2, (H - s.h) / 2, s.w, s.h);
    } else {
      // Fallback: drawn panel (kept for deployments without the PNGs)
      ctx.fillStyle = P.PANEL_BG;
      ctx.strokeStyle = P.PANEL_BORDER;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 10);
      ctx.fill();
      ctx.stroke();
      text(item.name, TITLE_FONT, P.HOVER_RING, W / 2, py + 90, { shadow: true });
      const textX = px + MENU_PAD;
      const textW = pw - 2 * MENU_PAD;
      const lines = wrapText(item.history, BODY_FONT, textW);
      const lineH = 44;
      let y = py + ph / 2 - (lines.length * lineH) / 2;
      for (const line of lines) {
        text(line, BODY_FONT, P.TEXT, textX, y, { center: false });
        y += lineH;
      }
    }

    text("Cubit mana-mana untuk tutup", HINT_FONT, P.MUTED, W / 2, py + ph - MENU_PAD - 6, { shadow: true });
  };

  // Draw an emoji glyph with a system color-emoji font (pixel font has none)
  const emoji = (ch, size, x, y) => {
    ctx.font = `${size}px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y);
  };

  const renderHelp = () => {
    ctx.fillStyle = `rgba(0,0,0,${P.DIM_ALPHA / 255})`;
    ctx.fillRect(0, 0, W, H);

    const pw = Math.round(W * 0.6);
    const ph = Math.round(H * 0.5);
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;

    ctx.fillStyle = P.PANEL_BG;
    ctx.strokeStyle = P.PANEL_BORDER;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    const cx = W / 2;
    text("Cara Bermain", TITLE_FONT, P.HOVER_RING, cx, py + 80, { shadow: true });

    const rows = [
      ["\u{1F590}", "Gerak tangan untuk gerak kursor"],
      ["\u{1F90F}", "Cubit untuk pilih item"],
    ];
    let rowY = py + 190;
    for (const [emo, label] of rows) {
      emoji(emo, 64, cx - 250, rowY);
      const tx = cx - 150;
      const tw = px + pw - MENU_PAD - tx;
      const lbl = wrapText(label, BODY_FONT, tw);
      let ly = rowY - ((lbl.length - 1) * 44) / 2;
      for (const ln of lbl) {
        text(ln, BODY_FONT, P.TEXT, tx, ly, { center: false });
        ly += 44;
      }
      rowY += 120;
    }

    text("Klik di mana-mana atau tekan ESC untuk tutup", HINT_FONT, P.MUTED, cx, py + ph - 50, { shadow: true });
  };

  // ---------- state & loop ----------
  let selected = null;
  let helpVisible = false;
  let lastAction = performance.now();
  let lastCursor = [0, 0];

  window.addEventListener("keydown", (e) => {
    lastAction = performance.now();
    if (e.key === "Escape") {
      selected = null;
      helpVisible = false;
    }
    if (e.key === "f" || e.key === "F") {
      if (document.fullscreenElement) document.exitFullscreen();
      else canvas.requestFullscreen();
    }
  });

  const loop = () => {
    const gpos = input.position();
    const clicked = input.justClicked();
    if (clicked) lastAction = performance.now();

    if (!helpVisible && selected === null &&
        performance.now() - lastAction > IDLE_HELP_DELAY * 1000) {
      helpVisible = true;
      lastAction = performance.now();
    }

    if (helpVisible) {
      if (clicked) helpVisible = false;
    } else if (selected !== null) {
      if (clicked) selected = null;
    } else if (clicked) {
      const hit = hitTest(gpos);
      if (hit) selected = hit;
    }

    renderStall();
    const hovered = selected === null ? hitTest(gpos) : null;
    // Draw all items at rest first, then the roof on top of the pole items,
    // then the hovered item last so it pops in front of the roof.
    for (const item of ITEMS) if (item !== hovered) renderItem(item, false);
    if (roof) ctx.drawImage(roof, 0, 0);
    if (hovered) renderItem(hovered, true);
    renderCursor(gpos);
    if (selected !== null) renderMenu(selected);
    else if (helpVisible) renderHelp();

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  window.__app = {
    get state() { return selected ? selected.name : null; },
    get helpShown() { return helpVisible; },
    debug: () => ({
      lastCursor,
      handActive: handInput.active,
      idleMs: Math.round(performance.now() - lastAction),
      mouseGx: mouseInput.position()[0],
    }),
  };
})();

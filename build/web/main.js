"use strict";

// Pasar Interaktif — web port. Vanilla canvas, mirrors main.py behaviour.

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
  let backdrop = null;
  let itemSurfs = {};

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
  loads.push(img(BACKDROP_IMAGE).then((i) => (backdrop = i)).catch(() => {}));
  for (const item of ITEMS) {
    loads.push(
      img(item.image).then((i) => (itemSurfs[item.name] = i)).catch(() => {})
    );
  }
  await Promise.all(loads);

  // ---------- background (composed once, like _compose_bg) ----------
  const bg = document.createElement("canvas");
  bg.width = W;
  bg.height = H;
  const bctx = bg.getContext("2d");

  if (backdrop) {
    const scale = Math.max(W / backdrop.width, H / backdrop.height);
    const tw = backdrop.width * scale;
    const th = backdrop.height * scale;
    bctx.drawImage(backdrop, (W - tw) / 2, (H - th) / 2, tw, th);
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

  // ---------- input (pointer events; swappable for webcam later) ----------
  const input = (() => {
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
    });
    canvas.addEventListener("pointerdown", (e) => {
      const [x, y] = toGrid(e);
      gx = x;
      gy = y;
      clicked = true;
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
    const [cx, cy] = gridToScreen(item.x, item.y);
    if (hovered) {
      ctx.strokeStyle = P.HOVER_RING;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    const surf = itemSurfs[item.name];
    if (surf) {
      const s = fitImage(surf, artSize);
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
    text(item.name, BODY_FONT, hovered ? P.HOVER_RING : P.TEXT, cx, cy + radius + 30, { shadow: true });
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

    const pw = Math.round(W * MENU_RATIO_W);
    const ph = Math.round(H * MENU_RATIO_H);
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;

    ctx.fillStyle = P.PANEL_BG;
    ctx.strokeStyle = P.PANEL_BORDER;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = P.MUTED;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px + 8, py + 8, pw - 16, ph - 16, 8);
    ctx.stroke();

    const leftW = Math.round(pw * 0.38);
    const colX = px + MENU_PAD;
    const tcx = colX + leftW / 2;
    const tcy = py + ph / 2 - 60;

    const surf = itemSurfs[item.name];
    if (surf) {
      const s = fitImage(surf, THUMB_SIZE);
      ctx.drawImage(surf, tcx - s.w / 2, tcy - s.h / 2, s.w, s.h);
    } else {
      const r = THUMB_SIZE / 2;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(tcx, tcy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = P.ITEM_EDGE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(tcx, tcy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    text(item.name, TITLE_FONT, P.HOVER_RING, tcx, tcy + THUMB_SIZE / 2 + 46, { shadow: true });

    ctx.strokeStyle = P.ITEM_EDGE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + leftW + 12, py + MENU_PAD);
    ctx.lineTo(px + leftW + 12, py + ph - MENU_PAD);
    ctx.stroke();

    const textX = px + leftW + MENU_PAD + 20;
    const textW = px + pw - MENU_PAD - textX;
    const lines = wrapText(item.history, BODY_FONT, textW);
    const lineH = 44;
    let y = py + ph / 2 - (lines.length * lineH) / 2;
    for (const line of lines) {
      text(line, BODY_FONT, P.TEXT, textX, y, { center: false });
      y += lineH;
    }

    text("klik mana-mana untuk tutup", HINT_FONT, P.MUTED, px + pw / 2, py + ph - MENU_PAD - 6);
  };

  // ---------- state & loop ----------
  let selected = null;

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") selected = null;
    if (e.key === "f" || e.key === "F") {
      if (document.fullscreenElement) document.exitFullscreen();
      else canvas.requestFullscreen();
    }
  });

  const loop = () => {
    const gpos = input.position();
    const clicked = input.justClicked();

    if (selected !== null) {
      if (clicked) selected = null;
    } else if (clicked) {
      const hit = hitTest(gpos);
      if (hit) selected = hit;
    }

    renderStall();
    const hovered = selected === null ? hitTest(gpos) : null;
    for (const item of ITEMS) renderItem(item, hovered === item);
    renderCursor(gpos);
    if (selected !== null) renderMenu(selected);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  window.__app = { get state() { return selected ? selected.name : null; } };
})();

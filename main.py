import asyncio
import sys

import pygame
try:
    from PIL import Image, ImageFilter, ImageSequence
    HAS_PIL = True
except Exception:
    HAS_PIL = False

import config
from pointer import MousePointer

IN_WASM = sys.platform == "emscripten" or getattr(sys, "_pygbag", False)


def wrap_text(font, text, max_width):
    words = text.split()
    lines = []
    cur = ""
    for word in words:
        trial = word if not cur else cur + " " + word
        if font.size(trial)[0] <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


class App:
    def __init__(self, fullscreen):
        pygame.init()
        self.fullscreen = fullscreen
        self.screen = None
        self.clock = pygame.time.Clock()
        self.selected = None  # item dict, or None = idle
        self.running = True
        self.fonts = {}
        self._gif_frames = []
        self._gif_index = 0
        self._gif_acc = 0
        self._gif_scaled = None
        self._gradient = None
        self._overlay = None
        self._open_window()
        self.pointer = MousePointer(self.screen.get_size())
        self._load_assets()
        self._compose_bg()

    def _open_window(self):
        if IN_WASM:
            self.screen = pygame.display.set_mode(config.WEB_SCREEN_SIZE)
        else:
            flags = pygame.FULLSCREEN if self.fullscreen else 0
            try:
                self.screen = pygame.display.set_mode(config.SCREEN_SIZE,
                                                      flags)
            except Exception:
                self.screen = pygame.display.set_mode(config.SCREEN_SIZE,
                                                      pygame.SCALED)
        pygame.display.set_caption("Pasar Interaktif")
        pygame.mouse.set_visible(False)
        self.w, self.h = self.screen.get_size()
        self.scale_x = self.w / config.VIRTUAL_W
        self.scale_y = self.h / config.VIRTUAL_H
        self.radius = min(self.scale_x, self.scale_y) * config.ITEM_RADIUS
        self.art_size = int(min(self.scale_x, self.scale_y) * config.ITEM_ART_SIZE)
        self.bg = pygame.Surface((self.w, self.h))

    def _set_mode(self):
        self._open_window()
        self._compose_bg()

    def _load_assets(self):
        try:
            self._overlay = pygame.image.load(
                config.asset_path(config.BG_IMAGE)).convert_alpha()
        except Exception:
            self._overlay = None
        for item in config.ITEMS:
            try:
                item["_surf"] = pygame.image.load(
                    config.asset_path(item["image"])).convert_alpha()
            except Exception:
                item["_surf"] = None
        if HAS_PIL:
            try:
                img = Image.open(config.asset_path(config.BACKDROP_IMAGE))
                for frame in ImageSequence.Iterator(img):
                    frame = frame.convert("RGBA")
                    if config.BACKDROP_BLUR_RADIUS > 0:
                        frame = frame.filter(
                            ImageFilter.GaussianBlur(config.BACKDROP_BLUR_RADIUS))
                    surf = pygame.image.frombuffer(frame.tobytes(), frame.size,
                                                   "RGBA")
                    self._gif_frames.append(
                        (surf, frame.info.get("duration", 66)))
            except Exception:
                self._gif_frames = []
        if not self._gif_frames:
            try:
                surf = pygame.image.load(
                    config.asset_path(config.BACKDROP_IMAGE))
                self._gif_frames = [(surf, 3600000)]
            except Exception:
                self._gif_frames = []
        if not self._gif_frames:
            self._gradient = pygame.Surface((self.w, self.h))
            top, bottom = config.BG_TOP, config.BG_BOTTOM
            for y in range(self.h):
                t = y / max(1, self.h - 1)
                col = (
                    int(top[0] + (bottom[0] - top[0]) * t),
                    int(top[1] + (bottom[1] - top[1]) * t),
                    int(top[2] + (bottom[2] - top[2]) * t),
                )
                pygame.draw.line(self._gradient, col, (0, y), (self.w, y))
        try:
            pygame.font.Font(config.asset_path(config.FONT_FILE), 10)
            self.font_file = config.asset_path(config.FONT_FILE)
        except Exception:
            self.font_file = None

    def _compose_bg(self):
        self.bg.fill(0)
        if self._gif_frames:
            frame = self._gif_frames[self._gif_index][0]
            sw, sh = frame.get_size()
            scale = max(self.w / sw, self.h / sh)
            tw, th = int(sw * scale), int(sh * scale)
            if self._gif_scaled is None or self._gif_scaled.get_size() != (tw, th):
                self._gif_scaled = pygame.Surface((tw, th))
            pygame.transform.smoothscale(frame, (tw, th), self._gif_scaled)
            self.bg.blit(self._gif_scaled, ((self.w - tw) // 2, (self.h - th) // 2))
        elif self._gradient:
            self.bg.blit(self._gradient, (0, 0))
        if self._overlay:
            self.bg.blit(self._overlay, (0, 0))

    def font(self, size):
        if size not in self.fonts:
            if self.font_file:
                self.fonts[size] = pygame.font.Font(self.font_file, size)
            else:
                self.fonts[size] = pygame.font.Font(None, size)
        return self.fonts[size]

    @staticmethod
    def fit_image(surf, box):
        """Scale a surface to fit inside a box, preserving aspect (nearest)."""
        sw, sh = surf.get_size()
        scale = min(box / sw, box / sh)
        return pygame.transform.scale(
            surf, (max(1, int(sw * scale)), max(1, int(sh * scale))))

    def grid_to_screen(self, gx, gy):
        return (int(gx * self.scale_x), int(gy * self.scale_y))

    def hit_test(self, gpos):
        for item in config.ITEMS:
            dx = gpos[0] - item["x"]
            dy = gpos[1] - item["y"]
            if dx * dx + dy * dy <= config.ITEM_RADIUS * config.ITEM_RADIUS:
                return item
        return None

    def text(self, s, size, color, pos, center=True, shadow=False):
        if shadow:
            dark = (0, 0, 0)
            img = self.font(size).render(s, False, dark)
            rect = img.get_rect()
            if center:
                rect.center = pos
            else:
                rect.topleft = pos
            self.screen.blit(img, rect.move(3, 3))
        img = self.font(size).render(s, False, color)
        rect = img.get_rect()
        if center:
            rect.center = pos
        else:
            rect.topleft = pos
        self.screen.blit(img, rect)
        return rect

    def render_stall(self):
        self.screen.blit(self.bg, (0, 0))
        self.text("Pasar Interaktif", 30, config.TEXT, (self.w // 2, self.h - 120),
                  shadow=True)
        self.text("klik item untuk lihat sejarahnya", config.HINT_FONT,
                  config.MUTED, (self.w // 2, self.h - 78))

    def render_item(self, item, hovered):
        cx, cy = self.grid_to_screen(item["x"], item["y"])
        if hovered:
            pygame.draw.circle(self.screen, config.HOVER_RING, (cx, cy),
                               int(self.radius + 12), 3)
            pygame.draw.circle(self.screen, config.HOVER_RING, (cx, cy),
                               int(self.radius + 22), 2)
        surf = item.get("_surf")
        if surf:
            scaled = self.fit_image(surf, self.art_size)
            self.screen.blit(scaled, scaled.get_rect(center=(cx, cy)))
        else:
            pygame.draw.circle(self.screen, item["color"], (cx, cy),
                               int(self.radius))
            pygame.draw.circle(self.screen, config.ITEM_EDGE, (cx, cy),
                               int(self.radius), 3)
        name_color = config.HOVER_RING if hovered else config.TEXT
        self.text(item["name"], config.BODY_FONT, name_color,
                  (cx, cy + int(self.radius) + 30), shadow=True)

    def render_cursor(self, gpos):
        cx, cy = self.grid_to_screen(*gpos)
        s = config.CURSOR_SIZE // 2
        rect = pygame.Rect(cx - s, cy - s, config.CURSOR_SIZE, config.CURSOR_SIZE)
        pygame.draw.rect(self.screen, config.CURSOR, rect, 2)
        pygame.draw.line(self.screen, config.HOVER_RING,
                         (cx - s - 4, cy), (cx + s + 4, cy), 2)
        pygame.draw.line(self.screen, config.HOVER_RING,
                         (cx, cy - s - 4), (cx, cy + s + 4), 2)

    def render_menu(self, item):
        dim = pygame.Surface((self.w, self.h), pygame.SRCALPHA)
        dim.fill((0, 0, 0, config.DIM_ALPHA))
        self.screen.blit(dim, (0, 0))

        pw = int(self.w * config.MENU_RATIO_W)
        ph = int(self.h * config.MENU_RATIO_H)
        px = (self.w - pw) // 2
        py = (self.h - ph) // 2
        panel = pygame.Rect(px, py, pw, ph)
        pygame.draw.rect(self.screen, config.PANEL_BG, panel, border_radius=10)
        pygame.draw.rect(self.screen, config.PANEL_BORDER, panel, 3,
                         border_radius=10)
        pygame.draw.rect(self.screen, config.MUTED,
                         panel.inflate(-16, -16), 1, border_radius=8)

        left_w = int(pw * 0.38)
        col_x = px + config.MENU_PAD
        tcx = col_x + left_w // 2
        tcy = py + ph // 2 - 60
        surf = item.get("_surf")
        if surf:
            scaled = self.fit_image(surf, config.THUMB_SIZE)
            self.screen.blit(scaled, scaled.get_rect(center=(tcx, tcy)))
        else:
            thumb_r = config.THUMB_SIZE // 2
            pygame.draw.circle(self.screen, item["color"], (tcx, tcy), thumb_r)
            pygame.draw.circle(self.screen, config.ITEM_EDGE, (tcx, tcy),
                               thumb_r, 4)
        self.text(item["name"], config.TITLE_FONT, config.HOVER_RING,
                  (tcx, tcy + config.THUMB_SIZE // 2 + 46), shadow=True)
        pygame.draw.line(self.screen, config.ITEM_EDGE,
                         (px + left_w + 12, py + config.MENU_PAD),
                         (px + left_w + 12, py + ph - config.MENU_PAD), 2)

        text_x = px + left_w + config.MENU_PAD + 20
        text_w = px + pw - config.MENU_PAD - text_x
        font = self.font(config.BODY_FONT)
        lines = wrap_text(font, item["history"], text_w)
        line_h = font.get_linesize() + 8
        y = py + ph // 2 - (len(lines) * line_h) // 2
        for line in lines:
            self.text(line, config.BODY_FONT, config.TEXT, (text_x, y),
                      center=False)
            y += line_h

        self.text("klik mana-mana untuk tutup", config.HINT_FONT,
                  config.MUTED, (px + pw // 2, py + ph - config.MENU_PAD - 6))

    def render(self, gpos):
        self.render_stall()
        hovered = self.hit_test(gpos) if self.selected is None else None
        for item in config.ITEMS:
            self.render_item(item, hovered is item)
        self.render_cursor(gpos)
        if self.selected is not None:
            self.render_menu(self.selected)

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_f:
                    self.fullscreen = not self.fullscreen
                    self._set_mode()

    async def run(self, max_frames=None):
        frame = 0
        while self.running:
            dt = self.clock.tick(config.FPS)
            self.handle_events()
            gpos = self.pointer.position()
            clicked = self.pointer.just_clicked()

            if self._gif_frames:
                self._gif_acc += dt
                while (self._gif_acc >=
                       self._gif_frames[self._gif_index][1]):
                    self._gif_acc -= self._gif_frames[self._gif_index][1]
                    self._gif_index = (self._gif_index + 1) % len(self._gif_frames)
                    self._compose_bg()

            if self.selected is not None:
                if clicked:
                    self.selected = None
            else:
                if clicked:
                    hit = self.hit_test(gpos)
                    if hit:
                        self.selected = hit

            self.render(gpos)
            pygame.display.flip()
            if IN_WASM:
                await asyncio.sleep(0)

            frame += 1
            if max_frames and frame >= max_frames:
                self.running = False

        pygame.quit()


async def run_main(fullscreen, max_frames):
    await asyncio.sleep(0)
    app = App(fullscreen)
    await app.run(max_frames)


def main():
    fullscreen = "--windowed" not in sys.argv
    max_frames = None
    for arg in sys.argv:
        if arg.startswith("--frames="):
            max_frames = int(arg.split("=")[1])
    asyncio.run(run_main(fullscreen, max_frames))


if __name__ == "__main__":
    main()

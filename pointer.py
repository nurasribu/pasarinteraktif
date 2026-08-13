import pygame

import config


class Pointer:
    """Input source. Returns a position in virtual grid units and click events.

    The webcam/joystick upgrade later adds new subclasses implementing the
    same interface; nothing in main.py changes.
    """

    def position(self):
        raise NotImplementedError

    def just_clicked(self):
        raise NotImplementedError


class MousePointer(Pointer):
    def __init__(self, screen_size):
        self.sw, self.sh = screen_size
        self._prev = False

    def position(self):
        mx, my = pygame.mouse.get_pos()
        gx = mx / self.sw * config.VIRTUAL_W
        gy = my / self.sh * config.VIRTUAL_H
        return (gx, gy)

    def just_clicked(self):
        pressed = pygame.mouse.get_pressed()[0]
        clicked = pressed and not self._prev
        self._prev = pressed
        return clicked

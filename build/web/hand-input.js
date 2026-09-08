"use strict";

// Hand tracking input via MediaPipe Hands.
// Exposes HandInput class — same interface as mouse input (position / justClicked).

class HandInput {
  constructor() {
    this._gx = VIRTUAL_W / 2;
    this._gy = VIRTUAL_H / 2;
    this._rawGx = this._gx;
    this._rawGy = this._gy;
    this._clicked = false;
    this._prevPinch = false;
    this._active = false;
    this._lostAt = 0;
    this._lastPinchAt = 0;
    this._video = null;
    this._stream = null;
    this._hands = null;
    this._camera = null;
    this._ready = false;
  }

  get active() {
    return this._active;
  }

  async init() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
    } catch (e) {
      console.warn("Hand tracking: no webcam available", e);
      return false;
    }

    this._video = document.createElement("video");
    this._video.srcObject = this._stream;
    this._video.setAttribute("playsinline", "");
    this._video.muted = true;
    await this._video.play();

    if (typeof Hands === "undefined") {
      console.warn("Hand tracking: MediaPipe Hands not loaded");
      return false;
    }

    this._hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this._hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    this._hands.onResults((results) => this._onResults(results));

    if (typeof Camera !== "undefined") {
      this._camera = new Camera(this._video, {
        onFrame: async () => {
          if (this._hands) await this._hands.send({ image: this._video });
        },
        width: 640,
        height: 480,
      });
      this._camera.start();
    } else {
      // Fallback: manual frame feeding via requestAnimationFrame
      const feed = async () => {
        if (!this._hands || !this._video) return;
        if (this._video.readyState >= 2) {
          await this._hands.send({ image: this._video });
        }
        requestAnimationFrame(feed);
      };
      feed();
    }

    this._ready = true;
    return true;
  }

  _onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (this._active && this._lostAt === 0) {
        this._lostAt = Date.now();
      }
      if (this._active && Date.now() - this._lostAt > 1000) {
        this._active = false;
      }
      return;
    }

    this._lostAt = 0;
    this._active = true;

    const lm = results.multiHandLandmarks[0];
    const indexTip = lm[8];
    const thumbTip = lm[4];

    // Index finger tip → grid position (flipped x for mirror)
    const rawX = HAND_CONFIG.MIRROR_X ? 1 - indexTip.x : indexTip.x;
    const rawY = indexTip.y;
    this._rawGx = rawX * VIRTUAL_W;
    this._rawGy = rawY * VIRTUAL_H;

    // Exponential moving average for smoothing
    const a = HAND_CONFIG.SMOOTHING;
    this._gx = this._gx + (this._rawGx - this._gx) * a;
    this._gy = this._gy + (this._rawGy - this._gy) * a;

    // Pinch detection: thumb-index distance normalised by hand size
    const wrist = lm[0];
    const middleMcp = lm[9];
    const handDiag = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) || 0.1;
    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y) / handDiag;
    const pinching = pinchDist < HAND_CONFIG.PINCH_THRESHOLD;

    const now = Date.now();
    if (pinching && !this._prevPinch && now - this._lastPinchAt > HAND_CONFIG.CLICK_COOLDOWN) {
      this._clicked = true;
      this._lastPinchAt = now;
    }
    this._prevPinch = pinching;
  }

  position() {
    return [this._gx, this._gy];
  }

  justClicked() {
    const c = this._clicked;
    this._clicked = false;
    return c;
  }

  destroy() {
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
    }
    this._hands = null;
    this._video = null;
    this._stream = null;
    this._ready = false;
  }
}

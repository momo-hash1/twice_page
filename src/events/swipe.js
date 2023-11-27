import events_type from "./events_type";

class Swipe {
  startPos = { x: 0, y: 0 };
  observer = null;
  pressed = false;
  block = null;
  emulate_touch;

  constructor(block, emulate_touch = false) {
    this.block = block;
    this.emulate_touch = emulate_touch;
  }

  listen_on_events() {
    this.block.addEventListener("touchstart", this.pointer_down.bind(this));
    this.block.addEventListener("touchmove", this.pointer_move.bind(this));
    this.block.addEventListener("touchend", this.pointer_up.bind(this));

    if (!this.emulate_touch) return;

    this.block.addEventListener("mousedown", this.pointer_down.bind(this));
    this.block.addEventListener("mousemove", this.pointer_move.bind(this));
    this.block.addEventListener("mouseup", this.pointer_up.bind(this));
  }

  pointer_move(e) {
    if(e.button !== 0 && e.button !== undefined) return
    if (!this.isPressed) return;
    const distance = this.pointer_pos(e);

    this.observer.emit_event(events_type.swiping, {
      distance: this.swipe_distance(e),
      angle: Math.atan2(Math.abs(this.startPos.x - distance.x), Math.abs(this.startPos.y - distance.y)) * (180 / Math.PI),
    });
  }

  pointer_down(e) {
    if(e.button !== 0&& e.button !== undefined) return

    e.preventDefault();
    this.isPressed = true;
    this.startPos = this.pointer_pos(e);
    this.observer.emit_event(events_type.swipe_start);
  }

  pointer_up(e) {
    if(e.button !== 0&& e.button !== undefined) return

    this.observer.emit_event(events_type.swipe_end, { distance: this.swipe_distance(e) });
    this.isPressed = false;
    this.reset_pos();
  }

  pointer_leave() {
    this.isPressed = false;
    this.reset_pos();
  }
  reset_pos() {
    this.startPos.x = 0;
    this.startPos.y = 0;
  }
  swipe_distance(e) {
    const pos = this.pointer_pos(e);
    return { x: pos.x - this.startPos.x, y: pos.y - this.startPos.y };
  }

  pointer_pos(e) {
    if (e.touches === undefined) {
      return { x: e.clientX, y: e.clientY };
    }

    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
}

export default Swipe;

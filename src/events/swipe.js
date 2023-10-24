import events_type from "./events_type";

class Swipe {
  startX = 0;
  observer = null;
  pressed = false;
  block = null;
  emulate_touch;

  constructor(block, emulate_touch = true) {
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
    if (!this.isPressed) return;
    this.observer.emit_event(events_type.swiping, { distance: this.swipe_distance(e) });
  }

  pointer_down(e) {
    e.preventDefault();
    this.isPressed = true;
    this.startX = this.pointer_pos(e);
    this.observer.emit_event(events_type.swipe_start);
  }

  pointer_up(e) {
    this.observer.emit_event(events_type.swipe_end, { distance: this.swipe_distance(e) });
    this.isPressed = false;
    this.startX = 0;
  }

  pointer_leave() {
    this.isPressed = false;
    this.startX = 0;
  }

  swipe_distance(e) {
    return this.pointer_pos(e) - this.startX;
  }

  pointer_pos(e) {
    if (e.touches === undefined) {
      return e.clientX;
    }

    return e.changedTouches[0].clientX;
  }
}

export default Swipe;

import event_type from "./events_type";
import Basic_event from "./basic_event";

const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
};

class Kinetic_scroll extends Basic_event {
  scroll = 0;
  active_pos = 0;
  touch_active_pos = 0;
  observer = null;
  max_scroll = 0;
  trigered = false;
  desktop_last_wheel_timeout;
  constructor(max_scroll) {
    super();
    this.max_scroll = max_scroll;
  }

  listen_on_events() {
    window.addEventListener("wheel", (e) => {
      if (this.frozen) return;
      clearTimeout(this.desktop_last_wheel_timeout);
      this.observer.emit_event(event_type.wheel, { delta: e.deltaY, mobile: false });
      this.increase = e.deltaY;
      this.trigered = true;

      this.desktop_last_wheel_timeout = setTimeout(() => {
        this.observer.emit_event(event_type.scroll_end);
      }, 100);
    });

    this.observer.add_listener(event_type.swipe_start, () => {
      this.touch_active_pos = this.active_pos;
    });

    this.observer.add_listener(event_type.swiping, (e) => {
      if(Math.abs(e.angle) > 45) return
      this.observer.emit_event(event_type.wheel, { distance: e.distance.y, mobile: true, scroll: this.touch_active_pos - e.distance.y });
      if (this.frozen) return;

      if (this.max_scroll === 0) return;

      if (this.touch_active_pos - e.distance.y < 0) {
        this.active_pos = 0;
        return;
      }
      if (this.touch_active_pos - e.distance.y > this.max_scroll) {
        this.active_pos = this.max_scroll;
        return;
      }
      this.trigered = true;

      this.active_pos = this.touch_active_pos - e.distance.y;

    });

    this.observer.add_listener(event_type.swipe_end, (e) => {

      if(Math.abs(e.angle) > 45) return

      this.observer.emit_event(event_type.scroll_end);
    });
    this.update();
  }
  update() {
    if (this.trigered && Math.round(this.scroll) !== this.active_pos) {
      this.scroll = lerp(this.scroll, this.active_pos, 0.1);
    }
    if (Math.round(this.scroll) !== this.active_pos) {
      this.observer.emit_event(event_type.scrolling, { scroll: this.scroll });
    } else if (this.trigered) {
      this.trigered = false;
    }

    requestAnimationFrame(this.update.bind(this));
  }

  reset() {
    this.active_pos = 0;
    this.scroll = 0;
    this.unfreeze();
  }

  set increase(amount) {
    if (this.frozen) return;
    this.observer.emit_event(event_type.actual_scrolling, { scroll: this.active_pos });
    if (this.max_scroll === 0) return;

    if (this.active_pos + amount < 0) {
      this.active_pos = 0;
      return;
    }

    if (this.active_pos + amount > this.max_scroll) {
      this.active_pos = this.max_scroll;
      return;
    }

    this.active_pos += amount;
  }
}

export default Kinetic_scroll;

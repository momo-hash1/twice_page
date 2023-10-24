import event_type from "./events_type";
import Basic_event from "./basic_event";

const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
};

class Kinetic_scroll extends Basic_event {
  scroll = 0;
  active_pos = 0;
  observer = null;
  max_scroll = 0;
  trigered = false;
  constructor(max_scroll) {
    super();
    
    this.max_scroll = max_scroll;
  }

  listen_on_events() {
    window.addEventListener("wheel", (e) => {
      this.observer.emit_event(event_type.wheel, { delta: e.deltaY });
      this.increase = e.deltaY;
      this.trigered = true;
    });

    this.update();
  }
  update() {
    if (this.trigered && Math.round(this.scroll) !== this.active_pos) {
      this.scroll = lerp(this.scroll, this.active_pos, 0.1);
    }

    if (Math.round(this.scroll) !== this.active_pos) {
      this.observer.emit_event(event_type.scrolling, this.basic_event_params({ scroll: this.scroll }));
    } else if (this.trigered) {
      this.trigered = false;
      this.observer.emit_event(event_type.scroll_end);
    }

    requestAnimationFrame(this.update.bind(this));
  }

  reset() {
    this.active_pos = 0;
    this.scroll = 0;
    this.unfreeze();
  }

  set increase(amount) {
    this.observer.emit_event(event_type.actual_scrolling, this.basic_event_params({ scroll: this.active_pos }));
    if(this.max_scroll === 0 ) return

    if (this.active_pos + amount < 0 ) {
      this.active_pos = 0
      return
    };

    if (this.active_pos + amount > this.max_scroll ) {
      this.active_pos = this.max_scroll
      return
    };

    this.active_pos += amount;
  }
}

export default Kinetic_scroll;

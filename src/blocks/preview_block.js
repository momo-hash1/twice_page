import event_type from "../events/events_type";
import anime, { timeline } from "animejs";

class Preview_block {
  block_node = document.querySelector(".block__next");
  frozen = false;
  scroll = 0;
  direction = 0;
  parent_observer;
  constructor(parent_observer) {
    this.parent_observer = parent_observer;
  }

  disappear = () => {};
  set_direction(animation_way) {
    this.direction = animation_way;
  }

  update(pos) {
    this.scroll += pos;

    clearTimeout(this.frozen_reset);
    this.animate();
    this.choose_changing_property();
  }

  choose_changing_property() {
    if (this.direction < 0) {
      this.change_height();
    } else if (this.direction > 0) {
      this.change_bottom();
    }
  }

  show(direction) {
    if (this.frozen) return;
    this.direction = direction;
    this.animate(this.select_appear_move());
  }

  change_height() {
    this.block_node.style.height = `${this.scroll * 1.5}px`;
  }

  change_bottom() {
    this.block_node.style.bottom = `${this.scroll * 1.5}px`;
  }

  freeze_scroll() {
    return new Promise((resolve) => {
      this.frozen_reset = setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  select_appear_move(direction) {
    if (this.direction < 0) {
      this.block_node.classList.add("block__next_up");
      return { height: [0, window.innerHeight] };
    } else if (this.direction > 0) {
      this.block_node.classList.add("block__next_down");
      return { bottom: [0, window.innerHeight] };
    }
  }

  animate(appear_move) {
    const _timeline = anime.timeline({
      duration: 800,
      easing: "easeInOutQuart",

    })
    
    // const animation = anime({ targets: this.block_node, duration: 500, easing: "linear", ...appear_move });
    _timeline.add({targets: this.block_node, ...appear_move, complete: () => {
      this.parent_observer.emit_event(event_type.preview_transition);

    }},)
    if (this.direction > 0) {
      _timeline.add({targets: this.block_node, bottom: window.innerHeight * 2})
    } else {
      _timeline.add({targets: this.block_node, top: window.innerHeight})

    }
    this.frozen = true;
    _timeline.finished.then(() => {
      this.frozen = false;
      this.reset();
    });
  }
  hide_preview_block() {
    setTimeout(() => {
      if (this.direction > 0) {
        this.block_node.style.bottom = `${window.innerHeight * 2}px`;
      } else {
        this.block_node.style.top = `${window.innerHeight}px`;
      }
      this.parent_observer.emit_event(event_type.preview_transition);
      setTimeout(this.reset.bind(this), 500);
    }, 500);
  }
  reset() {
    this.block_node.classList.remove("block__next_up", "block__next_down");
    this.block_node.removeAttribute("style");
    this.reached_boundry = false;

    this.scroll = 0;
  }
  animate_above_middle() {
    this.block_node.style.bottom = `${window.innerHeight}px `;
  }
  animate_below_middle() {
    this.block_node.style.height = `${window.innerHeight}px `;
  }
}

export default Preview_block;

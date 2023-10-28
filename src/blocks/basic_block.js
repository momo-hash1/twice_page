import Kinetic_scroll from "../events/kinetic_scroll";
import Event_observer from "../events/event_observer";
import event_type from "../events/events_type";
import anime from "animejs";
import Swipe from "../events/swipe";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Basic_block {
  locked = false;
  reached_boundry = false;
  active = false;
  scroll = 0;
  events = new Event_observer();
  boundry_element;
  parent_observer;
  block_content;
  block_node;
  height;
  id;

  constructor(block_el, parent_observer, id) {
    this.block_node = block_el;

    this.block_node.style.height = `${window.innerHeight}px`;

    this.block_content = block_el.querySelector(".block__content");
    this.id = id;
    this.parent_observer = parent_observer;
    this.height = this.block_content.getBoundingClientRect().height - window.innerHeight;

    this.block_node.style.display = "none";

    this.events.new_event(new Kinetic_scroll(this.height));
    this.events.new_event(new Swipe(this.block_node));
    this.events.add_listener(event_type.scrolling, (e) => {
      
      if (!this.active) return;
      this.update_scroll(e.scroll);
    });

    this.events.add_listener(event_type.scroll_end, (e) => {
      if (!this.boundry_element) return;
      if (this.reached_boundry === null) {
        return;
      }
      if (this.reached_boundry !== this.boundry_element) return;
      this.events.freeze_event(Kinetic_scroll);
      anime({
        targets: this.block_content,
        duration: 150,
        easing: "easeInQuint",
        scaleY: [clamp(1 + Math.abs(this.scroll) / window.innerHeight, 1, 1.2), 1],
      }).finished.then(() => {
        this.active = true;
        this.scroll = this.events.event_list[0].scroll;
        this.locked = false
        this.show()
        this.events.unfreeze_event(Kinetic_scroll);
        this.events.mute_subscriber(event_type.wheel, "animate_boundry_indicator");
        this.events.unmute_subscriber(event_type.wheel, "checking_boundry");
      });
    });

    this.events.add_listener_with_id(event_type.wheel, "checking_boundry", (e) => {
      if (this.locked) return;

      if (e.mobile) {
        this.checking_boundries(-e.distance);
      } else {
        this.checking_boundries(e.delta);
      }
      if (this.reached_boundry === null) {
        return;
      }

      if (!this.boundry_element) return;
      if (this.reached_boundry !== this.boundry_element) return;
      this.active = false;
      this.events.mute_subscriber(event_type.wheel, "checking_boundry");
      this.events.unmute_subscriber(event_type.wheel, "animate_boundry_indicator");
    });

    this.events.add_listener_with_id(event_type.wheel, "animate_boundry_indicator", (e) => {
      if (e.mobile) {
        this.scroll = -e.scroll;
      } else {
        this.scroll += e.delta;
      }
      this.animate_boundry_block();
    });
    
    this.events.mute_subscriber(event_type.wheel, "animate_boundry_indicator");
  }

  show(){

  }

  hide(){}

  checking_boundries(direction) {
    if (!this.active) return;

    if (Math.ceil(this.scroll) >= this.height && direction > 0) {
      this.parent_observer.emit_event(event_type.reached_end, { block_id: this.id });
      this.block_content.style.transformOrigin = "bottom";
      this.reached_boundry = "end";
    } else if (this.scroll < 1 && direction < 0) {
      this.parent_observer.emit_event(event_type.reached_start, { block_id: this.id });
      this.reached_boundry = "start";
      this.block_content.style.transformOrigin = "top";
    } else {
      this.reached_boundry = null;
    }
  }
  update_scroll(pos) {
    this.scroll = pos;

    if (this.reached_boundry !== null) return;

    if (this.scroll < 1) {
      this.scroll = 0;
    }
    this.block_content.style.top = `${-this.scroll}px`;
  }

  animate_boundry_block() {
    this.block_content.style.transform = `scaleY(${clamp(1 + Math.abs(this.scroll) / window.innerHeight, 1, 1.2)})`;
  }
  reset() {
    this.block_content.removeAttribute("style");
    this.reached_boundry = null;
    this.events.event_list[0].reset();
  }
}

export default Basic_block;

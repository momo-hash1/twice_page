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

      }

  show(){

  }

  hide(){}
}

export default Basic_block;

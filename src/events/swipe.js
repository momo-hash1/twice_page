import events_type from "./events_type";

class Swipe {
  startPos = { x: 0, y: 0 };
  observer = null;
  pressed = false;
  block = null;
  emulate_touch;
}

export default Swipe;

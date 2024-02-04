import event_type from "./events_type";
import Basic_event from "./basic_event";

const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
};

class Kinetic_scroll extends Basic_event {

}

export default Kinetic_scroll;

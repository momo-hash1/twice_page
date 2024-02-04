import Event_observer from "../events/event_observer";
import Kinetic_scroll from "../events/kinetic_scroll";
import Carousel from "../fancy_carousel/carousel";
import Basic_block from "./basic_block";
import Preview_block from "./preview_block";
import event_type from "../events/events_type";

class Super_block {
  list_of_blocks = [];
  events = new Event_observer();
  special_blocks = { preview_block: new Preview_block(this.events) };
  current_block = null;
  current_block_id = 0;

  init(){
    
  }
}

export default Super_block;

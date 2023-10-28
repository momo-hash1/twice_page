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

  init() {
    this.is_user_has_touch();
    this.findAllBlocks();
    this.add_event_listener();
    this.set_block_action();
    this.current_block = this.get_current_block();
  }

  set_block_action(block, id) {
    if (block === undefined) return;
    const block_action = block.dataset.blockAction;
    const block_action_list = {
      carousel: Carousel,
      basic: Basic_block,
    };
    block_action_list[block_action] = new block_action_list[block_action](block, this.events, id);
    return block_action_list[block_action];
  }

  findAllBlocks() {
    const list_blocks = document.querySelectorAll(".block");
    list_blocks.forEach((block, index) => {
      const basic_block = this.set_block_action(block, index);
      if (index === list_blocks.length - 1){
        basic_block.boundry_element = "end"
      }
      if(index === 0){
        basic_block.boundry_element = "start"
      }
      this.list_of_blocks.push(basic_block);
    });
    this.events.new_event(new Kinetic_scroll(window));
    list_blocks[0].style.display = "block";
    this.list_of_blocks[0].active = true;
    this.list_of_blocks[0].show()
    
  }

  is_user_has_touch() {
    return window.matchMedia("(any-pointer: coarse)").matches;
  }

  can_slide_next(block_id) {
    return block_id + 1 < this.list_of_blocks.length;
  }
  can_slide_prev(block_id) {
    return block_id > 0;
  }

  preview_block_disappear(preview_block) {
    const block_boundry = preview_block.direction;
    let future_block_id = null;
    if (block_boundry > 0) {
      future_block_id = this.current_block_id + 1;
    } else if (block_boundry < 0) {
      future_block_id = this.current_block_id - 1;
    }
    if (future_block_id >= 0 && future_block_id < this.list_of_blocks.length) {
      
      this.current_block.active = false;
      this.current_block_id = future_block_id;
      this.current_block.hide()
      this.current_block = this.get_current_block();
      
      this.current_block.reset();
      this.current_block.locked = false
      this.current_block.active = true
      this.show_block(future_block_id);
    }
  }

  get_current_block() {
    return this.list_of_blocks[this.current_block_id];
  }

  add_event_listener() {
    this.events.add_listener(event_type.reached_end, (e) => {
      
      if (this.can_slide_next(this.current_block_id)) {
        this.show_preview_block(100);
        this.current_block.locked = true
        return
      }

    });
    
    this.events.add_listener(event_type.reached_start, (e) => {
      
      if (this.can_slide_prev(this.current_block_id)) {
        this.show_preview_block(-100);
        this.current_block.locked = true
        return
      }
    });

    this.events.add_listener(event_type.preview_transition, () => {
      this.preview_block_disappear(this.special_blocks.preview_block);
      this.current_block.events.unfreeze_event(Kinetic_scroll)

    });
    this.events.add_listener(event_type.preview_transition_disappear, () => {
      this.current_block.locked = false
      this.current_block.show()
    });

  }

  show_preview_block(delta) {
    const preview_block = this.special_blocks.preview_block;
    preview_block.direction = delta
    preview_block.show();
  }

  show_block(block_id) {
    this.list_of_blocks.forEach((block, index) => {
      if (index !== block_id) {
        block.block_node.style.display = "none";
        return;
      }
      block.block_node.style.display = "block";
    });
  }
}

export default Super_block;

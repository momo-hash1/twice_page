class Event_observer {
  subscribes = {};
  event_list = [];
  constructor(event_list = []) {
    event_list.forEach((event) => {
      this.initEvent(event);
    });
  }
  new_event(event) {
    this.initEvent(event);
    this.event_list.push(event);
  }

  initEvent(event) {
    event.observer = this;
    event.listen_on_events();
  }

  freeze_event(event){
    this.find_target_event(event).freeze()
  }

  unfreeze_event(event){
    this.find_target_event(event).unfreeze()
  }

  find_target_event(event){
    return this.event_list.find(x => x instanceof event)
  }

  add_listener(event_type, listener_function) {
    if (this.subscribes[event_type] === undefined) {
      this.subscribes[event_type] = [];
    }
    this.subscribes[event_type].push(listener_function);
  }

  emit_event(event_type, event_detail = {}) {
    if (this.subscribes[event_type] === undefined) return;
    this.subscribes[event_type].forEach((listener) => {
      listener(event_detail);
    });
  }
}

export default Event_observer;

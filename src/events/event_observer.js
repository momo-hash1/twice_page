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

  freeze_event(event) {
    this.find_target_event(event).freeze();
  }

  unfreeze_event(event) {
    this.find_target_event(event).unfreeze();
  }

  find_target_event(event) {
    return this.event_list.find((x) => x instanceof event);
  }

  add_listener(event_type, listener_function) {
    if (this.subscribes[event_type] === undefined) {
      this.subscribes[event_type] = [];
    }
    this.subscribes[event_type].push({ fun: listener_function, id: null, mute: false });
  }

  add_listener_with_id(event_type, event_id, listener_function) {
    if (this.subscribes[event_type] === undefined) {
      this.subscribes[event_type] = [];
    }
    this.subscribes[event_type].push({ fun: listener_function, id: event_id, mute: false });
  }

  mute_subscriber(event, subscriber_id) {
    const subscriber = this.subscribes[event].find((x) => x.id === subscriber_id);
    subscriber.mute = true;
  }

  unmute_subscriber(event, subscriber_id) {
    const subscriber = this.subscribes[event].find((x) => x.id === subscriber_id);
    subscriber.mute = false;
  }
  
  emit_event(event_type, event_detail = {}) {
    if (this.subscribes[event_type] === undefined) return;
    this.subscribes[event_type].forEach((listener) => {
      if (listener.mute) return;
      listener.fun(event_detail);
    });
  }
}

export default Event_observer;

class Basic_event {
  frozen = false;

  freeze() {
    this.frozen = true;
  }

  unfreeze() {
    this.frozen = false;
  }

  reset() {}

  basic_event_params(params) {
    return { ...params, reset: this.reset.bind(this), freeze: this.freeze.bind(this), unfreeze: this.unfreeze.bind(this) };
  }
}

export default Basic_event
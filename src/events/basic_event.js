class Basic_event {
  frozen = false;

  freeze() {
    this.frozen = true;
  }

  unfreeze() {
    this.frozen = false;
  }

  reset() {}

}

export default Basic_event
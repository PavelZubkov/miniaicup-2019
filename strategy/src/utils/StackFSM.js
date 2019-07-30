class StackFSM {
  constructor() {
    this._stack = [];
  }

  update() {
    const currentStateClass = this.getCurrentState();

    if (currentStateClass != null) {
      currentStateClass.update();
    }
  }

  popState() {
    return this._stack.pop();
  }

  pushState(state) {
    if (this.getCurrentState() !== state) {
      this._stack.push(state);
    }
  }

  getCurrentState() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }
}

module.exports = StackFSM;

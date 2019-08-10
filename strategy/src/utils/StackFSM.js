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
    const state = this._stack.pop();
    return state;
  }

  pushState(state, instantUpdate = true) {
    if (this.getCurrentState() !== state) {
      this._stack.push(state);
      instantUpdate && this.update();
    }
  }

  getCurrentState() {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }
}

module.exports = StackFSM;

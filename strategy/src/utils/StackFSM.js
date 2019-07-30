class StackFSM {
  constructor() {
    this._stack = [];
  }

  update() {
    const currentStateFunction = this.getCurrentState();

    if (currentStateFunction != null) {
      currentStateFunction();
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

class BubbleControl {
  cacheMap = {};
  listenerMap = {};

  start(data) {
    const { id, toggleRender } = data;
    let item
    if (this.cacheMap[id]) {
      item = this.cacheMap[id];
    } else {
      this.cacheMap[id] = id;
      toggleRender(id, true)
    }
  }

  stop(data) {
    const { id, toggleRender } = data;
    if (this.cacheMap[id]) {
      const item = this.cacheMap[id];
      toggleRender(id, false)
    }
  }
}

export default new BubbleControl();

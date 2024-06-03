class SpriteController {
  cacheMap = {};
  idx = 0;

  enter(data) {
    const { id, startTime, endTime, time, endState, startState, sprite } = data;
    if (this.cacheMap[id]) {
      try {
        const pos = this._getPosition(startState || {x: 0, y: 0}, endState || {x: 0, y: 0}, endTime, startTime, time - startTime);
        sprite.attr('pos', pos);
      } catch (error) {
        console.error(`Type 1 error: ${error.message}. Triggered by value: ${data}, ${startState}, ${endState}, ${time - startTime}, ${sprite}`);
      }
    } else {
      try {        
       sprite.attr('pos', [0, 0]);
       this.cacheMap[id] = sprite;
      } catch (error) {
        console.error(`Type 2 error: ${error.message}. Triggered by value: ${data}, ${startState}, ${endState}, ${startTime}, ${endTime}, ${time - startTime}`);
      }
    }
  }

  update(data) {
    const { id, startTime, endTime, time, endState, startState, sprites, type } = data;
    const sprite = this.cacheMap[id];
    if (!sprite) return;
    try {
      sprite.attr('pos', this._getPosition(startState || {x: 0, y: 0}, endState || {x: 0, y: 0}, endTime, startTime, time - startTime));
      sprite.attr('texture', this._getTexture(sprites, time));
    } catch (error) {
      console.error(`Type 3 error: ${error.message}. Triggered by value: ${data}, ${startState}, ${endState}, ${endTime}, ${startTime}, ${time - startTime}`);
    }
  }

  leave(data) {
    const { id, endState } = data;
    const sprite = this.cacheMap[id];
    if (!sprite) return;
    try {
      sprite.attr('pos', [-1000, -1000]);
      //this.destroy()
    } catch (error) {
      console.error(`Type 4 error: ${error.message}. Triggered by value: ${data}, ${endState}`);
    }
  }

  _getTexture(sprites, time) {
    return sprites[parseInt(time * 7.5) % sprites.length];
  }

  _getPosition(startState, endState, endTime, startTime, elapsedTime) {
    const duration = endTime - startTime;
    const progress = Math.min(1, elapsedTime / duration);
    const x = startState.x + progress * (endState.x - startState.x);
    const y = startState.y + progress * (endState.y - startState.y);
    return [x, y];
  }

  destroy() {
    this.cacheMap = {};
  }
}

export default new SpriteController();

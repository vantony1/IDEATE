import { Howl } from 'howler';

class AudioControl {
  cacheMap = {};
  listenerMap = {};

  start(data) {
    const { id, src, startTime, time, engine, loop = true, volume = 0.25, ext = 'mp3' } = data;
    let item;
    if (this.cacheMap[id]) {
      item = this.cacheMap[id];
      item.rate(engine.getPlayRate());
      item.seek((time - startTime) % item.duration());
      item.volume(volume);
      item.play();
    } else {
      item = new Howl({ src, loop: loop, autoplay: true, volume: volume, format: ext });
      this.cacheMap[id] = item;
      item.on('load', () => {
        item.rate(engine.getPlayRate());
        item.seek((time - startTime) % item.duration());
      });
    }

    const timeListener = (data) => {
      const { time } = data;
      item.seek(time);
    };
    const rateListener = (data) => {
      const { rate } = data;
      item.rate(rate);
    };
    if (!this.listenerMap[id]) this.listenerMap[id] = {};
    engine.on('afterSetTime', timeListener);
    engine.on('afterSetPlayRate', rateListener);
    this.listenerMap[id].time = timeListener;
    this.listenerMap[id].rate = rateListener;
  }

  stop(data) {
    const { id, engine } = data;
    if (this.cacheMap[id]) {
      const item = this.cacheMap[id];
      item.stop();
      if (this.listenerMap[id]) {
        this.listenerMap[id].time && engine.off('afterSetTime', this.listenerMap[id].time);
        this.listenerMap[id].rate && engine.off('afterSetPlayRate', this.listenerMap[id].rate);
        delete this.listenerMap[id];
      }
    }
  }
}

export default new AudioControl();

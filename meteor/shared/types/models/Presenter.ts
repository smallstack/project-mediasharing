
/// <reference path="../generated/models/GeneratedPresenter.ts" />

class Presenter extends GeneratedPresenter {

    public next() {
        this.mediaQueueIds.shift();
        this.update();
    }

    public stop() {
        this.mediaQueueIds = [];
        this.update();
    }

    public increaseVolume() {
        this.volume += 10;
        if (this.volume > 100)
            this.volume = 100;
        this.update();
    }

    public decreaseVolume() {
        this.volume -= 10;
        if (this.volume < 0)
            this.volume = 0;
        this.update();
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        this.update();
    }
}
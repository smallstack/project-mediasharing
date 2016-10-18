/// <reference path="../../../../typedefinitions/generated.d.ts" />

/// <reference path="IMediaPlugin.ts" />
/// <reference path="BasePlugin.ts" />
/// <reference path="../../generated/models/GeneratedSharedMedia.ts" />

declare var YT: any;

class YoutubePlugin extends BasePlugin implements IMediaPlugin {

    public name: string = "Youtube";
    public player: any;
    public playerObject: any;

    public canHandle(sharedMedia: SharedMedia): boolean {
        return this.getVideoId(sharedMedia.url, true) !== undefined;
    }


    public getThumbnailUrl(sharedMedia: SharedMedia, hideErrors?: boolean): string {
        if (hideErrors === undefined)
            hideErrors = false;
        return "https://img.youtube.com/vi/" + this.getVideoId(sharedMedia.url, hideErrors) + "/1.jpg"
    };


    public getVideoId(url: string, hideErrors?: boolean) {
        if (hideErrors === undefined)
            hideErrors = false;
        if (typeof url === 'string') {
            // filter video id
            if (url.indexOf("v=") != -1) {
                return this.utils.getUrlParameterByName("v", url);
            } else if (url.indexOf("youtu.be/") != -1) {
                return url.substring(url.indexOf("youtu.be/") + "youtu.be/".length, url.indexOf("?"));
            }
        }
        if (!hideErrors)
            console.error("Could not get youtube video id from this url : ", url);
        return undefined;
    }

    public getTitle(sharedMedia: SharedMedia, callback: Function) {
        HTTP.get("https://gdata.youtube.com/feeds/api/videos/" + this.getVideoId(sharedMedia.url), {
            params: {
                v: 2,
                alt: "json"
            }
        }, function(error, result) {
            if (error) {
                callback(error);
            } else {
                var title = result.data.entry.title.$t;
                callback(undefined, title);
            }
        });
    }


    public play(sharedMedia: SharedMedia): void {
        super.play(sharedMedia);
        console.log("Youtube Plugin playing : ", sharedMedia);
        
        // queue in video
        this.player.cueVideoById({
            videoId: this.getVideoId(sharedMedia.url)
        });
            
        // set volume
        this.player.setVolume(this.getPresenter().volume);

        // go go go 
        this.showYoutubePlayer();
        this.playerObject.playVideo();
    }

    public pause() {
        console.error("Pausing Youtube is not implemented yet!");
    }

    public stop() {
        this.playerObject.stopVideo();
        this.hideYoutubePlayer();
    }

    public initialize(callback: Function) {
        var that = this;
        window["onYouTubeIframeAPIReady"] = function() {
            console.log("initializing youtube player...");
            that.player = new YT.Player("player", {
                events: {
                    onReady: function(event) {
                        that.playerObject = event.target;
                        console.log("youtube player ready...");
                        callback(undefined, true);
                    },
                    onStateChange: function(event) {
                        console.log("state changed : ", event.data);
                        switch (event.data) {
                            case 0:
                                that.stop();
                                break;
                        }
                    },
                    onError: function(event) {
                        console.error("an error occured : ", event);
                        that.stop();
                    }
                }
            });
        };
        YT.load();
    }

    public showYoutubePlayer(): void {
        $("#player").fadeIn(300);
    }

    public hideYoutubePlayer(): void {
        $("#player").fadeOut(300);
    }

    public onPresenterUpdate(presenter: Presenter) {
        this.player.setVolume(presenter.volume);
        if (presenter.isMuted)
            this.player.mute();
        else
            this.player.unMute();

    }
}

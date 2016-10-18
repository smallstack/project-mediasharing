/// <reference path="../../../typedefinitions/generated.d.ts" />
/// <reference path="../../../shared/types/models/plugins/IMediaPlugin.ts" />
/// <reference path="../../../shared/types/models/plugins/YoutubePlugin.ts" />


smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setControllerName("PresenterController")
    .setRoute("/presenter")
    .setLabel("Presenter")
    .setRequiresAuthentication(false)
    .setTemplateUrl("client/views/presenter/presenter.ng.html")
    .setVisible(false)
    .setStateName("presenter")
);


interface PresenterScope extends ng.IScope {
    vm: PresenterController;
    presenter: Presenter;
    currentPlugin: IMediaPlugin;
    hash: string;
    isRegistering: boolean;
    pluginsRegistered: boolean;
    staticWebsiteUrl: string;
}



class PresenterController {

    private plugins: IMediaPlugin[];
    private staticWebsiteIntervaller: any;

    static $inject = ["$scope", "$sce", "presenterService", "notificationService", "$rootScope", "cookieService", "sharedMediaService"];
    constructor(private $scope: PresenterScope, private $sce: ng.ISCEService, private presenterService: PresenterService, private notificationService: NotificationService,
        $rootScope: ng.IRootScopeService, private cookieService: CookieService, private $meteor: any, private sharedMediaService: SharedMediaService) {

        $scope.vm = this;

        // view options / states
        $scope.isRegistering = false;
        $scope.pluginsRegistered = false;

        // DO some work
        this.initializePresenter();
    }

    private initializePresenter(): void {
        console.log("initializing presenter...");

        var that = this;

        // read in hash cookie and get the presenter object
        this.$scope.hash = this.cookieService.get("presenterHash");
        console.log("hash cookie found : ", this.$scope.hash);
        if (this.$scope.hash === undefined) {
            this.registerPresenter();
        } else {
            this.observePresenter(this.$scope.hash);
        }
    }

    public registerPresenter() {
        console.log("register presenter...");

        var that = this;
        if (!this.$scope.isRegistering) {
            this.$scope.isRegistering = true;
            this.presenterService.registerPresenter(function (error: Meteor.Error, presenter: Presenter) {
                if (error) {
                    that.notificationService.popup.error("Could not register new presenter : " + error.reason);
                }
                else {
                    that.$scope.presenter = presenter;
                    _.each(that.plugins, function (plugin: IMediaPlugin) {
                        plugin.stop();
                        plugin.setPresenterId(presenter.id);
                    });
                    that.$scope.hash = presenter.hash;
                    that.cookieService.set("presenterHash", presenter.hash, { expires: 365 });
                    console.log("registered new presenter : ", presenter);
                    that.observePresenter(presenter.hash);
                }
                that.$scope.isRegistering = false;
                that.$scope.$apply();
            });
        }
    }

    private observePresenter(presenterHash: string) {
        console.log("observe presenter with hash: ", presenterHash);
        // subscribe
        this.presenterService.getPresentersByHash({ hash: this.$scope.hash }).subscribe((cursor) => {
            Tracker.autorun(() => {
                let presenter = cursor.fetch()[0];
                if (presenter) {
                    console.log("got meteor update for presenter!", presenter);

                    // if e.g. presenter got refreshed while playing or 
                    if (!this.presenterIsLocallyPlaying() && this.$scope.currentPlugin !== undefined) {
                        this.$scope.currentPlugin = undefined;
                        console.warn("set this.$scope.currentPlugin = undefined;");
                    }

                    // let current plugin know
                    if (this.$scope.currentPlugin !== undefined)
                        this.$scope.currentPlugin.onPresenterUpdate(presenter);

                    this.$scope.presenter = presenter;
                    this.initializeMediaPlugins(presenter);

                    // set static website url
                    if (presenter.staticWebsite !== undefined) {
                        this.$scope.staticWebsiteUrl = this.$sce.trustAsResourceUrl(presenter.staticWebsite);
                        if (this.staticWebsiteIntervaller !== undefined)
                            clearInterval(this.staticWebsiteIntervaller);
                        if (presenter.staticWebsiteRefreshInterval !== undefined && presenter.staticWebsiteRefreshInterval !== 0) {
                            this.staticWebsiteIntervaller = setInterval(function () {
                                var iFrame = $("#staticWebsiteContainer");
                                iFrame.attr("src", iFrame.attr("src"));
                                console.log("website refreshed!");
                            }, (presenter.staticWebsiteRefreshInterval * 1000 * 60));
                        }
                    }
                    else {
                        this.$scope.staticWebsiteUrl = undefined;
                    }

                    this.$scope.$apply();
                }
                else {
                    console.log("Seems like hash is invalid, re-generating presenter!");
                    this.registerPresenter();
                }
            });
        });



        // that.$scope.$meteorAutorun(function() {
        //     that.$scope.$meteorSubscribe("presentersByHash", { hash: that.$scope.hash }).then(function() {
        //         that.$scope.presenter = that.$scope.$meteorObject(PresentersCollection.getMongoCollection(), { hash: that.$scope.hash }, false);
        //         console.log("observe presenter found this presenter : ", that.$scope.presenter);

        //         if (that.$scope.presenter !== undefined) {
        //             that.initializeMediaPlugins();
        //         }
        //         else {
        //         }
        //     });
        // });

        // // check if presenter is still alive
        // that.$scope.$watch("presenter.id", function() {
        //     if (that.$scope.presenter === undefined || that.$scope.presenter.id === undefined)
        //         that.registerPresenter();
        // });

        setInterval(function () {
            if (this.$scope.presenter)
                this.presenterService.sendKeepAlive(this.$scope.presenter.id);
        }, 10000);
    }

    private initializeMediaPlugins(presenter: Presenter) {
        var that = this;
        if (!this.$scope.pluginsRegistered) {

            // initialize plugins
            var initializedPluginCount = 0;
            this.plugins = [];
            this.plugins.push(new YoutubePlugin(presenter.id));

            // call initialize method of plugins
            _.each(this.plugins, function (plugin: IMediaPlugin) {
                console.log("PLUGINS : Initializing Plugin : " + plugin.name);
                plugin.initialize(function (error: Meteor.Error, result: boolean) {
                    if (error) that.notificationService.notification.error("Error while initializing Plugin : " + plugin.name);
                    else {
                        console.log("PLUGINS : Initialized : " + plugin.name + " with success = " + result);
                        if (result) {
                            initializedPluginCount++;

                            if (initializedPluginCount === that.plugins.length) {
                                that.startPlayback();
                                that.$scope.pluginsRegistered = true;
                            }
                        }
                    }
                });
            });
        }
        else {
            that.startPlayback();
        }
    }

    private startPlayback() {
        console.log("startPlayback()!");
        if (this.$scope.presenter === undefined || this.$scope.presenter.mediaQueueIds === undefined) {
            console.log("oops, presenter not yet registered...");
        }
        else {
            var that = this;
            that.playNext();
            this.$scope.$watch("presenter.mediaQueueIds", function (newVal: string[], oldVal: string[]) {
                if (newVal !== undefined) {
                    console.log("update!", newVal, oldVal);
                    var force = oldVal !== undefined && newVal.length < oldVal.length;
                    that.playNext(force);
                }
            }, true);
        }
    }

    private playNext(force?: boolean) {
        console.log("playing next media...");
        if (this.$scope.presenter === undefined || this.$scope.presenter.mediaQueueIds === undefined || this.$scope.presenter.mediaQueueIds.length === 0) {
            console.log("There are no further videos to play, aborting...");
            this.stopCurrent();
        }
        else {
            if (force) {
                this.stopCurrent();
            }

            this.play(this.$scope.presenter.mediaQueueIds[0]);
        }
    }

    private presenterIsLocallyPlaying(): boolean {
        return this.$scope.currentPlugin !== undefined;
    }

    private play(mediaId: string) {
        var that = this;
        console.log("play media : ", mediaId);
        // TODO : MEDIA-16
        // this.sharedMediaService.getSharedMediaById(mediaId, function(error: Meteor.Error, media: SharedMedia) {
        //     media.url
        // });

        if (!this.presenterIsLocallyPlaying()) {
            var query: QueryObject<SharedMedia> = smallstack.ioc.get<SharedMediaService>("sharedMediaService").getSharedMediaById({ id: mediaId });
            query.subscribe(() => {
                var media: SharedMedia = query.val(0);
                if (media === undefined) {
                    that.notificationService.notification.error("Could not load media with id : " + mediaId);
                    // that.$scope.presenter.mediaQueueIds.shift();
                    // that.$scope.presenter.currentMedia = undefined;
                    // that.presenterService.updatePresenter(Presenter.fromDocument(that.$scope.presenter));
                }
                else {
                    var plugin: IMediaPlugin = that.getPluginForMedia(media);
                    if (plugin !== undefined) {
                        that.$scope.currentPlugin = plugin;
                        plugin.play(media);
                    }
                    else {
                        that.notificationService.notification.error("No Plugin found for media with id : " + mediaId);
                        that.$scope.presenter.mediaQueueIds.shift();
                        that.presenterService.updatePresenter(Presenter.fromDocument(that.$scope.presenter));
                    }
                }
            });
        }
        else console.warn("Presenter currently occupied!");
    }

    private getPluginForMedia(sharedMedia: SharedMedia): IMediaPlugin {
        for (var p = 0; p < this.plugins.length; p++) {
            if (this.plugins[p].canHandle(sharedMedia)) {
                return this.plugins[p];
            }
        }
        this.notificationService.notification.error("Could not find Plugin for url : " + sharedMedia.url);
        return undefined;
    }

    private stopCurrent() {
        console.log("stopping current!");
        if (this.$scope.currentPlugin !== undefined)
            this.$scope.currentPlugin.stop();
        this.$scope.currentPlugin = undefined;
    }

    private updatePresenter() {
        this.presenterService.updatePresenter(Presenter.fromDocument(this.$scope.presenter));
    }
    public showFullscreenIcon(iconName: string, additionalContent: string): void {
        if (additionalContent !== undefined)
            $("#notificationAdditionalContent").text(additionalContent);
        else
            $("#notificationAdditionalContent").text("");

        $("#notificationContent").hide();
        $("#notificationIcon").removeClass();
        $("#notificationIcon").addClass("massive white " + iconName + " icon");
        $("#notificationContent").fadeIn(300, function () {
            $("#notificationContent").fadeOut(1000);
        });
    }

    public openConfigurationPanel() {
        (<any>$('#configurationModal')).modal();
    }

}

smallstack.angular.app.controller("PresenterController", PresenterController);

// private executePresenterEvents() {
//     var executePresenterEvents = function(events) {
//         console.log("executing events : ", events);
//         _.each(events, function(event) {
//             try {
//                 switch (event) {
// case "stop":
//     this.player.stopVideo();
//     this.isPlaying = false;
//     Meteor.call("removePresenterStatus", Session.get("presenterToken"));
//     this.removeFirstElementFromMediaQueue();
//     this.hidePlayer();
//     this.showFullscreenIcon("stop");
//     break;
// case "play":
//     this.player.playVideo();
//     this.player.setPlaybackRate(1);
//     this.showFullscreenIcon("play");
//     break;
// case "pause":
//     this.player.pauseVideo();
//     this.showFullscreenIcon("pause");
//     break;
// case "volumeup":
//     var volume = this.player.getVolume() + 10;
//     if (volume > 100)
//         volume = 100;
//     this.player.setVolume(volume);
//     this.showFullscreenIcon("volume up", volume + "%");
//     break;
// case "volumedown":
//     var volume = this.player.getVolume() - 10;
//     if (volume < 0)
//         volume = 0;
//     this.player.setVolume(volume);
//     this.showFullscreenIcon("volume down", volume + "%");
//     break;
// case "mute":
//     if (this.player.isMuted())
//         this.player.unMute();
//     else
//         this.player.mute();
//     this.showFullscreenIcon("volume off", "0%");
//     break;
// case "faster":
//     var playrate = this.player.getPlaybackRate();
//     var playrates = this.player.getAvailablePlaybackRates();
//     var playrateIndex = _.indexOf(playrates, playrate);
//     var newPlayrateIndex = playrateIndex + 1;
//     if (newPlayrateIndex < playrates.length && playrates[newPlayrateIndex] !== undefined) {
//         this.player.setPlaybackRate(playrates[newPlayrateIndex]);
//         this.showFullscreenIcon("angle double right", playrates[newPlayrateIndex] + "x");
//     }
//     break;
// case "slower":
//     var playrate = this.player.getPlaybackRate();
//     var playrates = this.player.getAvailablePlaybackRates();
//     var playrateIndex = _.indexOf(playrates, playrate);
//     var newPlayrateIndex = playrateIndex - 1;
//     if (newPlayrateIndex >= 0 && playrates[newPlayrateIndex] !== undefined) {
//         this.player.setPlaybackRate(playrates[newPlayrateIndex]);
//         this.showFullscreenIcon("angle double left", playrates[newPlayrateIndex] + "x");
//     }
//     break;
//                     }
//                 } catch (e) {
//                     console.error("could not execute presenter control event : ", e);
//                 }
//             });
//             Meteor.call("clearPresenterEvents", Session.get("presenterToken"));
//         }
//     }

// }


// Template.presenter.onRendered(function() {

//     var this = Template.this();

//     // observe the presenter
//     var startObservingPresenterEvents = function() {


//         Collections.presenters.find({
//             name: Session.get("presenterToken")
//         }).observe({
//             "added": function(presenter) {
//                 executePresenterEvents(presenter.controlEvents);
//             },
//             "changed": function(presenter) {
//                 executePresenterEvents(presenter.controlEvents);
//             }
//         });
//     };




//
//
//    // the play method
//    this.playNextSharedMedia = function (force) {
//        if (this.presenterAutoPlay) {
//            if (force == undefined)
//                force = false;
//
//            if (this.player == undefined || this.player.cueVideoById == undefined) {
//                console.error("player is still undefined...");
//            } else {
//                // if force, stop current media
//                if (force && this.currentSharedMedia) {
//                    this.currentSharedMedia.stop(this);
//                }
//
//                _.each(this.sortedSharedMedias, function (media) {
//                    if (!media.alreadyWatched(this.presenterToken)) {
//                        media.play(this);
//                    };
//                });
//            }
//        }
//    }
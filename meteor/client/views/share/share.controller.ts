/// <reference path="../../../typedefinitions/generated.d.ts" />

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setLabel("navigation.sharemedia")
    .setRoute("/share")
    .setTemplateUrl("client/views/share/share.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("ShareController")
    .setIndex(10)
    .setStateName("website.share")
    .setType("main")
);


interface IShareScope extends ng.IScope {
    vm: ShareController;
    newSharedMediaUrl: string;
    currentGroupId: string;
    currentGroup: Group;
    groups: Group[];
    presenters: Presenter[];
    $meteorAutorun: Function;
    sharedMedias: SharedMedia[];
}


class ShareController {

    static $inject = ["$scope", "sharedMediaService", "notificationService", "groupsService", "cookieService", "presenterService", "$timeout"];
    constructor(private $scope: IShareScope, private sharedMediaService: SharedMediaService, private notificationService: NotificationService, private groupsService: GroupsService, private cookieService: CookieService, private presenterService: PresenterService, private $timeout: angular.ITimeoutService) {
        $scope.vm = this;

        // get my groups
        var groupsQuery: QueryObject<Group> = groupsService.getMyGroups({});
        groupsQuery.subscribe(() => {
            this.$timeout(() => {
                this.$scope.groups = groupsQuery.val();
            })
        });


        // set and watch current group and save it as cookie
        $scope.currentGroupId = cookieService.get("currentGroupId");
        $scope.$watch("currentGroupId", () => {
            if ($scope.currentGroupId !== undefined) {
                cookieService.set("currentGroupId", $scope.currentGroupId);
                // get playlist
                let sharedMedias: QueryObject<SharedMedia> = this.sharedMediaService.getAllMediasByGroupId({ groupId: this.$scope.currentGroupId }, { reactive: true });
                sharedMedias.subscribe(() => {
                    Tracker.autorun(() => {
                        let medias: SharedMedia[] = sharedMedias.val();
                        this.$timeout(() => {
                            this.$scope.sharedMedias = medias;
                        });
                    });
                });
                // get group
                var groupQuery: QueryObject<Group> = groupsService.getGroupById({ id: $scope.currentGroupId }, { reactive: true });
                groupQuery.subscribe(() => {
                    groupQuery.expand(["presenterIds"], () => {
                        Tracker.autorun(() => {
                            let currentGroup = groupQuery.val(0);
                            let presenters = currentGroup.getPresenters().val();
                            this.$timeout(() => {
                                this.$scope.currentGroup = currentGroup;
                                this.$scope.presenters = presenters;
                            });
                        });
                    });
                });
            }
        });

    }

    public shareMedia(url: string) {
        var sharedMedia: SharedMedia = new SharedMedia();
        sharedMedia.url = url;
        sharedMedia.groupId = this.$scope.currentGroupId;
        this.sharedMediaService.shareMedia(sharedMedia, this.notificationService.getStandardCallback());
        this.$scope.newSharedMediaUrl = "";
    }
}

smallstack.angular.app.controller("ShareController", ShareController);
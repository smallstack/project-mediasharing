/// <reference path="../../../typedefinitions/generated.d.ts" />

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setRoute("/groups/:groupId/overview")
    .setTemplateUrl("client/views/groups/group.overview.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("GroupController")
    .setVisible(false)
    .setStateName("website.groupoverview")
);

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setRoute("/groups/:groupId/users")
    .setTemplateUrl("client/views/groups/group.users.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("GroupController")
    .setVisible(false)
    .setStateName("website.groupusers")
);

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setRoute("/groups/:groupId/presenters")
    .setTemplateUrl("client/views/groups/group.presenters.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("GroupController")
    .setVisible(false)
    .setStateName("website.grouppresenters")
);

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setRoute("/groups/:groupId/presenters/:presenterId")
    .setTemplateUrl("client/views/groups/group.presenter.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("GroupController")
    .setVisible(false)
    .setStateName("website.grouppresenter")
);

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setRoute("/groups/:groupId/settings")
    .setTemplateUrl("client/views/groups/group.settings.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("GroupController")
    .setVisible(false)
    .setStateName("website.groupsettings")
);

interface IGroupScope extends ng.IScope {
    vm: GroupController;
    group: Group;
    $meteorAutorun: Function;
    newPresenterCode: number;
    users: { [id: string]: User };
    promoteUser: string;
    inviteUser: string;
    promoteSharers: any;
    presenter: Presenter;
    groupId: string;
    presenterId: string;
}


class GroupController {

    static $inject = ["$scope", "groupsService", "notificationService", "userService", "$stateParams", "presenterService", "$timeout"];
    constructor(private $scope: IGroupScope, private groupsService: GroupsService, private notificationService: NotificationService, private userService: UserService, private $stateParams: ng.ui.IStateParamsService, private presenterService: PresenterService, private $timeout: angular.ITimeoutService) {
        $scope.vm = this;
        $scope.users = {};

        $scope.groupId = $stateParams["groupId"];
        $scope.presenterId = $stateParams["presenterId"];

        // initialize group
        console.log("getting group with id : ", $scope.groupId);
        if ($scope.groupId !== undefined) {
            var queryObject: QueryObject<Group> = groupsService.getGroupById({ id: $scope.groupId });
            queryObject.subscribe(() => {
                queryObject.expand(["userIds"], () => {
                    var group: Group = queryObject.val(0);
                    if (group === undefined) notificationService.popup.error("Group could not be found/loaded!");
                    else {
                        this.$timeout(() => {
                            this.$scope.group = group;
                            this.$scope.users = {};
                            _.each(group.getUsers().val(), (user: User) => {
                                this.$scope.users[user.id] = user;
                            });
                        });
                    }
                });
            });
        }

        if ($scope.presenterId !== undefined) {
            var presenterQuery: QueryObject<Presenter> = presenterService.getPresenterById({ id: $scope.presenterId });
            presenterQuery.subscribe(() => {
                var presenter = presenterQuery.val(0);
                if (presenter === undefined) notificationService.popup.error("Presenter could not be found/loaded!");
                else {
                    this.$timeout(() => {
                        this.$scope.presenter = presenter;
                        console.log("got presenter : ", presenter);
                    })
                }
            });
        }
    }

    public inGroup(accessGroup, id): boolean {
        return _.contains(accessGroup, id);
    }

    public updateGroup() {
        this.groupsService.updateGroup(this.$scope.group, NotificationService.instance().getStandardCallback());
    }

    public promoteSharer(userId: string) {
        var yesNo = this.inGroup(this.$scope.group.sharerIds, userId);
        console.log("promo sharer : ", userId, yesNo);
        this.groupsService.promoteSharer(this.$scope.group.id, userId, yesNo, (error: Meteor.Error, result: boolean) => {
            if (error)
                this.notificationService.popup.error(error.error + " - " + error.reason);
        });
    }

    public connectPresenter() {
        this.groupsService.addPresenter(this.$scope.group.id, this.$scope.newPresenterCode, (error: Meteor.Error, result: any) => {
            if (error) {
                this.notificationService.notification.error(error.error.toString() + " - " + error.reason);
                console.error(error);
            }
            else {
                if (result) {
                    this.$timeout(() => {
                        this.notificationService.notification.success("Successfully added Presenter!");
                        this.$scope.group.presenterIds.push(result);
                    });
                }
                else
                    this.notificationService.notification.error("Could not add Presenter due to an unknown error!");
                this.$scope.newPresenterCode = undefined;
            }
        });
    }

    public removePresenter(presenterId: string) {
        this.groupsService.removePresenter(this.$scope.group.id, presenterId, (error: Meteor.Error, result: any) => {
            if (error) {
                this.notificationService.notification.error(error.error.toString() + " - " + error.reason);
                console.error(error);
            }
            else {
                if (result)
                    this.notificationService.notification.success("Successfully removed Presenter!");
                else
                    this.notificationService.notification.error("Could not remove Presenter due to an unknown error!");
                this.$timeout(() => {
                    this.$scope.group.presenterIds = _.without(this.$scope.group.presenterIds, presenterId);
                });
            }
        });
    }

    public newJoinPassword() {
        this.groupsService.resetJoinPassword(this.$scope.group.id, (error: Meteor.Error, newPassword: string) => {
            if (error) {
                this.notificationService.notification.error(error.error.toString() + " - " + error.reason);
                console.error(error);
            } else {
                this.$timeout(() => {
                    this.$scope.group.joinPassword = newPassword;
                });
            }
        });
    }

    public savePresenter() {
        this.presenterService.updatePresenter(this.$scope.presenter, (error: Meteor.Error, numberOfDocsChanged: number) => {
            if (error)
                this.notificationService.getStandardErrorPopup(error, "While saving presenter!");
            else
                this.notificationService.notification.success("Successfully saved presenter!");
        });
    }
}

smallstack.angular.app.controller("GroupController", GroupController);
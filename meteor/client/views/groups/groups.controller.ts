/// <reference path="../../../typedefinitions/generated.d.ts" />

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setLabel("navigation.groups")
    .setRoute("/groups")
    .setTemplateUrl("client/views/groups/groups.ng.html")
    .setRequiresAuthentication(true)
    .setControllerName("GroupsController")
    .setIndex(15)
    .setVisible(true)
    .setStateName("website.groups")
    .setType("main")
);


interface IGroupsScope extends ng.IScope {
    vm: GroupsController;
    groups: Group[];
    newGroupName: string;
    $meteorAutorun: Function;
    newGroupPassword: string;
}


class GroupsController {

    static $inject = ["$scope", "groupsService", "notificationService", "utils", "presenterService", "userService", "$timeout"];
    constructor(private $scope: IGroupsScope, private groupsService: GroupsService, private notificationService: NotificationService, private utils: Utils, private presenterService: PresenterService, private userService: UserService, private $timeout: angular.ITimeoutService) {
        $scope.vm = this;
        $scope.groups = [];

        // initialize my groups
        var query: QueryObject<Group> = groupsService.getMyGroups({});
        query.subscribe(() => {
            this.$timeout(() => {
                this.$scope.groups = query.val();
            });
        });
    }

    public inGroup(accessGroup, user): boolean {
        if (user === undefined)
            return false;
        return _.contains(accessGroup, user._id);
    }

    public createNewGroup() {
        if (!this.utils.isNonEmptyString(this.$scope.newGroupName))
            this.notificationService.popup.error("Please fill in a group name!");
        else {
            this.groupsService.createNewGroup(this.$scope.newGroupName, (error: Meteor.Error, result: any) => {
                if (error)
                    this.notificationService.popup.error("Could not create new group, sorry!" + error);
                else {
                    this.$timeout(() => {
                        this.$scope.groups.push(result);
                    });
                }
            });
        }
    }


    public joinGroup() {
        this.groupsService.joinGroup(this.$scope.newGroupPassword, (error: Meteor.Error, group: Group) => {
            if (error) {
                this.notificationService.notification.error(error.error.toString() + " - " + error.reason);
                console.error(error);
            } else {
                this.$timeout(() => {
                    this.$scope.groups.push(group);
                });
            }
        });
    }
}

smallstack.angular.app.controller("GroupsController", GroupsController);
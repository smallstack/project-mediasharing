/// <reference path="../../../typedefinitions/generated.d.ts" />

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setLabel("navigation.home")
    .setRoute("/home")
    .setTemplateUrl("client/views/home/home.ng.html")
    .setRequiresAuthentication(false)
    .setControllerName("HomeController")
    .setIndex(1)
    .setStateName("website.home")
    .setType("main")
    .setDefaultRoute(true)
);


interface IHomeScope extends ng.IScope {
    vm: HomeController;
}


class HomeController {

    static $inject = ["$scope", "sharedMediaService", "notificationService"];
    constructor($scope: IHomeScope, private sharedMediaService: SharedMediaService, private notificationService: NotificationService) {
        $scope.vm = this;
    }
}

smallstack.angular.app.controller("HomeController", HomeController);
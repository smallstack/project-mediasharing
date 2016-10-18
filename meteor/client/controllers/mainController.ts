/// <reference path="../../typedefinitions/generated.d.ts" />

interface MainControllerScope extends ng.IScope {
	currentUser: Meteor.User;
	vm: MainController;
	logout: Function;
	$meteorSubscribe: Function;
	$meteorAutorun: Function;
	go: Function;
	isMobile: boolean;
	versions: any;
	toggleMenu: Function;
	menuToggle: Date;
	navigationEntries: any;
}

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
    .setAbstract(true)
    .setStateName("website")
    .setTemplateUrl("client/layout.ng.html")
    .setRequiresAuthentication(false)
);


class MainController {

	static $inject = ["$scope", "$meteor", "$location"];

	constructor($scope: MainControllerScope, private $meteor: any, private $location: ng.ILocationService) {
		$scope.$meteorSubscribe("myUser").then(function (subscriptionHandle) {
			$scope.$meteorAutorun(function () {
				if (Meteor.user()) {
					$scope.currentUser = Meteor.users.findOne({ _id: Meteor.userId() });
				}

				$scope.navigationEntries = _.filter(NavigationService.instance().getNavigationEntriesForNavigationType("main"), function (entry: NavigationEntry) {
					if (entry.isVisible() === false || entry.isAbstract())
						return false;

					if (entry.getRoute() === "/login" && Meteor.userId() !== null)
						return false;

					if (entry.getRoute() === "/register" && Meteor.userId() !== null)
						return false;

					if (entry.doesRequireAuthentication() && Meteor.userId() === null)
						return false;

					return true;
				});
			});
		});

		$scope.isMobile = Utils.isMobile();
		$scope.versions = versions;

		// helper functions
		$scope.logout = function () {
			$meteor.logout().then(function () {
				$location.path("/home");
			}, function (err) {
				console.log('logout error - ', err);
			});
		}

		$scope.go = function (route) {
			$location.path(route);
		}

		$scope.toggleMenu = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.menuToggle = new Date();
		}
	}
}

smallstack.angular.app.controller("MainController", MainController);

/// <reference path="../../../typedefinitions/generated.d.ts" />

smallstack.ioc.get<NavigationService>("navigationService").addNavigationEntry(NavigationEntry.new()
	.setLabel("navigation.devices")
	.setRoute("/devices")
	.setTemplateUrl("client/views/devices/devices.ng.html")
	.setRequiresAuthentication(false)
	.setIndex(22)
    .setStateName("website.devices")
	.setType("main")
);
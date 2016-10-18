/// <reference path="../typedefinitions/generated.d.ts" />

var configurationService: ConfigurationService = smallstack.ioc.get<ConfigurationService>("configurationService");
var utils: Utils = smallstack.ioc.get<Utils>("utils");

configurationService.set("routing.default", "website.home");
configurationService.set("registration.success.redirect", "website.home");
configurationService.set("routing.authrequired", "website.login");
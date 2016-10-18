/// <reference path="../typedefinitions/generated.d.ts" />

smallstack.initLevelService.addInitLevelFn(1, "Configuration", (done: (error: Meteor.Error, success: boolean) => void) => {
    var configurationService: ConfigurationService = smallstack.ioc.get<ConfigurationService>("configurationService");
    configurationService.initOnClient(done);
});

smallstack.initLevelService.addInitLevelFn(49, "Theme", (done: (error: Meteor.Error, success: boolean) => void): void => {

    var bootstrapTheme: BootstrapTheme = smallstack.ioc.get<BootstrapLoader>("bootstrapLoader").getTheme("sandstone");
    bootstrapTheme.load(done);
});

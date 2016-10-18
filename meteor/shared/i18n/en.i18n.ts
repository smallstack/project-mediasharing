/// <reference path="../../typedefinitions/generated.d.ts" />

var localizationService: LocalizationService = smallstack.ioc.get<LocalizationService>("localizationService");

localizationService.addTranslation("en", {
    "navigation": {
        "groups": "Groups",
        "devices": "Devices",
        "sharemedia": "Share Media",
        "home": "Home"
    }
});
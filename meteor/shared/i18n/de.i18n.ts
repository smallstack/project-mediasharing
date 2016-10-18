/// <reference path="../../typedefinitions/generated.d.ts" />

var localizationService: LocalizationService = smallstack.ioc.get<LocalizationService>("localizationService");

localizationService.addTranslation("de", {
    "navigation": {
        "groups": "Gruppen",
        "devices": "Geräte",
        "sharemedia" : "Medien teilen",
        "home" : "Startseite"
    }
});
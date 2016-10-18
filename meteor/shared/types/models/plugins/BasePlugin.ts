/// <reference path="../../../../typedefinitions/generated.d.ts" />

class BasePlugin {
    protected utils: Utils;
    protected presenterId: string;
    protected presenterService: PresenterService;
    protected notificationService: NotificationService;
    protected sharedMedia: SharedMedia;

    constructor(presenterId: string) {
        this.utils = smallstack.ioc.get<Utils>("utils");
        this.presenterId = presenterId;
        this.presenterService = smallstack.ioc.get<PresenterService>("presenterService");
        this.notificationService = smallstack.ioc.get<NotificationService>("notificationService");
    }

    protected play(sharedMedia: SharedMedia) {
        this.sharedMedia = sharedMedia;
    }

    protected updatePresenter(updateStatement: any) {
        var that = this;
        PresentersCollection.getMongoCollection().update({ "_id": this.presenterId }, updateStatement, function(error: Meteor.Error, numberOfUpdateddocuments: number) {
            if (error)
                that.notificationService.getStandardErrorPopup(error, "Could not update Presenter!");
            else
                that.notificationService.console.info("Updated Presenter...");
        });
    }

    protected getPresenter(): Presenter {
        return PresentersCollection.getMongoCollection().findOne({ "_id": this.presenterId });
    }

    public setPresenterId(presenterId: string) {
        this.presenterId = presenterId;
    }
}
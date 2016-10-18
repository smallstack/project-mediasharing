/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"presenters-registerPresenter" : function(params: {}){

		var hash: string = new Chance().hash({ length: 45 });
        var code: number = new Chance().integer({ min: 10000, max: 99999 });

		var presenter: Presenter = new Presenter();
		presenter.code = code;
		presenter.hash = hash;
		presenter.name = "Presenter";

		var async = Meteor.wrapAsync(smallstack.ioc.get<PresenterService>("presenterService").savePresenter);
		var id = async(presenter);

		var createdPresenter: Presenter = PresentersCollection.getMongoCollection().findOne(id);
		return createdPresenter;
	}
});
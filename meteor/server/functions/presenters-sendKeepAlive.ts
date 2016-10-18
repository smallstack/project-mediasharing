/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"presenters-sendKeepAlive": function (params: { hash: string }) {
        check(params.hash, String);
		PresentersCollection.getMongoCollection().update({ hash: params.hash }, { $set: { lastUpdate: new Date() } });
	}
});
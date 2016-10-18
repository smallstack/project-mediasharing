/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"groups-removePresenter": function (params: { groupId: string, presenterId: string }) {
        check(params.groupId, String);
		check(params.presenterId, String);

		// check if user is owner of group
		var group: Group = GroupsCollection.getMongoCollection().findOne({ _id: params.groupId, userIds: this.userId });
		if (group === undefined)
			throw new Meteor.Error("404", "Could not find group!");
		if (!_.contains(group.ownerIds, this.userId))
			throw new Meteor.Error("403", "Only owners can remove presenters!");

		// get presenter
		var presenter: Presenter = PresentersCollection.getMongoCollection().findOne(params.presenterId);

		group.presenterIds = _.without<string>(group.presenterIds, params.presenterId);


		// updates
		var updateGroup = Meteor.wrapAsync(smallstack.ioc.get<GroupsService>("groupsService").updateGroup)(group);
		var removedPresenter = Meteor.wrapAsync(smallstack.ioc.get<PresenterService>("presenterService").deletePresenter)(presenter);

		if (updateGroup !== 1)
			throw new Meteor.Error("500", "Could not update your group!");

		if (removedPresenter !== 1)
			throw new Meteor.Error("500", "Could not remove presenter!");

		return updateGroup + removedPresenter === 2;
	}
});
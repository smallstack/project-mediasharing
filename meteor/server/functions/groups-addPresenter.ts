/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"groups-addPresenter": function (params: { groupId: string, presenterCode: number }) {
        check(params.groupId, String);
		check(params.presenterCode, Number);

		// check if user is owner of group
		var group: Group = GroupsCollection.getMongoCollection().findOne({ _id: params.groupId, userIds: this.userId });
		if (group === undefined)
			throw new Meteor.Error("404", "Could not find group!");
		if (!_.contains(group.ownerIds, this.userId))
			throw new Meteor.Error("403", "Only owners can connect new presenters!");

		// get presenter
		var presenter: Presenter = PresentersCollection.getMongoCollection().findOne({ code: params.presenterCode });
		if (presenter === undefined)
			throw new Meteor.Error("404", "Could not find a presenter with code '" + params.presenterCode + "'!");
		if (presenter.groupId !== undefined)
			throw new Meteor.Error("403", "This presenter is already connected to another group!");

		// connect
		group.addPresenterIds([presenter.id]);
		presenter.mediaQueueIds = [];
		presenter.groupId = params.groupId;

		// updates
		var updateGroup = Meteor.wrapAsync(smallstack.ioc.get<GroupsService>("groupsService").updateGroup)(group);
		var updatePresenter = Meteor.wrapAsync(smallstack.ioc.get<PresenterService>("presenterService").updatePresenter)(presenter);

		if (updateGroup !== 1)
			throw new Meteor.Error("500", "Could not update your group!");
		if (updatePresenter !== 1)
			throw new Meteor.Error("500", "Could not update presenter!");

		return presenter.id;
	}
});
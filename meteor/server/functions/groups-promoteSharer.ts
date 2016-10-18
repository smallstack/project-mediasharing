/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"groups-promoteSharer": function (params: { groupId: string, userId: string, yesNo: boolean }) {
        check(params.groupId, String);
		check(params.userId, String);
		check(params.yesNo, Boolean);

		// check if user exists
		var user: Meteor.User = Meteor.users.find(params.userId);
		if (user === undefined)
			throw new Meteor.Error("Cannot find user with id '" + params.userId + "'!");

		// check if user is owner of group
		var group: Group = GroupsCollection.getMongoCollection().findOne({ ownerIds: this.userId, _id: params.groupId });
		if (group === undefined)
			throw new Meteor.Error("You are not the owner of this group!");

		if (params.yesNo)
			group.addSharerIds([params.userId]);
		else
			group.sharerIds = _.without(group.sharerIds, params.userId);
		smallstack.ioc.get<GroupsService>("groupsService").updateGroup(group);
		return true;
	}
});
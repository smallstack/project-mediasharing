/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"groups-joinGroup": function (params: { password: string }) {
		check(params.password, String);

		// get group
		var group: Group = GroupsCollection.getMongoCollection().findOne({ joinPassword: params.password });
		if (group === undefined)
			throw new Meteor.Error("404", "Could not find group to join!");

		group.addUserIds([this.userId]);

		smallstack.ioc.get<GroupsService>("groupsService").updateGroup(group);

		return group;
	}
});
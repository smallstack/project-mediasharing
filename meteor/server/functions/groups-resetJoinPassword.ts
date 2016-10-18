/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"groups-resetJoinPassword" : function(params: {groupId: string}){
		Utils.check(params.groupId, String, "groupId");
		
		// check if user is owner of group
		var group: Group = GroupsCollection.getMongoCollection().findOne({ _id: params.groupId, userIds: this.userId });
		if (group === undefined)
			throw new Meteor.Error("404", "Could not find group!");
		if (!_.contains(group.ownerIds, this.userId))
			throw new Meteor.Error("403", "Only owners can change the join password!");

		group.joinPassword = new Chance().string();

		GroupsCollection.getMongoCollection().update({ _id: params.groupId }, { $set: { joinPassword: group.joinPassword } });

		return group.joinPassword;
	}
});
/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"groups-createNewGroup" : function(params: {newGroupName: string}){
		Utils.check(params.newGroupName, String, "newGroupName");

		if (this.userId) {
			var group = new Group();
			group.ownerIds = [this.userId];
			group.userIds = [this.userId];
			group.sharerIds = [this.userId];
			group.name = params.newGroupName;
			var id = GroupsService.instance().saveGroup(group);
			return GroupsCollection.getMongoCollection().findOne(id);
		}

		throw new Meteor.Error("User not logged in!");
	}
});
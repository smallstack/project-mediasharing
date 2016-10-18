/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"sharedmedias-shareMedia" : function(params: {media: SharedMedia}){
        
		var media: SharedMedia = SharedMedia.fromDocument(params.media);

		media.date = new Date();
		media.ownerId = this.userId;
		
		// check if user can share in group
		var group = GroupsCollection.getMongoCollection().findOne({ _id: media.groupId });
		if (group === undefined)
			throw new Meteor.Error("404", "Could not find the group you want to share in!");
		if (!_.contains(group.sharerIds, this.userId))
			throw new Meteor.Error("403", "You are not allowed to share medias in this group");
		
		// save the shared media	
		var sharedMediaService: SharedMediaService = smallstack.ioc.get<SharedMediaService>("sharedMediaService");
		var sharedMediaId = Meteor.wrapAsync(sharedMediaService.saveSharedMedia)(media);
		
		// queue it into the presenters
		_.each(group.presenterIds, function(pid) {
			PresentersCollection.getMongoCollection().update({ _id: pid }, {
				$addToSet: {
					mediaQueueIds: sharedMediaId
				}
			});
		});
	}
});

/// <reference path="../generated/collections/GeneratedPresentersCollection.ts" />

class PresentersCollection extends GeneratedPresentersCollection {

	/**
	 * If you want to you can implement your own collection methods here. This file only gets generated once and will not get overwritten!
	 */
    
    
        /**
         * This sample constructor implements the 'getPresentersByIds' publication which is needed for foreign keys to work.
         * It is just an example and should get changed
         */
        constructor() {
                super();

                if (Meteor.isServer) {
                        this.collectionService.addPublisher("presenters", "getPresentersByIds", { "ownerId": "_currentLoggedInUser_" });
                }
        }

        protected getCollectionAllowRules(): Mongo.AllowDenyOptions {
                return {
                        insert: function(userId, doc) {
                                // the user must be logged in, and the document must be owned by the user
                                return (userId && doc.ownerId === userId);
                        },
                        update: function(userId, doc, fields, modifier) {
                                // TODO : that should get fixed
                                return true;
                        },
                        remove: function(userId, doc) {
                                // can only remove your own documents
                                return doc.ownerId === userId;
                        },
                        fetch: ['ownerId']
                }
        }
}

// delete the following line if you want to instanciate this collection somewhere else
new PresentersCollection();
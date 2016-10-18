/// <reference path="../../typedefinitions/generated.d.ts" />

/**
 * This method is getting executed on the server only. See http://docs.meteor.com/#/full/meteor_methods
 */

Meteor.methods({
	"presenters-isRegistered" : function(params: {code: string}){
		Utils.check(params.code, String, "code");
        
		
		throw new Meteor.Error("This method is not implemented yet!");
        
        // Please either return a value of type string or thow a new Meteor.Error in this method!
	}
});
/// <reference path="../../../../typedefinitions/generated.d.ts" />

interface IMediaPlugin {
    name: string;
    canHandle(sharedMedia: SharedMedia): void;
    initialize(callback: Function): void;
    play(sharedMedia: SharedMedia): void;
    pause(): void;
    stop(): void;
    getThumbnailUrl(sharedMedia: SharedMedia): String;
    getTitle(sharedMedia: SharedMedia, callback: Function): void;
    onPresenterUpdate(presenter: Presenter): void;
    setPresenterId(presenterId: string): void;
}
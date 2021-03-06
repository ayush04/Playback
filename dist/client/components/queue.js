"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const song_1 = require("../models/song");
const event_1 = require("../services/event");
const storage_1 = require("../services/storage");
const playlist_1 = require("../services/playlist");
class Queue {
    static initalize() {
        Queue._queue = Queue._fetchPreviousQueue();
        event_1.AppEvent.emit('queue-updated');
    }
    static _fetchPreviousQueue() {
        const value = storage_1.Storage.get('CURRENT_QUEUE');
        const _tempQueue = new Array();
        if (value) {
            value.forEach((item) => {
                _tempQueue.push(new song_1.Song(item.id, item.title, item.description, item.artistName, item.thumbnail, item.videoId));
            });
        }
        return _tempQueue;
    }
    static queue(song) {
        Queue._queue.push(song);
        playlist_1.Playlist.addSongToPlaylist(song.getId());
        storage_1.Storage.save('CURRENT_QUEUE', Queue._queue);
        event_1.AppEvent.emit('queue-updated');
    }
    static dequeue() {
        const song = Queue._queue.shift();
        event_1.AppEvent.emit('queue-updated');
        storage_1.Storage.save('CURRENT_QUEUE', Queue._queue);
        return song;
    }
    static next() {
        if (Queue._queue[Queue._currentTrack + 1]) {
            return Queue._queue[++Queue._currentTrack];
        }
        return undefined;
    }
    static previous() {
        if (Queue._queue[Queue._currentTrack - 1]) {
            return Queue._queue[--Queue._currentTrack];
        }
        return undefined;
    }
    static getCurrentQueue() {
        return Queue._queue;
    }
    static getCurrentSongIds() {
        return Queue._queue.map(song => song.getId());
    }
    static updateCurrentPlayingTrack(trackId) {
        Queue._currentTrack = Queue._queue.findIndex(song => song.getId() === trackId);
    }
    static getSongFromTrackId(trackId) {
        const song = Queue._queue.filter(song => song.getVideoId() === trackId);
        return song[0];
    }
    static deleteTrack(videoId) {
        const pos = Queue._queue.findIndex(song => song.getVideoId() === videoId);
        const song = Queue._queue[pos];
        Queue._queue.splice(pos, 1);
        playlist_1.Playlist.removeSongFromPlaylist(song.getId());
        event_1.AppEvent.emit('queue-updated');
        storage_1.Storage.save('CURRENT_QUEUE', Queue._queue);
    }
}
exports.Queue = Queue;
Queue._currentTrack = -1;
//# sourceMappingURL=queue.js.map
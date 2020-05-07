import { Song } from "../models/song";
import { AppEvent } from '../services/event';
import { Storage } from '../services/storage';

export class Queue {
    private static _queue: Array<Song>;
    private static _currentTrack = -1;

    static initalize() {
        Queue._queue = Queue._fetchPreviousQueue();
        AppEvent.emit('queue-updated');
    }
    private static _fetchPreviousQueue(): any {
        const value = Storage.get('CURRENT_QUEUE');
        const _tempQueue = new Array<Song>();
        if (value) {
            value.forEach((item: any) => {
                _tempQueue.push(new Song(item.id, item.title, item.description, item.thumbnail));
            });
        }
        return _tempQueue;
    }
    static queue(song: Song): void {
        Queue._queue.push(song);
        Storage.save('CURRENT_QUEUE', Queue._queue);
        AppEvent.emit('queue-updated');
    }

    static dequeue(): Song | undefined {
        const song = Queue._queue.shift();
        AppEvent.emit('queue-updated');
        Storage.save('CURRENT_QUEUE', Queue._queue);
        return song;
    }

    static next(): Song | undefined {
        if (Queue._queue[Queue._currentTrack + 1]) {
            return Queue._queue[++Queue._currentTrack];
        }
        return undefined;
    }

    static previous(): Song | undefined {
        if (Queue._queue[Queue._currentTrack - 1]) {
            return Queue._queue[--Queue._currentTrack];
        }
        return undefined;
    }

    static getCurrentQueue(): Array<Song> {
        return Queue._queue;
    }

    static updateCurrentPlayingTrack(trackId: string): void {
        Queue._currentTrack = Queue._queue.findIndex(song => song.getId() === trackId);
    }
}
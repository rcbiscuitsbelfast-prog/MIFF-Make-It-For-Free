import { describe, it, expect } from '@jest/globals';
import { TimelineSystemPure } from './index';

describe('TimelineSystemPure', () => {
  describe('Timeline Creation', () => {
    it('should create timeline', () => {
      const timeline = TimelineSystemPure.create({
        id: 'timeline1',
        events: []
      });

      expect(timeline).toBeDefined();
      expect(timeline.id).toBe('timeline1');
      expect(Array.isArray(timeline.events)).toBe(true);
    });

    it('should add event to timeline', () => {
      const timeline = TimelineSystemPure.create({ id: 't1', events: [] });
      const event = {
        id: 'event1',
        timestamp: 1000,
        type: 'cutscene',
        data: {}
      };

      const updated = TimelineSystemPure.addEvent(timeline, event);
      expect(updated.events.length).toBe(1);
    });
  });

  describe('Timeline Playback', () => {
    it('should play timeline', () => {
      const timeline = TimelineSystemPure.create({
        id: 't1',
        events: [
          { id: 'e1', timestamp: 0, type: 'start', data: {} },
          { id: 'e2', timestamp: 1000, type: 'action', data: {} }
        ]
      });

      const playing = TimelineSystemPure.play(timeline);
      expect(playing.playing).toBe(true);
    });

    it('should pause timeline', () => {
      const timeline = TimelineSystemPure.create({ id: 't1', events: [] });
      
      const playing = TimelineSystemPure.play(timeline);
      const paused = TimelineSystemPure.pause(playing);

      expect(paused.playing).toBe(false);
    });

    it('should seek to timestamp', () => {
      const timeline = TimelineSystemPure.create({ id: 't1', events: [] });
      
      const seeked = TimelineSystemPure.seek(timeline, 5000);
      expect(seeked.currentTime).toBe(5000);
    });
  });

  describe('Event Queries', () => {
    it('should get events at timestamp', () => {
      const timeline = TimelineSystemPure.create({
        id: 't1',
        events: [
          { id: 'e1', timestamp: 1000, type: 'a', data: {} },
          { id: 'e2', timestamp: 2000, type: 'b', data: {} }
        ]
      });

      const events = TimelineSystemPure.getEventsAtTime(timeline, 1000);
      expect(Array.isArray(events)).toBe(true);
    });
  });
});

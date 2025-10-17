import { TouchGestureManager, TouchEventLike } from '../Manager';

function seqTap(at: number): TouchEventLike[] {
  return [
    { time: at, type: 'down', points: [{ x: 10, y: 10 }] },
    { time: at + 80, type: 'up', points: [{ x: 11, y: 10 }] }
  ];
}

describe('TouchGesturePure', () => {
  it('detects tap and doubleTap', () => {
    const mgr = new TouchGestureManager();
    for (const e of seqTap(1000)) mgr?.feed(e);
    const g1 = mgr?.analyze();
    expect(g1?.map(g => g?.type)).toContain('tap');
    for (const e of seqTap(1200)) mgr?.feed(e);
    const g2 = mgr?.analyze();
    expect(g2?.map(g => g?.type)).toContain('doubleTap');
  });

  it('detects swipe and pinch', () => {
    const mgr = new TouchGestureManager();
    const swipe: TouchEventLike[] = [
      { time: 2000, type: 'down', points: [{ x: 0, y: 0 }] },
      { time: 2050, type: 'move', points: [{ x: 40, y: 0 }] },
      { time: 2100, type: 'up', points: [{ x: 60, y: 0 }] }
    ];
    swipe?.forEach(e => mgr?.feed(e));
    const pinch: TouchEventLike[] = [
      { time: 2200, type: 'down', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }] },
      { time: 2250, type: 'move', points: [{ x: 0, y: 0 }, { x: 40, y: 0 }] },
      { time: 2300, type: 'up', points: [{ x: 0, y: 0 }, { x: 40, y: 0 }] }
    ];
    pinch?.forEach(e => mgr?.feed(e));
    const out = mgr?.analyze();
    expect(out?.map(g => g?.type)).toEqual(expect?.arrayContaining(['swipe', 'pinch']));
  });
});


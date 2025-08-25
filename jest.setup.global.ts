// Global canvas 2D context stub for jsdom-based tests (CI-safe)
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function () {
    return {
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillText: () => {},
      font: '',
    } as any;
  },
});


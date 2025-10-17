import { ResolvedAvatar } from '../AvatarSystemPure/schema';

export class AvatarRendererWebPure {
  public static renderToCanvas(ctx: CanvasRenderingContext2D, avatar: ResolvedAvatar): void {
    // Simple painter: draw assets by anchor ordering
    const order = ['anchor_cloak','anchor_shirt','anchor_torso','anchor_head','anchor_hat','anchor_accessory'];
    for (const key of order) {
      const entry = avatar.assets.entries.find(e => e.anchor === key);
      if (!entry) continue;
      const img = new Image();
      img.src = entry.url;
      if (img.complete) {
        ctx.drawImage(img, 0, 0);
      } else {
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    }
  }
}


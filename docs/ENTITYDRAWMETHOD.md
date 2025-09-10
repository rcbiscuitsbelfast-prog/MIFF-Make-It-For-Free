# Entity draw() Method

## Pattern
```
class Entity {
  constructor(props){ this.x=props.x; this.y=props.y; this.sprite=assets.get('id'); }
  draw(ctx){ if (this.sprite){ ctx.drawImage(this.sprite, this.x, this.y); } }
}
```

## Usage
- Add to scene, the render loop calls `entity.draw(ctx)` every frame.
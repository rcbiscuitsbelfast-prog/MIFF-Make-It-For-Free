# Visual Marker Diagnostic

## Technique
Inject a DOM node at runtime per zone with unique text and color.

## Example
```
const marker = document.createElement('div')
marker.innerText = 'ZONE: GROVE'
marker.style.position = 'absolute'
marker.style.top = '10px'
marker.style.left = '10px'
marker.style.color = 'red'
marker.style.zIndex = '9999'
document.body.appendChild(marker)
```

## Purpose
- Quickly confirm which zone booted in production builds.
- Validate router bindings and renderer isolation.
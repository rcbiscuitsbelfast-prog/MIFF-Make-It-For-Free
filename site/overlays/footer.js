// MIFF Shared Attribution Footer
// Provides consistent attribution across all zones

export function createAttributionFooter() {
  const footer = document.createElement('div');
  footer.id = 'miff-attribution-footer';
  footer.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(15, 17, 22, 0.95);
    color: #e6edf3;
    border-top: 1px solid #222;
    padding: 8px 12px;
    font-size: 12px;
    text-align: center;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  `;
  
  const left = document.createElement('div');
  left.innerHTML = 'Assets: <a href="https://kaylousberg.itch.io/kaykit-fantasy-bundle" target="_blank" style="color: #58a6ff;">KayKit</a> (CC0) • Framework: <a href="https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free" target="_blank" style="color: #58a6ff;">MIFF</a>';
  
  const right = document.createElement('div');
  right.innerHTML = '<a href="../../docs/MAP_BUILDER_ONBOARDING.md" target="_blank" style="color: #58a6ff;">Contributor Guide</a> • <a href="../../contrib/remix-packs/README.md" target="_blank" style="color: #58a6ff;">Remix Packs</a>';
  
  footer.appendChild(left);
  footer.appendChild(right);
  
  return footer;
}

export function addAttributionFooter() {
  // Only add if not already present
  if (document.getElementById('miff-attribution-footer')) return;
  
  const footer = createAttributionFooter();
  document.body.appendChild(footer);
  
  // Adjust body padding to account for fixed footer
  document.body.style.paddingBottom = '40px';
}
#!/usr/bin/env python3
"""
Figma Canvas & Auto-Layout Sanitizer Engine.
Universal utility to sanitize HTML captures, reset float32 corner radii,
and enforce Auto-Layout consistency.
"""

import sys

FIGMA_SANITIZATION_JS = """
// Run inside Figma Plugin Console or use_figma execution environment
(async () => {
  let cleanedPaddingCount = 0;
  let resetCornerRadiusCount = 0;

  function sanitizeNode(node) {
    // 1. Zero out baked-in outer body padding on main staging frames
    if (node.type === 'FRAME' && (node.name.includes('Capture') || node.name.includes('Screen') || node.name.includes('Body'))) {
      if (node.paddingTop === 64 || node.paddingLeft === 64) {
        node.paddingTop = 0;
        node.paddingBottom = 0;
        node.paddingLeft = 0;
        node.paddingRight = 0;
        cleanedPaddingCount++;
      }
    }

    // 2. Float32 Corner Radius Reset (HTML-to-design bug exports rounded-full as 16777200)
    if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
      if (node.cornerRadius > 9999) {
        node.cornerRadius = 9999;
        resetCornerRadiusCount++;
      }
    }

    // (No absolute-positioning reset: badge overlays and status pips are absolute on purpose.)

    // Recurse into children
    if ('children' in node) {
      for (const child of node.children) {
        sanitizeNode(child);
      }
    }
  }

  // Execute on selected frames or whole current page
  const targetNodes = figma.currentPage.selection.length > 0 ? figma.currentPage.selection : [figma.currentPage];
  for (const target of targetNodes) {
    sanitizeNode(target);
  }

  console.log(`✅ Figma Sanitization Complete:`);
  console.log(`   - Root body padding zeroed: ${cleanedPaddingCount}`);
  console.log(`   - Float32 corner radii reset: ${resetCornerRadiusCount}`);
  figma.notify(`Sanitized: ${resetCornerRadiusCount} radii, ${cleanedPaddingCount} padding frames`);
})();
"""

def main():
    print("==================================================")
    print("  🎨 FahiUX Figma Auto-Layout Sanitizer Engine    ")
    print("==================================================")
    print("Copy the JavaScript snippet below into your Figma Console / Script runner:")
    print("--------------------------------------------------")
    print(FIGMA_SANITIZATION_JS.strip())
    print("--------------------------------------------------")

if __name__ == "__main__":
    main()

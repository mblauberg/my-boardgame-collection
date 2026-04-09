const fs = require('fs');

const lightColors = {
  "outline": "#767775",
  "error-container": "#f95630",
  "error": "#b02500",
  "on-background": "#2e2f2d",
  "primary-fixed": "#fd9000",
  "on-error-container": "#520c00",
  "secondary-fixed": "#8df5e4",
  "on-secondary-container": "#005c53",
  "on-primary-fixed-variant": "#532b00",
  "secondary-fixed-dim": "#7fe6d5",
  "tertiary-dim": "#5f4e00",
  "tertiary": "#6d5a00",
  "secondary": "#00675c",
  "on-tertiary-fixed-variant": "#675500",
  "tertiary-fixed": "#fdd73e",
  "primary-dim": "#794200",
  "inverse-primary": "#fd9000",
  "inverse-surface": "#0d0f0d",
  "on-tertiary-container": "#5c4b00",
  "on-primary-container": "#462400",
  "secondary-dim": "#005a50",
  "on-secondary-fixed-variant": "#00675c",
  "error-dim": "#b92902",
  "secondary-container": "#8df5e4",
  "on-tertiary": "#fff2cf",
  "surface-dim": "#d4d5d1",
  "tertiary-fixed-dim": "#eec930",
  "on-secondary-fixed": "#004840",
  "primary-fixed-dim": "#ea8400",
  "on-primary": "#fff0e6",
  "background": "#f7f6f3",
  "tertiary-container": "#fdd73e",
  "inverse-on-surface": "#9d9d9b",
  "surface-variant": "#ddddda",
  "on-error": "#ffefec",
  "on-tertiary-fixed": "#463900",
  "on-secondary": "#c0fff3",
  "surface": "#f7f6f3",
  "surface-container-low": "#f1f1ee",
  "surface-container-lowest": "#ffffff",
  "surface-container-high": "#e2e3df",
  "surface-container-highest": "#ddddda",
  "surface-bright": "#f7f6f3",
  "on-surface": "#2e2f2d",
  "on-surface-variant": "#5b5c5a",
  "primary": "#8a4c00",
  "primary-container": "#fd9000",
  "on-primary-fixed": "#1e0c00",
  "outline-variant": "#adadab",
  "surface-tint": "#8a4c00"
};

const darkOverrides = {
  "surface": "#131313",
  "surface-container-low": "#1c1b1b",
  "surface-container-lowest": "#0e0e0e",
  "surface-container-high": "#2a2a2a",
  "surface-container-highest": "#2a2a2a",
  "surface-bright": "#3a3a3a",
  "on-surface": "#e5e2e1",
  "on-surface-variant": "#dcc2ae",
  "primary": "#ffb97c",
  "primary-container": "#ff9100",
  "on-primary-fixed": "#2e1500",
  "outline-variant": "#564334",
  "surface-tint": "#ffb778",
  "tertiary-container": "#00b8fe",
  "background": "#131313",
  "on-background": "#e5e2e1",
  "outline": "#8c8c8c",
  "surface-variant": "#444444"
};

function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `${r} ${g} ${b}`;
}

const darkColors = { ...lightColors };
for (const [k, v] of Object.entries(lightColors)) {
  if (darkOverrides[k]) {
    darkColors[k] = darkOverrides[k];
  } else {
    // Basic inversion for remaining colors to match dark mode feel
    // If it's a fixed color, it stays the same
    if (k.includes('fixed')) continue;
    
    // Convert hex to HSL, invert L, convert back to hex? 
    // Or just let it be. Let's just output the variables list for CSS.
  }
}

// Generate CSS Text
let rootVars = '';
let darkVars = '';
let tailwindColors = '';

for (const [key, hex] of Object.entries(lightColors)) {
  const cssVarName = `--${key}`;
  rootVars += `    ${cssVarName}: ${hexToRgb(hex)};\n`;
  darkVars += `    ${cssVarName}: ${hexToRgb(darkColors[key])};\n`;
  tailwindColors += `        "${key}": "rgb(var(${cssVarName}) / <alpha-value>)",\n`;
}

console.log('--- root ---');
console.log(rootVars);
console.log('--- dark ---');
console.log(darkVars);
console.log('--- tailwind ---');
console.log(tailwindColors);


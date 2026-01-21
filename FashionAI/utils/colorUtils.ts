import { Color } from '../types';

// Helper to convert RGB to Hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// Simplified client-side dominant color extraction from an Image object
// We draw to a small canvas and sample pixels
export const extractPalette = async (imageUrl: string, colorCount: number = 5): Promise<Color[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      // Resize for performance
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      const colorMap: Record<string, { count: number, rgb: [number, number, number] }> = {};

      // Sample every 10th pixel to speed up
      for (let i = 0; i < imageData.length; i += 4 * 10) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue; // Skip transparent

        // Quantize colors slightly to group similar shades (round to nearest 32)
        const qR = Math.round(r / 32) * 32;
        const qG = Math.round(g / 32) * 32;
        const qB = Math.round(b / 32) * 32;
        
        const key = `${qR},${qG},${qB}`;
        
        if (!colorMap[key]) {
          colorMap[key] = { count: 0, rgb: [qR, qG, qB] };
        }
        colorMap[key].count++;
      }

      // Sort by frequency and take top N
      const sorted = Object.values(colorMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, colorCount)
        .map(c => ({
          rgb: c.rgb,
          hex: rgbToHex(c.rgb[0], c.rgb[1], c.rgb[2])
        }));

      resolve(sorted);
    };

    img.onerror = (e) => {
      console.error("Failed to load image for palette extraction", e);
      resolve([]);
    };
  });
};
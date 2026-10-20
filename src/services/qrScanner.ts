/**
 * Universal Mobile QR & Botanical Pot Tag Scanner
 * Uses jsQR with native BarcodeDetector fallback for 100% device compatibility
 */
import jsQR from 'jsqr';

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): {
        detect: (image: ImageBitmapSource) => Promise<Array<{ rawValue: string; format: string }>>;
      };
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

/**
 * Scans an HTML canvas for QR codes using jsQR (works everywhere)
 * and BarcodeDetector API as secondary hardware acceleration.
 * Returns the decoded string if found, otherwise null.
 */
export async function detectQrFromCanvas(
  canvas: HTMLCanvasElement
): Promise<string | null> {
  const ctx = canvas.getContext('2d');
  if (!ctx || canvas.width === 0 || canvas.height === 0) return null;

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data && code.data.trim().length > 0) {
      return code.data.trim();
    }
  } catch {
    // jsQR frame read issue
  }

  // Fallback to native BarcodeDetector if available
  if (typeof window !== 'undefined' && window.BarcodeDetector) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
      const barcodes = await detector.detect(canvas);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue.trim();
      }
    } catch {
      // BarcodeDetector not active on this frame
    }
  }

  return null;
}

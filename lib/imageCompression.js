const DEFAULT_MAX_EDGE = 2000;
const DEFAULT_QUALITY = 0.82;
const MIN_SAVING_RATIO = 0.92;

function getTargetSize(width, height, maxEdge) {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxEdge) {
    return { width, height };
  }

  const ratio = maxEdge / longestSide;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function getCompressedName(fileName) {
  const baseName = fileName.replace(/\.[^/.]+$/, "") || "photo";
  return `${baseName}.jpg`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Impossible de preparer ${file.name}.`));
    };

    image.src = url;
  });
}

async function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Compression image impossible."));
      },
      "image/jpeg",
      quality
    );
  });
}

export async function compressImageFile(file, options = {}) {
  if (!file?.type?.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return {
      file,
      originalSize: file?.size || 0,
      compressedSize: file?.size || 0,
      wasCompressed: false,
    };
  }

  const maxEdge = options.maxEdge || DEFAULT_MAX_EDGE;
  const quality = options.quality || DEFAULT_QUALITY;
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const target = getTargetSize(sourceWidth, sourceHeight, maxEdge);

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, target.width, target.height);
  context.drawImage(image, 0, 0, target.width, target.height);

  const blob = await canvasToBlob(canvas, quality);
  if (blob.size >= file.size * MIN_SAVING_RATIO) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
    };
  }

  return {
    file: new File([blob], getCompressedName(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    }),
    originalSize: file.size,
    compressedSize: blob.size,
    wasCompressed: true,
  };
}

export async function compressImageFiles(files, options) {
  const results = [];

  for (const file of files) {
    results.push(await compressImageFile(file, options));
  }

  return {
    files: results.map((result) => result.file),
    originalSize: results.reduce((total, result) => total + result.originalSize, 0),
    compressedSize: results.reduce((total, result) => total + result.compressedSize, 0),
    compressedCount: results.filter((result) => result.wasCompressed).length,
  };
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Ko";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

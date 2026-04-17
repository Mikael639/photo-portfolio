import { ImageResponse } from "next/og";
import { siteConfig, toAbsoluteUrl } from "../lib/siteConfig";
import { getPublicPhotos } from "../lib/photoRepository";

export const alt = `${siteConfig.name} portfolio photo`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage() {
  let bgImg = null;
  try {
    const photos = await getPublicPhotos({ limit: 1 });
    const heroPhoto = photos[0];
    if (heroPhoto) {
      bgImg = heroPhoto.src.startsWith('http') ? heroPhoto.src : toAbsoluteUrl(heroPhoto.src);
    }
  } catch (err) {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: bgImg 
            ? "#171310" // fallback
            : "radial-gradient(circle at 18% 24%, rgba(233, 215, 194, 0.94), transparent 34%), radial-gradient(circle at 84% 18%, rgba(216, 226, 231, 0.82), transparent 26%), linear-gradient(135deg, #f8f3eb 0%, #efe7db 52%, #e8ddd1 100%)",
          color: bgImg ? "#ffffff" : "#171310",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {bgImg && (
          <img 
            src={bgImg} 
            alt="background" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            opacity: 0.72,
          }}
        >
          <span>{siteConfig.name}</span>
          <span>Portfolio editorial</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 840 }}>
          <div
            style={{
              fontSize: 106,
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
            }}
          >
            Des images qui donnent de la tenue a l instant.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.35,
              color: "rgba(23, 19, 16, 0.72)",
              maxWidth: 760,
            }}
          >
            Mode, mariages, eglises et concerts saisis avec une direction visuelle sobre et precise.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
          }}
        >
          {siteConfig.categoryLabels.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                borderRadius: 999,
                border: "1px solid rgba(23, 19, 16, 0.16)",
                background: "rgba(255, 255, 255, 0.58)",
                padding: "12px 20px",
                fontSize: 22,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}

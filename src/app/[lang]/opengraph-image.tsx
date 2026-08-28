import { ImageResponse } from "next/og";
import { getDictionary, hasLocale } from "./dictionaries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(hasLocale(lang) ? lang : "en");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: "#d52b1e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", width: 52, height: 16, background: "#fff", borderRadius: 2 }} />
            <div style={{ position: "absolute", width: 16, height: 52, background: "#fff", borderRadius: 2 }} />
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#1a1a1a" }}>
            Swiss<span style={{ color: "#d52b1e" }}>Learn</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 32,
            color: "#57534e",
            textAlign: "center",
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          {dict.hero.subtitle}
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") ?? siteConfig.name;
    const category = searchParams.get("category") ?? siteConfig.tagline;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0f172a",
            backgroundImage: "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%)",
            backgroundSize: "50px 50px",
            padding: "60px 80px",
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "24px",
              }}
            >
              S
            </div>
            <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", color: "#38bdf8" }}>
              {siteConfig.name}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1000px" }}>
            {category ? (
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#38bdf8",
                  backgroundColor: "rgba(56, 189, 248, 0.1)",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  width: "max-content",
                }}
              >
                {category}
              </span>
            ) : null}
            <h1
              style={{
                fontSize: title.length > 60 ? "48px" : "56px",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#ffffff",
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid #334155",
              paddingTop: "24px",
              color: "#94a3b8",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            <span>The Game. In Focus.</span>
            <span>{siteConfig.url.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}

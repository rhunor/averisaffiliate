import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      {/* Averis logo mark — teal body, green triangle */}
      <svg width="32" height="25" viewBox="0 0 65 51" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z"
          fill="#1a9e8f"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z"
          fill="#40D457"
        />
      </svg>
    </div>,
    { ...size }
  );
}

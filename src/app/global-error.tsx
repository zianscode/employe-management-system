"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Aplikasi gagal dimuat</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Muat ulang halaman. Kalau masih gagal, hubungi admin.</p>
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: "8px 16px", borderRadius: 6, border: 0, background: "#023074", color: "#fff", cursor: "pointer" }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}

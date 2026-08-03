import "./_group.css";

const mockData = {
  collectionName: "SS26 — The Void",
  password: "VOID-7K2X-9MQ4",
  unlockUrl: "https://nynthworld.com/ss26-the-void",
};

const systemFont =
  "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

export function UnlockEmail() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f5f5f5", padding: "40px 20px" }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          fontFamily: systemFont,
        }}
      >
        <table
          role="presentation"
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{ borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: "#000000",
                  padding: "32px 40px",
                  color: "#ffffff",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.25em",
                    fontWeight: 700,
                    fontFamily: systemFont,
                  }}
                >
                  NYNTH
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: "#ffffff", padding: "64px 40px 40px" }}>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#000000",
                    letterSpacing: "-0.02em",
                    margin: "0 0 16px",
                    lineHeight: 1.15,
                    fontFamily: systemFont,
                  }}
                >
                  {mockData.collectionName} is live.
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    color: "rgba(0,0,0,0.6)",
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: systemFont,
                  }}
                >
                  Your access window is open. Use the code below to enter.
                </p>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: "#ffffff",
                  borderTop: "1px solid #000000",
                  borderBottom: "1px solid #000000",
                  padding: 40,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.5)",
                    marginBottom: 16,
                    display: "block",
                    fontFamily: systemFont,
                  }}
                >
                  YOUR UNLOCK CODE
                </span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    fontFamily: "'Courier New', Courier, monospace",
                    color: "#000000",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  {mockData.password}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(0,0,0,0.4)",
                    marginTop: 16,
                    display: "block",
                    fontFamily: systemFont,
                  }}
                >
                  This code is unique to you. Don&apos;t share it.
                </span>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: "#ffffff",
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <a
                  href={mockData.unlockUrl}
                  style={{
                    display: "inline-block",
                    background: "#000000",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "16px 40px",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: systemFont,
                  }}
                >
                  UNLOCK THE COLLECTION
                </a>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: "#ffffff",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  padding: "32px 40px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(0,0,0,0.4)",
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: systemFont,
                  }}
                >
                  You&apos;re receiving this because you signed up for early
                  access to Nynth World drops.
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(0,0,0,0.3)",
                    margin: "8px 0 0",
                    fontFamily: systemFont,
                  }}
                >
                  © 2026 Nynth World. All rights reserved.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UnlockEmail;
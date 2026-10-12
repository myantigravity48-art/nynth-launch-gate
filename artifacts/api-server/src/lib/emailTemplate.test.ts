import { describe, expect, it } from "vitest";
import { renderUnlockEmail, renderBroadcastEmail } from "./emailTemplate.js";

describe("renderUnlockEmail", () => {
  const data = {
    collectionName: "Genesis Drop",
    password: "A1B2C3D4",
    unlockUrl: "https://nynthworld.com/genesis-drop",
  };

  it("includes collection name, password, and unlock link", () => {
    const html = renderUnlockEmail(data);
    expect(html).toContain("Genesis Drop");
    expect(html).toContain("A1B2C3D4");
    expect(html).toContain("https://nynthworld.com/genesis-drop");
    expect(html).toContain("UNLOCK THE COLLECTION");
  });

  it("escapes HTML in every dynamic field", () => {
    const html = renderUnlockEmail({
      collectionName: "<script>alert(1)</script>",
      password: '"><img src=x onerror=alert(1)>',
      unlockUrl: "https://nynthworld.com/x?y=\"'><script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;");
  });

  it("renders a full HTML document", () => {
    const html = renderUnlockEmail(data);
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain("</html>");
  });
});

describe("renderBroadcastEmail", () => {
  it("renders subject, collection name, and body", () => {
    const html = renderBroadcastEmail({
      collectionName: "Genesis Drop",
      subject: "Drop is closing soon",
      body: "Final call.\nDo not miss it.",
    });
    expect(html).toContain("Drop is closing soon");
    expect(html).toContain("GENESIS DROP");
    expect(html).toContain("Final call.");
  });

  it("converts newlines to <br /> tags", () => {
    const html = renderBroadcastEmail({
      collectionName: "X",
      subject: "S",
      body: "line1\nline2",
    });
    expect(html).toContain("line1<br />line2");
  });

  it("escapes HTML in subject and body", () => {
    const html = renderBroadcastEmail({
      collectionName: "X",
      subject: "<b>bold</b>",
      body: "<script>alert('xss')</script>",
    });
    expect(html).not.toContain("<b>bold</b>");
    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

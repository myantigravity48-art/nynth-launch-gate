interface UnlockEmailData {
  collectionName: string;
  password: string;
  unlockUrl: string;
}

export function renderUnlockEmail(data: UnlockEmailData): string {
  const { collectionName, password, unlockUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${collectionName} is live.</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Email container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

          <!-- Wordmark header -->
          <tr>
            <td style="background-color:#000000;padding:32px 40px;">
              <span style="color:#ffffff;font-size:13px;letter-spacing:0.25em;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">NYNTH</span>
            </td>
          </tr>

          <!-- Hero block -->
          <tr>
            <td style="background-color:#ffffff;padding:64px 40px 40px;">
              <p style="margin:0 0 16px;font-size:32px;font-weight:700;color:#000000;letter-spacing:-0.02em;line-height:1.1;">${escapeHtml(collectionName)} is live.</p>
              <p style="margin:0;font-size:15px;color:rgba(0,0,0,0.6);line-height:1.6;">Your access window is open. Use the code below to enter.</p>
            </td>
          </tr>

          <!-- Password block -->
          <tr>
            <td style="background-color:#ffffff;border-top:1px solid #000000;border-bottom:1px solid #000000;padding:40px;">
              <span style="display:block;font-size:10px;letter-spacing:0.2em;font-weight:700;color:rgba(0,0,0,0.5);margin-bottom:16px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">YOUR UNLOCK CODE</span>
              <span style="display:block;font-size:28px;font-weight:700;letter-spacing:0.15em;font-family:'Courier New',Courier,monospace;color:#000000;">${escapeHtml(password)}</span>
              <span style="display:block;font-size:12px;color:rgba(0,0,0,0.4);margin-top:16px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">This code is unique to you. Don&rsquo;t share it.</span>
            </td>
          </tr>

          <!-- CTA block -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;" align="center">
              <a href="${escapeHtml(unlockUrl)}" style="display:inline-block;background-color:#000000;color:#ffffff;text-decoration:none;padding:16px 40px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">UNLOCK THE COLLECTION</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#ffffff;border-top:1px solid rgba(0,0,0,0.1);padding:32px 40px;">
              <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.4);line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">You&rsquo;re receiving this because you signed up for early access to Nynth World drops.</p>
              <p style="margin:8px 0 0;font-size:11px;color:rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">&copy; 2026 Nynth World. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface BroadcastEmailData {
  collectionName: string;
  subject: string;
  body: string;
}

export function renderBroadcastEmail(data: BroadcastEmailData): string {
  const { collectionName, subject, body } = data;
  // Convert newlines to <br> tags for plain-text body
  const bodyHtml = escapeHtml(body).replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

          <!-- Wordmark header -->
          <tr>
            <td style="background-color:#000000;padding:32px 40px;">
              <span style="color:#ffffff;font-size:13px;letter-spacing:0.25em;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">NYNTH</span>
            </td>
          </tr>

          <!-- Subject line -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:0.15em;font-weight:700;color:rgba(0,0,0,0.4);font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(collectionName.toUpperCase())}</p>
              <p style="margin:12px 0 0;font-size:26px;font-weight:700;color:#000000;letter-spacing:-0.02em;line-height:1.15;">${escapeHtml(subject)}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 40px;">
              <p style="margin:0;font-size:15px;color:rgba(0,0,0,0.75);line-height:1.7;">${bodyHtml}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#ffffff;border-top:1px solid rgba(0,0,0,0.1);padding:32px 40px;">
              <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.4);line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">You&rsquo;re receiving this because you signed up for early access to Nynth World drops.</p>
              <p style="margin:8px 0 0;font-size:11px;color:rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">&copy; 2026 Nynth World. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Copy-ready invoice-delivery emails for EmailJS.
 *
 * Paste one into an EmailJS template (Content → code view). Every template uses
 * the same variables, filled in by lib/email.ts when an invoice is sent:
 *   {{client_name}} {{business_name}} {{business_initials}} {{invoice_number}}
 *   {{amount}} {{issue_date}} {{due_date}} {{payment_cta_label}} {{payment_cta_url}}
 *   {{{message_html}}} {{{payment_details_html}}}   ← triple braces: pre-escaped HTML
 * The PDF arrives as the `invoice_pdf` variable attachment.
 *
 * Built for email clients: tables, inline styles, web-safe fonts, bulletproof
 * buttons, a hidden preheader and a single mobile media query.
 */

export interface EmailTemplate {
  id: string;
  name: string;
  /** Matching invoice design */
  pairsWith: string;
  description: string;
  swatch: { bg: string; ink: string; accent: string };
  html: string;
}

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace";

/** Full document wrapper with preheader and mobile tweaks. */
function doc({ bg, preheader, body }: { bg: string; preheader: string; body: string }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Invoice {{invoice_number}}</title>
<style>
  @media only screen and (max-width:620px){
    .container{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .stack{display:block!important;width:100%!important;box-sizing:border-box!important;text-align:left!important;border-left:0!important}
    .stack-gap{padding-top:14px!important}
    .big{font-size:34px!important}
    .hide-sm{display:none!important}
    .pill-amt{font-size:22px!important;padding:8px 14px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};">
<tr><td align="center" style="padding:32px 12px;">
${body}
</td></tr>
</table>
</body>
</html>`;
}

/** Bulletproof button (renders as a real button in Outlook too). */
function button({ bg, fg, radius = 12, border = bg, full = false }: { bg: string; fg: string; radius?: number; border?: string; full?: boolean }) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${full ? ' width="100%"' : ""}>
<tr><td align="center" bgcolor="${bg}" style="border-radius:${radius}px;background:${bg};border:2px solid ${border};">
<a href="{{payment_cta_url}}" target="_blank" style="display:${full ? "block" : "inline-block"};padding:15px 28px;font-family:${SANS};font-size:16px;font-weight:700;color:${fg};text-decoration:none;border-radius:${radius}px;">{{payment_cta_label}} &rarr;</a>
</td></tr>
</table>`;
}

/** Filled with "Invoice INV-001 is attached as a PDF." — or left empty when the email goes out without an attachment. */
const pdfNote = (color: string) =>
  `<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:${color};">{{attachment_note}}</p>`;

const footer = (color: string) =>
  `<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${color};">{{business_name}} &middot; Sent with SharpBill</p>`;

const PREHEADER = "Invoice {{invoice_number}} for {{amount}} is due {{due_date}}.";

/* ------------------------------------------------------------------ */
/* 1. Monolith — ink header, lime button                              */
/* ------------------------------------------------------------------ */
const monolith = doc({
  bg: "#F5F5F0",
  preheader: PREHEADER,
  body: `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;background:#FFFFFF;border:1px solid #E2E2DA;border-radius:22px;overflow:hidden;">
<tr><td class="px" style="background:#0E1116;padding:26px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="42" height="42" align="center" bgcolor="#C8F031" style="width:42px;height:42px;border-radius:11px;background:#C8F031;font-family:${SANS};font-size:15px;font-weight:800;color:#0E1116;">{{business_initials}}</td>
        <td style="padding-left:12px;font-family:${SANS};font-size:16px;font-weight:700;color:#FFFFFF;">{{business_name}}</td>
      </tr></table>
    </td>
    <td align="right" style="font-family:${MONO};font-size:12px;letter-spacing:2px;color:#C8F031;">INVOICE</td>
  </tr></table>
</td></tr>
<tr><td class="px" style="padding:34px 34px 8px;">
  <h1 style="margin:0 0 6px;font-family:${SANS};font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:#0E1116;">Your invoice is ready</h1>
  <p style="margin:0 0 22px;font-family:${MONO};font-size:13px;color:#5B6070;">{{invoice_number}}</p>
  <div style="font-family:${SANS};font-size:15px;line-height:1.65;color:#3A4150;">{{{message_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:22px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F0;border-radius:14px;">
    <tr>
      <td class="stack" style="padding:18px 20px;font-family:${SANS};font-size:12px;color:#5B6070;">Due date<br><strong style="font-size:15px;color:#0E1116;">{{due_date}}</strong></td>
      <td class="stack" align="right" style="padding:18px 20px;font-family:${SANS};font-size:12px;color:#5B6070;">Amount due<br><strong class="big" style="font-size:30px;font-weight:800;letter-spacing:-0.5px;color:#0E1116;">{{amount}}</strong></td>
    </tr>
  </table>
</td></tr>
<tr><td class="px" style="padding:4px 34px 8px;">${button({ bg: "#C8F031", fg: "#0E1116", border: "#0E1116", full: true })}</td></tr>
<tr><td class="px" style="padding:22px 34px 8px;">
  <p style="margin:0 0 6px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;color:#5B6070;">HOW TO PAY</p>
  <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:#3A4150;">{{{payment_details_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:18px 34px 30px;">${pdfNote("#5B6070")}</td></tr>
<tr><td class="px" style="padding:16px 34px;border-top:1px solid #EDEDE6;">${footer("#8A8F9C")}</td></tr>
</table>`,
});

/* ------------------------------------------------------------------ */
/* 2. Blueprint — navy header, sky accents                            */
/* ------------------------------------------------------------------ */
const blueprint = doc({
  bg: "#EEF3FB",
  preheader: PREHEADER,
  body: `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;">
<tr><td class="px" bgcolor="#14234B" style="background:#14234B;padding:30px 36px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${SANS};font-size:15px;font-weight:700;color:#FFFFFF;">{{business_name}}</td>
    <td align="right"><span style="display:inline-block;padding:5px 12px;border:1px solid #7DD3FC;border-radius:999px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;color:#7DD3FC;">{{invoice_number}}</span></td>
  </tr></table>
  <h1 class="big" style="margin:34px 0 8px;font-family:${SANS};font-size:44px;line-height:1;font-weight:800;letter-spacing:-1px;color:#FFFFFF;">{{amount}}</h1>
  <p style="margin:0;font-family:${SANS};font-size:15px;color:#B9C6E4;">Invoice for {{client_name}} &middot; <span style="color:#7DD3FC;font-weight:700;">due {{due_date}}</span></p>
</td></tr>
<tr><td height="4" bgcolor="#7DD3FC" style="height:4px;line-height:4px;font-size:0;background:#7DD3FC;">&nbsp;</td></tr>
<tr><td class="px" style="padding:32px 36px 6px;">
  <div style="font-family:${SANS};font-size:15px;line-height:1.65;color:#3B4A6B;">{{{message_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:24px 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #D3DCEE;border-radius:12px;">
    <tr>
      <td class="stack" width="33%" style="padding:16px 18px;font-family:${SANS};font-size:11px;letter-spacing:1px;color:#5A6B94;">ISSUED<br><span style="font-size:15px;letter-spacing:0;color:#14234B;font-weight:700;">{{issue_date}}</span></td>
      <td class="stack" width="33%" style="padding:16px 18px;border-left:1px solid #D3DCEE;font-family:${SANS};font-size:11px;letter-spacing:1px;color:#5A6B94;">DUE<br><span style="font-size:15px;letter-spacing:0;color:#14234B;font-weight:700;">{{due_date}}</span></td>
      <td class="stack" width="34%" style="padding:16px 18px;border-left:1px solid #D3DCEE;font-family:${SANS};font-size:11px;letter-spacing:1px;color:#5A6B94;">TOTAL<br><span style="font-size:15px;letter-spacing:0;color:#14234B;font-weight:700;">{{amount}}</span></td>
    </tr>
  </table>
</td></tr>
<tr><td class="px" style="padding:0 36px 10px;">${button({ bg: "#14234B", fg: "#FFFFFF", radius: 10 })}</td></tr>
<tr><td class="px" style="padding:22px 36px 6px;">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;color:#5A6B94;font-weight:700;">PAYMENT</p>
  <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:#3B4A6B;">{{{payment_details_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:18px 36px 28px;">${pdfNote("#5A6B94")}</td></tr>
<tr><td class="px" bgcolor="#F7F9FD" style="background:#F7F9FD;padding:16px 36px;">${footer("#8796B8")}</td></tr>
</table>`,
});

/* ------------------------------------------------------------------ */
/* 3. Cycle — lime band, issued → due timeline (great for monthly)    */
/* ------------------------------------------------------------------ */
const cycle = doc({
  bg: "#F4F8E6",
  preheader: PREHEADER,
  body: `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;border:2px solid #0E1116;">
<tr><td class="px" bgcolor="#C8F031" style="background:#C8F031;padding:30px 34px 34px;">
  <p style="margin:0;font-family:${SANS};font-size:15px;font-weight:700;color:#0E1116;">{{business_name}}</p>
  <h1 style="margin:26px 0 0;font-family:${SANS};font-size:36px;line-height:1.05;font-weight:800;letter-spacing:-1px;color:#0E1116;">Your invoice<br>is ready.</h1>
</td></tr>
<tr><td class="px" style="padding:28px 34px 4px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #0E1116;border-radius:16px;">
    <tr>
      <td style="padding:16px 18px;font-family:${SANS};font-size:11px;letter-spacing:1px;color:#5E6A3A;white-space:nowrap;">ISSUED<br><span style="font-size:15px;letter-spacing:0;font-weight:700;color:#0E1116;">{{issue_date}}</span></td>
      <td class="hide-sm" align="center" style="padding:16px 0;font-family:${SANS};font-size:18px;color:#0E1116;white-space:nowrap;">&#9679;&mdash;&mdash;&mdash;&#9679;</td>
      <td align="right" style="padding:16px 18px;font-family:${SANS};font-size:11px;letter-spacing:1px;color:#5E6A3A;white-space:nowrap;">DUE<br><span style="font-size:15px;letter-spacing:0;font-weight:700;color:#0E1116;">{{due_date}}</span></td>
    </tr>
  </table>
</td></tr>
<tr><td class="px" style="padding:22px 34px 4px;">
  <div style="font-family:${SANS};font-size:15px;line-height:1.65;color:#3A4150;">{{{message_html}}}</div>
</td></tr>
<tr><td class="px" align="center" style="padding:26px 34px 6px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1116" style="background:#0E1116;border-radius:999px;"><tr>
    <td style="padding:12px 10px 12px 22px;font-family:${SANS};font-size:12px;letter-spacing:1.5px;color:#B5BAC4;white-space:nowrap;">{{invoice_number}}</td>
    <td style="padding:6px;white-space:nowrap;"><span class="pill-amt" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#C8F031;font-family:${SANS};font-size:26px;font-weight:800;color:#0E1116;">{{amount}}</span></td>
  </tr></table>
</td></tr>
<tr><td class="px" align="center" style="padding:20px 34px 6px;">${button({ bg: "#0E1116", fg: "#C8F031", radius: 999 })}</td></tr>
<tr><td class="px" style="padding:24px 34px 6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F7FAEA" style="background:#F7FAEA;border-radius:14px;"><tr><td style="padding:16px 18px;">
    <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;font-weight:700;color:#5E6A3A;">HOW TO PAY</p>
    <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:#3A4150;">{{{payment_details_html}}}</div>
  </td></tr></table>
</td></tr>
<tr><td class="px" style="padding:18px 34px 28px;">${pdfNote("#5B6070")}</td></tr>
<tr><td class="px" style="padding:16px 34px;border-top:2px solid #0E1116;">${footer("#5B6070")}</td></tr>
</table>`,
});

/* ------------------------------------------------------------------ */
/* 4. Atelier — warm cream, serif, burnt orange                       */
/* ------------------------------------------------------------------ */
const atelier = doc({
  bg: "#F3EADC",
  preheader: PREHEADER,
  body: `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;background:#FBF4EA;border-radius:6px;">
<tr><td class="px" style="padding:42px 46px 10px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="44" height="44" align="center" bgcolor="#2B1A10" style="width:44px;height:44px;border-radius:44px;background:#2B1A10;font-family:${SANS};font-size:14px;font-weight:700;color:#FBF4EA;">{{business_initials}}</td>
    <td style="padding-left:12px;font-family:${SANS};font-size:15px;font-weight:600;color:#2B1A10;">{{business_name}}</td>
    <td align="right" style="font-family:${MONO};font-size:12px;color:#9A6B4F;">{{invoice_number}}</td>
  </tr></table>
</td></tr>
<tr><td class="px" style="padding:30px 46px 6px;">
  <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:20px;color:#9A6B4F;">for {{client_name}}</p>
  <h1 style="margin:4px 0 0;font-family:${SERIF};font-size:44px;line-height:1.05;font-weight:400;color:#2B1A10;">A new invoice, with thanks.</h1>
</td></tr>
<tr><td class="px" style="padding:26px 46px 6px;">
  <div style="font-family:${SANS};font-size:15px;line-height:1.7;color:#6B4A36;">{{{message_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:28px 46px 6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E6D6C0;border-bottom:1px solid #E6D6C0;"><tr>
    <td class="stack" style="padding:20px 0;font-family:${SANS};font-size:11px;letter-spacing:1.5px;color:#9A6B4F;">DUE {{due_date}}</td>
    <td class="stack" align="right" style="padding:20px 0;"><span class="big" style="font-family:${SERIF};font-size:46px;line-height:1;color:#C2410C;">{{amount}}</span></td>
  </tr></table>
</td></tr>
<tr><td class="px" style="padding:26px 46px 6px;">${button({ bg: "#C2410C", fg: "#FFFFFF", radius: 999 })}</td></tr>
<tr><td class="px" style="padding:26px 46px 6px;">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;color:#9A6B4F;">PAYMENT</p>
  <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:#6B4A36;">{{{payment_details_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:20px 46px 36px;">${pdfNote("#9A6B4F")}</td></tr>
<tr><td class="px" style="padding:18px 46px 30px;border-top:1px solid #E6D6C0;">${footer("#B08D74")}</td></tr>
</table>`,
});

/* ------------------------------------------------------------------ */
/* 5. Emerald — deep green panel, mint accents                        */
/* ------------------------------------------------------------------ */
const emerald = doc({
  bg: "#E7F1EC",
  preheader: PREHEADER,
  body: `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
<tr><td class="px" bgcolor="#0F3D2E" style="background:#0F3D2E;padding:34px 38px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="44" height="44" align="center" bgcolor="#86EFAC" style="width:44px;height:44px;border-radius:12px;background:#86EFAC;font-family:${SANS};font-size:15px;font-weight:800;color:#0F3D2E;">{{business_initials}}</td>
    <td style="padding-left:12px;font-family:${SANS};font-size:15px;font-weight:600;color:#FFFFFF;">{{business_name}}</td>
  </tr></table>
  <p style="margin:34px 0 4px;font-family:${SANS};font-size:11px;letter-spacing:2px;color:#86EFAC;">AMOUNT DUE &middot; {{invoice_number}}</p>
  <p class="big" style="margin:0;font-family:${SANS};font-size:46px;line-height:1.05;font-weight:800;letter-spacing:-1px;color:#FFFFFF;">{{amount}}</p>
  <p style="margin:8px 0 0;font-family:${SANS};font-size:14px;color:#A7C7B9;">Due by {{due_date}}</p>
</td></tr>
<tr><td class="px" style="padding:32px 38px 6px;">
  <p style="margin:0 0 14px;font-family:${SERIF};font-size:26px;line-height:1.2;color:#10241C;">Invoice for {{client_name}}</p>
  <div style="font-family:${SANS};font-size:15px;line-height:1.7;color:#3E5A4E;">{{{message_html}}}</div>
</td></tr>
<tr><td class="px" style="padding:26px 38px 6px;">${button({ bg: "#0F3D2E", fg: "#FFFFFF", radius: 10 })}</td></tr>
<tr><td class="px" style="padding:26px 38px 6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #D6E6DE;border-radius:12px;"><tr><td style="padding:16px 18px;">
    <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;font-weight:700;color:#5E7A6E;">PAYMENT DETAILS</p>
    <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:#3E5A4E;">{{{payment_details_html}}}</div>
  </td></tr></table>
</td></tr>
<tr><td class="px" style="padding:18px 38px 28px;">${pdfNote("#5E7A6E")}</td></tr>
<tr><td class="px" bgcolor="#F3F8F5" style="background:#F3F8F5;padding:16px 38px;">${footer("#8BA79A")}</td></tr>
</table>`,
});

/* ------------------------------------------------------------------ */
/* 6. Counterfoil — ticket stub with a perforated edge, coral         */
/* ------------------------------------------------------------------ */
const counterfoil = doc({
  bg: "#F6EFEC",
  preheader: PREHEADER,
  body: `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;">
<tr><td class="px" bgcolor="#FFEDE8" style="background:#FFEDE8;border-radius:22px 22px 0 0;padding:30px 36px 28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${SANS};font-size:15px;font-weight:700;color:#2A120C;">{{business_name}}</td>
    <td align="right" style="font-family:${MONO};font-size:12px;color:#8A4B3F;">{{invoice_number}}</td>
  </tr></table>
  <h1 style="margin:26px 0 0;font-family:${SANS};font-size:42px;line-height:1;font-weight:800;letter-spacing:-1px;color:#B93A26;">Invoice</h1>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;"><tr>
    <td class="stack" style="font-family:${SANS};font-size:11px;letter-spacing:1.5px;color:#8A4B3F;">AMOUNT<br><span class="big" style="font-size:32px;letter-spacing:-0.5px;font-weight:800;color:#2A120C;">{{amount}}</span></td>
    <td class="stack stack-gap" align="right" style="font-family:${SANS};font-size:11px;letter-spacing:1.5px;color:#8A4B3F;">DUE<br><span style="font-size:17px;letter-spacing:0;font-weight:700;color:#2A120C;">{{due_date}}</span></td>
  </tr></table>
</td></tr>
<tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;border-top:2px dashed #EBB3A6;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="px" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:28px 36px 6px;">
  <div style="font-family:${SANS};font-size:15px;line-height:1.65;color:#5C2B22;">{{{message_html}}}</div>
</td></tr>
<tr><td class="px" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:26px 36px 6px;">${button({ bg: "#B93A26", fg: "#FFFFFF", radius: 12, full: true })}</td></tr>
<tr><td class="px" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:24px 36px 6px;">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;font-weight:700;color:#8A4B3F;">HOW TO PAY</p>
  <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:#5C2B22;">{{{payment_details_html}}}</div>
</td></tr>
<tr><td class="px" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:18px 36px 28px;">${pdfNote("#8A4B3F")}</td></tr>
<tr><td class="px" bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:0 0 22px 22px;padding:16px 36px 22px;border-top:1px solid #F4D9D2;">${footer("#C08A7E")}</td></tr>
</table>`,
});

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: "monolith", name: "Monolith", pairsWith: "Monolith", description: "Ink header, lime pay button, clean summary.", swatch: { bg: "#0E1116", ink: "#FFFFFF", accent: "#C8F031" }, html: monolith },
  { id: "blueprint", name: "Blueprint", pairsWith: "Blueprint", description: "Navy header with the amount up front.", swatch: { bg: "#14234B", ink: "#FFFFFF", accent: "#7DD3FC" }, html: blueprint },
  { id: "cycle", name: "Cycle", pairsWith: "Cycle", description: "Lime band and issued-to-due timeline — great for monthly billing.", swatch: { bg: "#C8F031", ink: "#0E1116", accent: "#0E1116" }, html: cycle },
  { id: "atelier", name: "Atelier", pairsWith: "Atelier", description: "Warm cream paper, serif headline, burnt orange.", swatch: { bg: "#FBF4EA", ink: "#2B1A10", accent: "#C2410C" }, html: atelier },
  { id: "emerald", name: "Emerald", pairsWith: "Emerald", description: "Deep green panel with a formal greeting.", swatch: { bg: "#0F3D2E", ink: "#FFFFFF", accent: "#86EFAC" }, html: emerald },
  { id: "counterfoil", name: "Counterfoil", pairsWith: "Counterfoil", description: "Ticket stub with a perforated edge, coral accents.", swatch: { bg: "#FFEDE8", ink: "#2A120C", accent: "#B93A26" }, html: counterfoil },
];

/** Fills variables with sample values for the in-app preview (mirrors EmailJS behaviour). */
export function previewHtml(html: string) {
  const sample: Record<string, string> = {
    client_name: "Maya",
    business_name: "Studio Ade",
    business_initials: "SA",
    invoice_number: "INV-024",
    amount: "$4,500.00",
    issue_date: "Oct 7, 2026",
    due_date: "Oct 24, 2026",
    payment_cta_label: "Pay now",
    payment_cta_url: "#",
    attachment_note: "\u{1F4CE} Invoice INV-024 is attached to this email as a PDF — download it for your records.",
    message_html:
      "Hi Maya,<br><br>Please find invoice INV-024 attached to this email as a PDF, for $4,500.00, due on 24 October 2026.<br><br>Thank you for your business!<br>Studio Ade",
    payment_details_html: 'Pay online: <a href="#" style="color:inherit;">pay.studioade.co/inv-024</a>',
  };
  return html.replace(/\{\{\{?(\w+)\}?\}\}/g, (_, k: string) => sample[k] ?? `{{${k}}}`);
}

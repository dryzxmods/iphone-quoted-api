import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const {
    time = "11:26",
    messageText = "Halo dari API!",
    carrierName = "INDOSAT Ooredoo",
    batteryPercentage = "88",
    signalStrength = "4",
  } = req.query;

  const html = `
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        body { margin:0; font-family:-apple-system,BlinkMacSystemFont,sans-serif; background:#111; color:#fff; }
        .statusbar { padding:8px; font-size:12px; display:flex; justify-content:space-between; }
        .chat { margin:20px; max-width:260px; background:#2b2b2b; padding:10px 14px; border-radius:12px; font-size:15px; }
        .time { font-size:11px; color:#aaa; text-align:right; margin-top:4px; }
      </style>
    </head>
    <body>
      <div class="statusbar">
        <div>${carrierName} • ${signalStrength} bars</div>
        <div>${batteryPercentage}% 🔋</div>
      </div>
      <div class="chat">
        ${messageText}
        <div class="time">${time}</div>
      </div>
    </body>
  </html>`;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const buffer = await page.screenshot({ type: "png" });

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
}

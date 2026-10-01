# Astro 靜態站照抄 Search-Petfood

沿用 Astro + GitHub Pages + 每日排程全量抓取 + 前端分片 JSON + 無後端，因零維運成本且可複用既有 fetch/normalize/verify 流程；代價是無即時性與 CORS 只能靠建置期抓取解決。

**Considered Options**: Next.js SSR / Proxy 即時查 MOA（即時但要養後端）; Cloudflare Workers（要額外帳號與成本）。

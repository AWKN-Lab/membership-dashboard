# 浏览器实际验收证据

- CAPTURE/ASSERT tab-overview.png normal
- CAPTURE/ASSERT tab-network.png normal
- CAPTURE/ASSERT tab-funnel.png normal
- CAPTURE/ASSERT tab-leads.png normal
- CAPTURE/ASSERT tab-member-success.png normal
- CAPTURE/ASSERT tab-org-agent.png normal
- CAPTURE/ASSERT tab-finance.png normal
- CAPTURE/ASSERT card-loading.png loading
- CAPTURE/ASSERT card-empty.png empty
- CAPTURE/ASSERT card-error.png error
- CAPTURE/ASSERT occupancy-panel.png normal
- PASS CSV exact floor values; six rows including header; occupancy.csv
- PASS occupancy 75.8% equals inventory totals 288/380 and trend; last month 2026-08
- PASS comparison value stable; 环比 -3.9pp → 同比 +2.4pp
- PASS actual chart series click; route /floors/fl-f1?range=custom&from=2026-05-01&to=2026-08-31&venue=club&compare=mom; reload survives
- PASS direct restricted URL coerced to club; group mock rows absent
- PASS metric definition hover
- PASS browser zero external requests and page errors

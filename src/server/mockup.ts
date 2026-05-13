import { readFileSync } from "fs";
import { join } from "path";

const JBBANK_LOGO_B64 = (() => {
  try {
    return readFileSync(join(process.cwd(), "plan/JBBANK_CI.png")).toString("base64");
  } catch {
    return "";
  }
})();
const JBBANK_LOGO_SRC = JBBANK_LOGO_B64
  ? `data:image/png;base64,${JBBANK_LOGO_B64}`
  : "";

export function getMockupHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>x402 Mockup</title>
  <style>
    /* ── Reset & Page ─────────────────────────────────── */
    :root {
      --primary: #004898;
      --accent:  #004898;
      --success: #00a85a;
      --danger:  #e03131;
      --surface: #f5f7fa;
      --card:    #fff;
      --text:    #0f172a;
      --muted:   #64748b;
      --line:    #d9e2ec;
      --device-scale: 1;   /* updated by JS on resize */
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body {
      width: 100%; height: 100vh;
      overflow: hidden;
      background: radial-gradient(ellipse at 60% 20%, #1e3a5f 0%, #0b1120 55%, #090d18 100%);
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Pretendard, "Noto Sans KR", sans-serif;
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Device wrapper: shrinks to match visual (scaled) size ── */
    .device-wrap {
      /* size = native device size × scale factor set by JS */
      width:  calc(393px * var(--device-scale));
      height: calc(852px * var(--device-scale));
      position: relative;   /* anchor for absolutely-positioned .device */
      flex-shrink: 0;
    }

    /* ─────────────────────────────────────────────────────────
       iPhone 16 physical frame
       Logical resolution: 393 × 852 pt
       Corner radius: ~55 px outer / ~44 px inner (screen)
       Bezel: 12 px sides, 12 px top, 10 px bottom
    ───────────────────────────────────────────────────────── */
    .device {
      /* Always native size; scaling is done via transform */
      position: absolute;
      top: 0; left: 0;
      width: 393px;
      height: 852px;
      transform: scale(var(--device-scale));
      transform-origin: top left;
      /* Titanium finish gradient */
      background: linear-gradient(
        155deg,
        #5a5a5e 0%,
        #3a3a3c 18%,
        #2a2a2c 45%,
        #1c1c1e 72%,
        #0e0e10 100%
      );
      border-radius: 55px;
      /* Outer ring highlight + deep shadow */
      box-shadow:
        0 0 0 1px rgba(255,255,255,.10),
        0 0 0 2px rgba(0,0,0,.85),
        0 50px 100px rgba(0,0,0,.55),
        0 100px 200px rgba(0,0,0,.35),
        inset 0 1px 0 rgba(255,255,255,.08);
    }

    /* Power button — right side */
    .btn-power {
      position: absolute;
      right: -3px;
      top: 210px;
      width: 3px;
      height: 78px;
      background: linear-gradient(180deg, #484848, #2e2e30, #484848);
      border-radius: 0 2px 2px 0;
    }

    /* Left-side buttons container */
    .device-btns {
      position: absolute;
      left: -3px;
      top: 0;
      width: 3px;
      height: 100%;
      pointer-events: none;
    }
    .btn-mute, .btn-vol-up, .btn-vol-down {
      position: absolute;
      left: 0;
      width: 3px;
      background: linear-gradient(180deg, #484848, #2e2e30, #484848);
      border-radius: 2px 0 0 2px;
    }
    .btn-mute    { top: 128px; height: 34px; }
    .btn-vol-up  { top: 186px; height: 60px; }
    .btn-vol-down{ top: 262px; height: 60px; }

    /* ── Display area (inset from frame) ─────────────── */
    .device-screen {
      position: absolute;
      inset: 12px 12px 10px;   /* bezel: 12 top/sides, 10 bottom */
      background: var(--surface);
      border-radius: 44px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* ── Dynamic Island ───────────────────────────────── */
    /* Positioned absolute inside .device-screen, does NOT affect flex layout */
    .di {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 126px;
      height: 37px;
      background: #000;
      border-radius: 20px;
      z-index: 100;
      pointer-events: none;
    }

    /* ── Status Bar ───────────────────────────────────── */
    /* height = 54px: 12 gap above DI + 37 DI height + 5 gap below */
    .status-bar {
      flex-shrink: 0;
      height: 54px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 28px 19px;
      position: relative;
      z-index: 50;
    }
    .sb-time {
      font-size: 15px;
      font-weight: 650;
      letter-spacing: -0.3px;
      color: var(--text);
    }
    .sb-icons { display: flex; align-items: center; gap: 6px; }

    /* ── App root ─────────────────────────────────────── */
    #app {
      flex: 1;
      min-height: 0;          /* critical: lets flex child shrink */
      position: relative;
      overflow: hidden;
      background: var(--surface);
      touch-action: pan-y;
    }

    /* ── Home indicator ───────────────────────────────── */
    .home-bar {
      flex-shrink: 0;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface);
    }
    .home-pill {
      width: 134px;
      height: 5px;
      background: rgba(0,0,0,.22);
      border-radius: 3px;
    }

    /* ── Mobile: no frame chrome, full-screen native ── */
    @media (max-width: 430px) {
      html, body { height: 100dvh; }
      .device-wrap { width: 100vw; height: 100dvh; }
      .device {
        width: 100vw; height: 100dvh;
        border-radius: 0; box-shadow: none;
        transform: none;
      }
      .btn-power, .device-btns { display: none; }
      .device-screen { inset: 0; border-radius: 0; }
      .di { display: none; }
      .status-bar { height: 44px; }
    }

    /* ── Mobile UA: hide status bar & home bar (real device has its own) ── */
    body.is-mobile .status-bar { display: none; }
    body.is-mobile .home-bar   { display: none; }

    /* ══════════════════════════════════════════════════════
       App-level styles
    ══════════════════════════════════════════════════════ */

    /* Top navigation bar */
    .top-nav {
      position: sticky;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      height: 48px;
      background: rgba(245,247,250,.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--line);
      z-index: 20;
      flex-shrink: 0;
    }
    .top-nav .back {
      position: absolute;
      left: 10px;
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 15px;
      color: var(--accent);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 6px;
    }
    .top-nav .title  { font-size: 17px; font-weight: 600; letter-spacing: -0.2px; }
    .top-nav .spacer { width: 56px; }

    /* Screens — stack inside #app */
    .screen {
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      overscroll-behavior: contain;
      padding-bottom: 80px;        /* clear tab bar */
      animation: slideUp .25s cubic-bezier(.2,.8,.2,1);
    }
    .screen::-webkit-scrollbar { display: none; }
    .screen.active { display: flex; z-index: 1; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* M0 intro has no nav, flex-centering done inside */
    #M0.active { display: flex; }

    .content { padding: 12px 16px 16px; flex: 1; }

    /* Cards */
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 16px; margin-bottom: 12px; }
    .card.primary { background: linear-gradient(160deg, var(--primary) 0%, #0060c0 100%); color: #fff; border: none; }
    .lbl  { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
    .card.primary .lbl { color: rgba(255,255,255,.72); }
    .amount { font-size: 30px; font-weight: 700; margin: 4px 0 8px; letter-spacing: -0.5px; }
    .meta   { font-size: 12px; color: rgba(255,255,255,.72); }
    .sub    { font-size: 12px; color: var(--muted); }

    /* Gauges */
    .gauge + .gauge { margin-top: 14px; }
    .gauge-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .bar  { width: 100%; height: 7px; border-radius: 999px; background: #e5edf7; overflow: hidden; }
    .fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #0d5bcc, #39a4ff); width: 0; transition: width .6s cubic-bezier(.2,.8,.2,1); }
    .fill.green  { background: linear-gradient(90deg, #00a85a, #46d98f); }
    .fill.orange { background: linear-gradient(90deg, #ff8b1f, #ffb34f); }

    /* Transaction list */
    .tx-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .tx-row:last-child { border-bottom: none; }
    .tx-left  { display: flex; align-items: center; gap: 12px; }
    .tx-icon  { width: 36px; height: 36px; border-radius: 10px; background: #eaf1fb; display: grid; place-items: center; font-size: 16px; }
    .tx-info  { display: flex; flex-direction: column; gap: 2px; }
    .tx-name  { font-weight: 600; font-size: 13px; }
    .tx-time  { font-size: 11px; color: var(--muted); }
    .tx-amt   { font-weight: 700; font-size: 13px; }
    .tx-amt.minus { color: var(--danger); }
    .tx-amt.plus  { color: var(--success); }

    /* Buttons */
    .btn { width: 100%; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; background: var(--accent); color: #fff; margin-top: 12px; transition: transform .1s, opacity .15s; }
    .btn:active:not(:disabled) { transform: scale(.985); }
    .btn:disabled { opacity: .55; cursor: wait; }
    .btn.secondary { background: #edf4ff; color: var(--primary); }
    .btn.danger    { background: var(--danger); color: #fff; }

    /* Tabs (M3 sub-tabs) */
    .tabs { display: flex; gap: 6px; margin-bottom: 14px; }
    .tab  { flex: 1; border: none; border-radius: 10px; padding: 10px; font-size: 12px; font-weight: 700; cursor: pointer; background: #e5edf7; color: var(--muted); transition: all .15s; }
    .tab.active { background: var(--primary); color: #fff; }

    /* Settings rows */
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .setting-row:last-child { border-bottom: none; }
    .chip { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: #edf4ff; color: var(--primary); }

    /* Settings inputs */
    .setting-input {
      width: 96px; text-align: right;
      border: 1px solid var(--line); border-radius: 8px;
      padding: 5px 8px; font-size: 13px; font-weight: 600;
      color: var(--primary); background: #f8fbff;
      outline: none; transition: border-color .15s;
    }
    .setting-input:focus { border-color: var(--accent); background: #edf4ff; }
    .setting-input-wrap { display: flex; align-items: center; gap: 4px; }
    .setting-unit { font-size: 11px; color: var(--muted); white-space: nowrap; }
    .toggle-btn {
      font-size: 11px; font-weight: 700; padding: 5px 14px;
      border-radius: 999px; border: none; cursor: pointer;
      background: var(--success); color: #fff; transition: all .15s;
    }
    .toggle-btn.off { background: #e5edf7; color: var(--muted); }

    /* Status messages */
    .status { padding: 12px 14px; border-radius: 12px; font-size: 13px; margin-top: 12px; display: none; }
    .status.show { display: block; }
    .status.ok  { background: #ebfff3; color: #0f6a3e; border: 1px solid #c2efd1; }
    .status.err { background: #fff2f2; color: #991b1b; border: 1px solid #fecaca; }

    /* Micropayment list */
    .list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: #fff; font-size: 13px; transition: all .15s; }
    .list-item.done { border-color: #b9e6cd; background: #f1fff7; }
    .list-item-info { display: flex; flex-direction: column; gap: 3px; }
    .list-item-title { font-size: 13px; font-weight: 500; color: var(--text); }
    .list-item-price { font-size: 11px; color: var(--accent); font-weight: 600; }

    /* ── Accordion ──────────────────────────────────── */
    .accordion       { margin-bottom: 12px; }
    .accordion-hd    {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; background: var(--card); border: 1px solid var(--line);
      border-radius: 14px; cursor: pointer; user-select: none;
      transition: border-radius .2s, background .15s;
    }
    .accordion-hd:active { background: #f0f4f9; }
    .accordion-hd.open   { border-radius: 14px 14px 0 0; }
    .accordion-hd-left   { display: flex; flex-direction: column; gap: 2px; }
    .accordion-hd-title  { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .accordion-hd-sub    { font-size: 11px; color: var(--muted); }
    .accordion-chevron   { transition: transform .25s cubic-bezier(.2,.8,.2,1); color: var(--muted); flex-shrink: 0; }
    .accordion-chevron.open { transform: rotate(180deg); }
    .accordion-body  {
      background: var(--card); border: 1px solid var(--line); border-top: none;
      border-radius: 0 0 14px 14px; overflow: hidden;
      max-height: 0; transition: max-height .3s cubic-bezier(.2,.8,.2,1);
    }
    .accordion-body.open { max-height: 700px; }
    .accordion-inner { padding: 14px 14px 16px; }

    /* ── KTX Card ───────────────────────────────────── */
    .ktx-card {
      background: linear-gradient(135deg, #001f5b 0%, #003087 100%);
      border-radius: 14px; padding: 16px; color: #fff; margin-bottom: 12px;
    }
    .ktx-top    { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .ktx-badge  {
      font-size: 13px; font-weight: 900; letter-spacing: .08em;
      background: #e8192c; color: #fff; padding: 3px 10px; border-radius: 6px;
    }
    .ktx-train  { font-size: 12px; color: rgba(255,255,255,.7); }
    .ktx-route  { display: flex; align-items: center; gap: 0; margin-bottom: 14px; }
    .ktx-station { flex: 0 0 auto; text-align: center; }
    .ktx-time   { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .ktx-city   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }
    .ktx-mid    { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 10px; }
    .ktx-line   { width: 100%; height: 1px; background: rgba(255,255,255,.3); position: relative; }
    .ktx-line::after { content:''; position:absolute; right:-4px; top:-3px; width:7px; height:7px; border-top:1px solid rgba(255,255,255,.5); border-right:1px solid rgba(255,255,255,.5); transform:rotate(45deg); }
    .ktx-dur    { font-size: 10px; color: rgba(255,255,255,.6); }
    .ktx-info   { display: flex; gap: 8px; flex-wrap: wrap; }
    .ktx-tag    { font-size: 10px; color: rgba(255,255,255,.65); background: rgba(255,255,255,.1); padding: 3px 8px; border-radius: 999px; }
    .ktx-price     { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.15); display: flex; justify-content: space-between; align-items: flex-end; }
    .ktx-price-left { display: flex; flex-direction: column; gap: 2px; }
    .ktx-krw       { font-size: 15px; font-weight: 700; color: #fff; }
    .ktx-krw-label { font-size: 10px; color: rgba(255,255,255,.5); }
    .ktx-price-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .ktx-usdc      { font-size: 15px; font-weight: 700; color: rgba(255,255,255,.9); }
    .ktx-usdc-label { font-size: 10px; color: rgba(255,255,255,.45); }

    /* KTX 채팅 검색 */
    .ktx-chat-wrap  { display: flex; gap: 8px; align-items: flex-end; }
    .ktx-chat-input {
      flex: 1; border: 1.5px solid var(--line); border-radius: 20px;
      padding: 10px 14px; font-size: 13px; font-family: inherit;
      background: var(--surface); color: var(--text); resize: none;
      outline: none; line-height: 1.4; max-height: 80px; overflow-y: auto;
      transition: border-color .2s;
    }
    .ktx-chat-input:focus { border-color: var(--accent); }
    .ktx-chat-input::placeholder { color: var(--muted); }
    .ktx-chat-send {
      width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
      background: var(--accent); color: #fff; flex-shrink: 0;
      display: grid; place-items: center; transition: opacity .15s;
    }
    .ktx-chat-send:disabled { opacity: .45; cursor: default; }
    .ktx-chat-send:active:not(:disabled) { opacity: .75; }
    .ktx-chat-log { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; max-height: 260px; overflow-y: auto; }
    @keyframes ktxBlink { 0%,100%{opacity:1} 50%{opacity:0} }
    .ktx-cursor { display: inline-block; font-size: 13px; line-height: 1; color: var(--accent); animation: ktxBlink .7s step-start infinite; margin-left: 1px; }
    .ktx-bubble-row { display: flex; }
    .ktx-bubble-row.user  { justify-content: flex-end; }
    .ktx-bubble-row.agent { justify-content: flex-start; }
    .ktx-chat-bubble {
      font-size: 12px; padding: 8px 12px; border-radius: 16px;
      max-width: 85%; word-break: break-word; line-height: 1.5;
    }
    .ktx-bubble-row.user  .ktx-chat-bubble { background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
    .ktx-bubble-row.agent .ktx-chat-bubble { background: #eef4ff; color: var(--text); border-bottom-left-radius: 4px; }
    .ktx-agent-label { font-size: 10px; color: var(--muted); margin-bottom: 3px; display: flex; align-items: center; gap: 4px; }

    /* KTX 에이전트 스텝 진행 */
    .ktx-steps  { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
    .ktx-step   { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
    .ktx-step-dot {
      width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--line);
      display: grid; place-items: center; flex-shrink: 0; font-size: 10px; transition: all .3s;
    }
    .ktx-step-dot.active { border-color: var(--accent); background: #edf4ff; color: var(--accent); }
    .ktx-step-dot.done   { border-color: var(--success); background: var(--success); color: #fff; }
    .ktx-step.active     { color: var(--text); font-weight: 600; }
    .ktx-step.done       { color: var(--success); }

    /* Bottom tab bar — sticks to bottom of #app */
    .tab-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      display: none;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0,0,0,.07);
      z-index: 10;
      padding: 4px 8px 8px;
    }
    .tab-bar-inner { display: flex; }
    .tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0 4px; border: none; background: none; cursor: pointer; color: var(--muted); font-size: 10px; font-weight: 500; transition: color .15s; }
    .tab-item .ico { width: 24px; height: 24px; display: block; transition: transform .15s; }
    .tab-item.active { color: var(--primary); font-weight: 700; }
    .tab-item.active .ico { transform: translateY(-1px); }

    /* Intro screen */
    .hero-screen { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 16px; padding: 40px 28px; background: linear-gradient(180deg, #eef4fb 0%, #f7fafc 100%); }
    .logo    { width: 76px; height: 76px; display: grid; place-items: center; overflow: hidden; }
    .logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .hero-screen h1 { font-size: 27px; line-height: 1.22; font-weight: 700; }
    .hero-screen p  { font-size: 14px; color: var(--muted); max-width: 260px; line-height: 1.6; }

    /* PassKey screen */
    .passkey-box  { text-align: center; padding: 36px 20px 28px; }
    .passkey-icon { font-size: 52px; margin-bottom: 10px; }
    .empty { text-align: center; padding: 30px; color: var(--muted); font-size: 13px; }

    /* ── M2M Registration Modal ─────────────────────── */
    .modal-overlay {
      position: absolute; inset: 0;
      background: rgba(15,23,42,.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 200; display: none;
      align-items: flex-end;
    }
    .modal-overlay.open { display: flex; }
    .modal {
      background: var(--card); border-radius: 28px 28px 0 0;
      padding: 12px 20px 40px; width: 100%;
      max-height: 88%; overflow-y: auto;
    }
    .modal::-webkit-scrollbar { display: none; }
    .modal-handle { width: 36px; height: 4px; background: var(--line); border-radius: 2px; margin: 0 auto 20px; }
    .step-bar { display: flex; gap: 6px; margin-bottom: 24px; }
    .step-dot { flex: 1; height: 4px; border-radius: 2px; background: #e5edf7; transition: background .3s; }
    .step-dot.active { background: var(--primary); }
    .step-dot.done   { background: var(--accent); }
    .step-panel { display: none; }
    .step-panel.active { display: block; }
    .step-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    .step-desc  { font-size: 13px; color: var(--muted); line-height: 1.55; margin-bottom: 20px; }
    .key-input-wrap { position: relative; }
    .key-input {
      width: 100%; border: 1.5px solid var(--line); border-radius: 12px;
      padding: 12px 44px 12px 14px; font-size: 13px; font-family: monospace;
      outline: none; transition: border-color .15s;
    }
    .key-input:focus { border-color: var(--accent); }
    .key-eye {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: var(--muted);
      display: grid; place-items: center;
    }

    /* ── Agent card ─────────────────────────────────── */
    .agent-card {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px; background: linear-gradient(135deg,#f0f7ff,#fff);
      border: 1.5px solid #c8ddf5; border-radius: 14px; margin-bottom: 12px;
    }
    .agent-avatar {
      width: 44px; height: 44px; border-radius: 14px;
      background: linear-gradient(135deg, var(--primary) 0%, #0060c0 100%);
      display: grid; place-items: center; flex-shrink: 0;
      font-size: 13px; font-weight: 800; color: #fff; letter-spacing: -.5px;
    }
    .agent-info   { flex: 1; min-width: 0; }
    .agent-name   { font-size: 14px; font-weight: 700; }
    .agent-sub    { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .agent-addr   { font-size: 10px; color: var(--muted); font-family: monospace; margin-top: 4px; word-break: break-all; }
    .agent-stat   { font-size: 11px; color: var(--accent); font-weight: 600; margin-top: 6px; }

    /* ── Activity feed ──────────────────────────────── */
    .activity-feed { display: flex; flex-direction: column; gap: 8px; }
    .activity-empty { text-align: center; padding: 16px 0; color: var(--muted); font-size: 12px; }
    .activity-item {
      padding: 10px 12px; border-radius: 10px;
      background: #f8fbff; border: 1px solid var(--line);
      animation: actIn .22s ease;
    }
    @keyframes actIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
    .activity-top      { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .activity-agent    { font-size: 12px; font-weight: 700; color: var(--primary); }
    .activity-time     { font-size: 10px; color: var(--muted); }
    .activity-endpoint { font-size: 11px; color: var(--muted); font-family: monospace; margin-bottom: 3px; }
    .activity-result   { font-size: 12px; font-weight: 600; }
    .activity-result.ok  { color: var(--success); }
    .activity-result.err { color: var(--danger); }
    .activity-result.pending { color: var(--accent); }

    /* ── M2M empty state ────────────────────────────── */
    .m2m-empty { text-align: center; padding: 28px 16px 20px; }
    .m2m-empty-icon  { font-size: 40px; margin-bottom: 10px; }
    .m2m-empty-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .m2m-empty-desc  { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 18px; }

    /* Category toggle chips (registration step 3) */
    .cat-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .cat-chip  {
      padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
      border: 1.5px solid var(--line); background: #fff; color: var(--muted);
      cursor: pointer; transition: all .15s; user-select: none;
    }
    .cat-chip.on { background: var(--primary); color: #fff; border-color: var(--primary); }
  </style>
</head>
<body>
${JBBANK_LOGO_SRC ? `<img src="${JBBANK_LOGO_SRC}" style="position:fixed;bottom:-120px;right:-120px;width:600px;height:600px;object-fit:contain;opacity:0.07;pointer-events:none;z-index:0;user-select:none;filter:blur(18px)" draggable="false" aria-hidden="true">` : ""}
<div class="device-wrap">
<div class="device">

  <!-- Physical side buttons -->
  <div class="btn-power"></div>
  <div class="device-btns">
    <div class="btn-mute"></div>
    <div class="btn-vol-up"></div>
    <div class="btn-vol-down"></div>
  </div>

  <!-- Display -->
  <div class="device-screen">

    <!-- Dynamic Island (absolute, doesn't shift flex layout) -->
    <div class="di"></div>

    <!-- Status Bar (sits below DI visually, 54px tall) -->
    <div class="status-bar">
      <span class="sb-time" id="sb-time">9:41</span>
      <div class="sb-icons">
        <!-- Cellular signal -->
        <svg width="17" height="12" viewBox="0 0 17 12" fill="var(--text)">
          <rect x="0"  y="7"  width="3" height="5" rx="1" opacity=".3"/>
          <rect x="4.5" y="4.5" width="3" height="7.5" rx="1" opacity=".5"/>
          <rect x="9"  y="2"  width="3" height="10" rx="1" opacity=".75"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1"/>
        </svg>
        <!-- WiFi -->
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <circle cx="8" cy="10.5" r="1.5" fill="var(--text)"/>
          <path d="M4.2 7.2a5.5 5.5 0 0 1 7.6 0" stroke="var(--text)" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
          <path d="M1.5 4.5a9 9 0 0 1 13 0" stroke="var(--text)" stroke-width="1.4" stroke-linecap="round" opacity=".4"/>
        </svg>
        <!-- Battery -->
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="var(--text)" stroke-opacity=".35"/>
          <rect x="2" y="2" width="16" height="8" rx="2" fill="var(--text)"/>
          <path d="M23 4v4a2 2 0 0 0 0-4Z" fill="var(--text)" opacity=".4"/>
        </svg>
      </div>
    </div>

    <!-- App root: all screens live here -->
    <div id="app">

      <!-- M0 · Intro -->
      <div class="screen active" id="M0">
        <div class="hero-screen">
          <div class="logo">${JBBANK_LOGO_SRC ? `<img src="${JBBANK_LOGO_SRC}" alt="JB Bank">` : "JB"}</div>
          <div class="eyebrow">x402 Protocol Demo</div>
          <h1>디지털자산 지갑</h1>
          <p>x402 프로토콜 기반 Base USDC(Sepolia) 결제 연동</p>
          <button class="btn" id="m0-btn" onclick="startWithPasskey()" style="margin-top:8px;max-width:240px;display:flex;align-items:center;justify-content:center;gap:8px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            PassKey로 시작
          </button>
          <div id="m0-err" style="font-size:12px;color:var(--danger);margin-top:10px;display:none"></div>
          <button id="m0-skip" onclick="go('M1')" style="display:none;margin-top:6px;font-size:12px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline">PassKey 없이 계속</button>
        </div>
      </div>

      <!-- M1 · Account -->
      <div class="screen" id="M1">
        <div class="top-nav">
          <div class="spacer"></div>
          <div class="title">디지털자산 지갑</div>
          <div class="spacer"></div>
        </div>
        <div class="content">
          <div class="card primary">
            <div class="lbl">디지털자산 지갑 잔고</div>
            <div class="amount" id="m1-balance">—</div>
            <div class="meta"  id="m1-usage">—</div>
          </div>
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:14px">카테고리 사용량</div>
            <div class="gauge">
              <div class="gauge-header"><span>교통</span><span id="m1-transport-label">—</span></div>
              <div class="bar"><div class="fill" id="m1-transport"></div></div>
            </div>
            <div class="gauge">
              <div class="gauge-header"><span>숙박</span><span id="m1-stay-label">—</span></div>
              <div class="bar"><div class="fill green" id="m1-stay"></div></div>
            </div>
            <div class="gauge">
              <div class="gauge-header"><span>식음료</span><span id="m1-food-label">—</span></div>
              <div class="bar"><div class="fill orange" id="m1-food"></div></div>
            </div>
            <div class="gauge">
              <div class="gauge-header"><span>콘텐츠</span><span id="m1-content-label">—</span></div>
              <div class="bar"><div class="fill" id="m1-content"></div></div>
            </div>
          </div>
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:10px">최근 거래</div>
            <div id="m1-tx"><div class="empty">거래 내역이 없습니다.</div></div>
          </div>
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:10px">위임 AI</div>
            <div class="setting-row"><span>이름</span><span class="chip" id="m1-ai-name">—</span></div>
            <div class="setting-row"><span>신뢰등급</span><span class="chip" id="m1-ai-trust">—</span></div>
            <div class="setting-row"><span>자동결제</span><span class="chip" id="m1-ai-auto">—</span></div>
            <div class="setting-row"><span>만료</span><span class="chip" id="m1-ai-exp">—</span></div>
          </div>
          <button class="btn secondary" onclick="resetDemo()">데모 상태 초기화</button>
          <div class="status" id="m1-status"></div>
        </div>
      </div>

      <!-- M2 · Payment -->
      <div class="screen" id="M2">
        <div class="top-nav">
          <button class="back" onclick="go('M1')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            자산
          </button>
          <div class="spacer"></div>
          <div class="title">결제</div>
          <div class="spacer"></div>
        </div>
        <div class="content">

          <!-- ① 초소액 결제 아코디언 -->
          <div class="accordion">
            <div class="accordion-hd" id="acc-hd-0" onclick="toggleAccordion(0)">
              <div class="accordion-hd-left">
                <div class="accordion-hd-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/></svg>
                  초소액 결제
                </div>
                <div class="accordion-hd-sub">콘텐츠 구독 · 5건 · 0.025 USDC</div>
              </div>
              <svg class="accordion-chevron" id="acc-cv-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="accordion-body" id="acc-bd-0">
              <div class="accordion-inner">
                <div class="sub" style="margin-bottom:10px">기사당 0.005 USDC · x402 실제 온체인 결제</div>
                <div id="m2-list" class="list">
                  <div class="list-item"><div class="list-item-info"><span class="list-item-title">AI 금융 인프라의 재편</span><span class="list-item-price">0.005 USDC</span></div><span class="chip">대기</span></div>
                  <div class="list-item"><div class="list-item-info"><span class="list-item-title">에이전트 결제 UX 트렌드</span><span class="list-item-price">0.005 USDC</span></div><span class="chip">대기</span></div>
                  <div class="list-item"><div class="list-item-info"><span class="list-item-title">x402와 은행 계좌 구조</span><span class="list-item-price">0.005 USDC</span></div><span class="chip">대기</span></div>
                  <div class="list-item"><div class="list-item-info"><span class="list-item-title">출장 데이터 자동화</span><span class="list-item-price">0.005 USDC</span></div><span class="chip">대기</span></div>
                  <div class="list-item"><div class="list-item-info"><span class="list-item-title">마이크로결제 수익성</span><span class="list-item-price">0.005 USDC</span></div><span class="chip">대기</span></div>
                </div>
                <button class="btn" id="m2-run" onclick="runMicropayment()" style="margin-top:12px">5건 순차 결제 실행</button>
                <div class="status" id="m2-status"></div>
              </div>
            </div>
          </div>

          <!-- ② 에이전트 결제 아코디언 -->
          <div class="accordion">
            <div class="accordion-hd" id="acc-hd-1" onclick="toggleAccordion(1)">
              <div class="accordion-hd-left">
                <div class="accordion-hd-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2a5 5 0 0 1 5 5c0 2-.8 3.8-2 5"/><path d="M12 2a5 5 0 0 0-5 5c0 2 .8 3.8 2 5"/><path d="M8.5 12c0 2 .8 3.8 2 4.8"/><path d="M15.5 12c0 2-.8 3.8-2 4.8"/><path d="M11 21.8c.3.1.6.2 1 .2s.7-.1 1-.2"/></svg>
                  에이전트 결제
                </div>
                <div class="accordion-hd-sub">KTX 열차 예약 · ClaudeAssist 자율 처리</div>
              </div>
              <svg class="accordion-chevron" id="acc-cv-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="accordion-body" id="acc-bd-1">
              <div class="accordion-inner">


                <!-- 채팅 로그 -->
                <div class="ktx-chat-log" id="ktx-chat-log">
                  <div class="ktx-bubble-row agent">
                    <div>
                      <div class="ktx-agent-label">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a5 5 0 0 1 5 5c0 2-.8 3.8-2 5"/><path d="M12 2a5 5 0 0 0-5 5c0 2 .8 3.8 2 5"/><path d="M8.5 12c0 2 .8 3.8 2 4.8"/><path d="M15.5 12c0 2-.8 3.8-2 4.8"/><path d="M11 21.8c.3.1.6.2 1 .2s.7-.1 1-.2"/></svg>
                        ClaudeAssist
                      </div>
                      <div class="ktx-chat-bubble" id="ktx-greeting-bubble"><span id="ktx-greeting-text"></span><span class="ktx-cursor" id="ktx-greeting-cursor">▍</span></div>
                    </div>
                  </div>
                </div>

                <!-- 열차 결과 카드 (검색 완료 후 표시) -->
                <div id="ktx-result-area" style="display:none;margin-bottom:12px">
                  <div style="font-size:10px;color:var(--muted);margin-bottom:6px;opacity:.7">
                    ※ 코레일 API 미연동 — USDC 결제 완료 시 예약 확정 처리
                  </div>
                  <div class="ktx-card" id="ktx-card-dynamic"></div>
                  <div class="ktx-steps" id="ktx-steps" style="display:none;margin:10px 0">
                    <div class="ktx-step" id="ktx-s0"><div class="ktx-step-dot" id="ktx-d0">1</div><span>열차 정보 확인</span></div>
                    <div class="ktx-step" id="ktx-s1"><div class="ktx-step-dot" id="ktx-d1">2</div><span>좌석 가용 확인</span></div>
                    <div class="ktx-step" id="ktx-s2"><div class="ktx-step-dot" id="ktx-d2">3</div><span>x402 USDC 결제</span></div>
                    <div class="ktx-step" id="ktx-s3"><div class="ktx-step-dot" id="ktx-d3">4</div><span>예약 완료</span></div>
                  </div>
                  <button class="btn" id="ktx-run" onclick="runKtxReserve()" style="margin-top:8px">
                    🤖 에이전트 결제 · 예약 확정
                  </button>
                  <div id="ktx-pay-err" style="display:none;font-size:12px;color:var(--danger);margin-top:8px;padding:0 2px"></div>
                  <div id="ktx-complete-card" style="display:none;margin-top:12px;background:#f0faf5;border:1px solid #c2efd1;border-radius:14px;padding:16px;text-align:center">
                    <div style="font-size:26px;margin-bottom:6px">🎫</div>
                    <div style="font-size:15px;font-weight:700;color:#0f6a3e;margin-bottom:6px">예약 완료</div>
                    <div id="ktx-complete-detail" style="font-size:12px;color:var(--muted);line-height:1.6"></div>
                    <div style="font-size:10px;color:var(--muted);margin-top:8px;opacity:.7">코레일 예약번호는 실제 API 연동 시 발급됩니다</div>
                  </div>
                </div>

                <!-- 입력창 -->
                <div class="ktx-chat-wrap">
                  <textarea id="ktx-query" class="ktx-chat-input" rows="1"
                    placeholder="메시지를 입력하세요"
                    onkeydown="if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();runKtxSearch()}"
                    oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
                  ></textarea>
                  <button class="ktx-chat-send" id="ktx-search-btn" onclick="runKtxSearch()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
                <div id="ktx-search-err" style="display:none;font-size:12px;color:var(--danger);margin-top:6px;padding:0 2px"></div>

              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- M3 · Settings -->
      <div class="screen" id="M3">
        <div class="top-nav">
          <div class="spacer"></div>
          <div class="title">설정</div>
          <div class="spacer"></div>
        </div>
        <div class="content">
          <div class="tabs">
            <button class="tab active" onclick="setTab(0)">예산</button>
            <button class="tab"        onclick="setTab(1)">자동승인</button>
            <button class="tab"        onclick="setTab(2)">M2M</button>
          </div>
          <div id="tab-0">
            <div class="card">
              <div class="setting-row">
                <div>
                  <div>가용 예산</div>
                  <div class="sub" style="margin-top:2px">현재 지갑 잔고 기준</div>
                </div>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-budget-total" type="number" step="0.0001" placeholder="0.0000">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row">
                <span>자동 갱신</span>
                <button class="toggle-btn" id="s-budget-renew" onclick="toggleBtn('s-budget-renew')">ON</button>
              </div>
            </div>
            <div class="card">
              <div style="font-size:15px;font-weight:700;margin-bottom:12px">카테고리별 한도</div>
              <div class="setting-row">
                <span>교통</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-cat-transport" type="number" step="0.01" placeholder="0.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row">
                <span>숙박</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-cat-stay" type="number" step="0.01" placeholder="0.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row">
                <span>식음료</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-cat-food" type="number" step="0.01" placeholder="0.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row">
                <span>콘텐츠</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-cat-content" type="number" step="0.01" placeholder="0.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
            </div>
            <button class="btn" onclick="saveBudget()">저장</button>
          </div>
          <div id="tab-1" style="display:none">
            <div class="card">
              <div class="setting-row">
                <span>자동 결제 활성화</span>
                <button class="toggle-btn" id="s-auto-enabled" onclick="toggleBtn('s-auto-enabled')">ON</button>
              </div>
              <div class="setting-row">
                <span>이하 자동 승인</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-auto-under" type="number" step="0.001" placeholder="0.000">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row">
                <span>이상 확인 필요</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-auto-over" type="number" step="0.001" placeholder="0.000">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row">
                <span>일 한도 캡</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-auto-daily" type="number" step="0.001" placeholder="0.000">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row"><span>오늘 누적</span><span class="chip" id="s-auto-today">—</span></div>
            </div>
            <button class="btn" onclick="saveAutoCharge()">저장</button>
          </div>
          <div id="tab-2" style="display:none">
            <div class="card">
              <div class="setting-row">
                <span>M2M 결제 활성화</span>
                <button class="toggle-btn" id="s-m2m-enabled" onclick="toggleM2mEnabled()">ON</button>
              </div>
              <div class="setting-row"><span>네트워크</span><span class="chip" id="s-m2m-net">—</span></div>
              <div class="setting-row">
                <span>요청당 최대</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-m2m-req" type="number" step="0.01" placeholder="0.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row" style="border:none">
                <span>세션 한도</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="s-m2m-sess" type="number" step="0.01" placeholder="0.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
            </div>
            <button class="btn secondary" style="margin-bottom:14px" onclick="saveM2m()">설정 저장</button>
            <!-- 동적 렌더링: 에이전트 미등록 시 empty state, 등록 후 카드+게이지+피드 -->
            <div id="m2m-agent-section"></div>
          </div>
          <div class="status" id="m3-status"></div>
        </div>
      </div>

      <!-- M4 · Wallet -->
      <div class="screen" id="M4">
        <div class="top-nav">
          <div class="spacer"></div>
          <div class="title">지갑</div>
          <div class="spacer"></div>
        </div>
        <div class="content">

          <!-- 지갑 잔고 카드 -->
          <div class="card primary">
            <div class="lbl">디지털자산 잔고</div>
            <div class="amount" id="m4-balance">—</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
              <div>
                <div style="font-size:10px;color:rgba(255,255,255,.6);margin-bottom:3px">지갑 주소</div>
                <div style="font-family:monospace;font-size:11px;color:rgba(255,255,255,.9)" id="m4-addr">—</div>
              </div>
              <div style="display:flex;gap:8px">
                <button onclick="copyAddress()" style="font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;border:none;cursor:pointer;background:rgba(255,255,255,.18);color:#fff">복사</button>
                <button onclick="openBaseScan()" style="font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;border:none;cursor:pointer;background:rgba(255,255,255,.18);color:#fff">BaseScan</button>
              </div>
            </div>
          </div>

          <!-- 자산 목록 -->
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:12px">보유 자산</div>
            <div class="setting-row">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:32px;height:32px;border-radius:50%;background:#2775ca;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:800">$</div>
                <div>
                  <div style="font-size:13px;font-weight:600">USD Coin</div>
                  <div style="font-size:11px;color:var(--muted)">USDC · Base Sepolia</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:14px;font-weight:700" id="m4-usdc">—</div>
                <div style="font-size:11px;color:var(--muted)">USDC</div>
              </div>
            </div>
            <div class="setting-row" style="border:none">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:32px;height:32px;border-radius:50%;background:#627eea;display:grid;place-items:center;color:#fff;font-size:11px;font-weight:800">Ξ</div>
                <div>
                  <div style="font-size:13px;font-weight:600">Ethereum</div>
                  <div style="font-size:11px;color:var(--muted)">ETH · 가스비</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:14px;font-weight:700" id="m4-eth">—</div>
                <div style="font-size:11px;color:var(--muted)">ETH</div>
              </div>
            </div>
          </div>

          <!-- 네트워크 정보 -->
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:12px">네트워크</div>
            <div class="setting-row"><span>체인</span><span class="chip">Base Sepolia</span></div>
            <div class="setting-row"><span>체인 ID</span><span class="chip">84532</span></div>
            <div class="setting-row" style="border:none"><span>Facilitator</span><span style="font-size:11px;color:var(--muted)">x402.org</span></div>
          </div>

          <!-- 보안 -->
          <div class="card">
            <div style="font-size:15px;font-weight:700;margin-bottom:12px">보안</div>
            <div class="setting-row" style="border:none">
              <div>
                <div style="font-size:13px;font-weight:600">PassKey</div>
                <div style="font-size:11px;color:var(--muted);margin-top:2px">생체인식으로 결제 서명을 보호합니다</div>
              </div>
              <button class="btn secondary" id="m4-passkey-btn" onclick="registerWalletPasskey()" style="width:auto;padding:8px 14px;font-size:12px;margin:0">등록</button>
            </div>
            <div class="status" id="m4-passkey-status"></div>
          </div>

          <div class="status" id="m4-copy-status"></div>
        </div>
      </div>

      <!-- Bottom Tab Bar -->
      <div class="tab-bar" id="tab-bar">
        <div class="tab-bar-inner">
          <button class="tab-item active" onclick="go('M1')" data-nav="M1">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M22 7V6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/>
              <circle cx="16" cy="14" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
            <span>자산</span>
          </button>
          <button class="tab-item" onclick="go('M2')" data-nav="M2">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
              <line x1="6" y1="15" x2="9" y2="15"/>
            </svg>
            <span>결제</span>
          </button>
          <button class="tab-item" onclick="go('M4')" data-nav="M4">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="3"/>
              <path d="M16 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
              <path d="M2 10h20"/>
              <path d="M6 4l4-1.5 4 1.5"/>
            </svg>
            <span>지갑</span>
          </button>
          <button class="tab-item" onclick="go('M3')" data-nav="M3">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
              <circle cx="8"  cy="6"  r="2.2" fill="var(--surface)" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="16" cy="12" r="2.2" fill="var(--surface)" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="11" cy="18" r="2.2" fill="var(--surface)" stroke="currentColor" stroke-width="1.8"/>
            </svg>
            <span>설정</span>
          </button>
        </div>
      </div>

      <!-- M2M 에이전트 등록 모달 -->
      <div class="modal-overlay" id="m2m-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="step-bar">
            <div class="step-dot active" id="sd-0"></div>
            <div class="step-dot" id="sd-1"></div>
            <div class="step-dot" id="sd-2"></div>
          </div>

          <!-- Step 1: API Key -->
          <div class="step-panel active" id="sp-0">
            <div class="step-title">Claude API 연결</div>
            <div class="step-desc">Anthropic 콘솔에서 발급한 API 키를 입력하세요. 키는 암호화되어 저장됩니다.</div>
            <div class="key-input-wrap">
              <input class="key-input" id="reg-apikey" type="password" placeholder="sk-ant-api03-...">
              <button class="key-eye" onclick="toggleKeyVis()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <button class="btn" style="margin-top:14px" onclick="verifyApiKey()">연결 확인</button>
            <div class="status" id="reg-s0"></div>
          </div>

          <!-- Step 2: PassKey 승인 -->
          <div class="step-panel" id="sp-1">
            <div class="step-title">에이전트 지갑 생성</div>
            <div class="step-desc">전북은행이 ClaudeAssist 전용 서브월렛을 생성합니다. PassKey로 생성을 승인해주세요.</div>
            <div class="card" style="background:#f8fbff;margin-bottom:0">
              <div class="setting-row" style="border:none;padding:6px 0">
                <span style="font-size:12px;color:var(--muted)">생성될 주소</span>
                <span style="font-family:monospace;font-size:11px;color:var(--text)" id="reg-addr">—</span>
              </div>
            </div>
            <button class="btn" style="margin-top:14px" onclick="passkeyApprove()">
              <svg style="vertical-align:middle;margin-right:6px" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              승인하기
            </button>
            <div class="status" id="reg-s1"></div>
          </div>

          <!-- Step 3: 위임 한도 -->
          <div class="step-panel" id="sp-2">
            <div class="step-title">위임 한도 설정</div>
            <div class="step-desc">ClaudeAssist가 자율 결제할 수 있는 한도와 허용 카테고리를 설정합니다.</div>
            <div class="card" style="margin-bottom:12px">
              <div class="setting-row">
                <span>요청당 최대</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="reg-per-req" type="number" step="0.01" value="0.05">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
              <div class="setting-row" style="border:none">
                <span>세션 한도</span>
                <div class="setting-input-wrap">
                  <input class="setting-input" id="reg-session" type="number" step="0.01" value="1.00">
                  <span class="setting-unit">USDC</span>
                </div>
              </div>
            </div>
            <div style="font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:600">허용 카테고리</div>
            <div class="cat-chips">
              <span class="cat-chip on" onclick="toggleCat(this)">콘텐츠</span>
              <span class="cat-chip on" onclick="toggleCat(this)">교통</span>
              <span class="cat-chip" onclick="toggleCat(this)">숙박</span>
              <span class="cat-chip" onclick="toggleCat(this)">식음료</span>
            </div>
            <button class="btn" style="margin-top:16px" onclick="completeRegistration()">등록 완료</button>
            <button class="btn secondary" style="margin-top:8px" onclick="closeRegister()">취소</button>
            <div class="status" id="reg-s2"></div>
          </div>
        </div>
      </div>

    </div><!-- /#app -->

    <!-- Home indicator pill (flex child of .device-screen) -->
    <div class="home-bar"><div class="home-pill"></div></div>

  </div><!-- /.device-screen -->
</div><!-- /.device -->
</div><!-- /.device-wrap -->

<script>
const $ = id => document.getElementById(id);

/* ── Mobile UA detection: hide mockup status bar on real devices ── */
if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  document.body.classList.add('is-mobile');
}

/* ── Auto-scale device to fit viewport ─────────────── */
function scaleDevice() {
  // 24px gap on each edge (top+bottom, left+right)
  const gap = 24;
  const scaleH = (window.innerHeight - gap * 2) / 852;
  const scaleW = (window.innerWidth  - gap * 2) / 393;
  // never upscale beyond native size
  const scale = Math.min(scaleH, scaleW, 1);
  document.documentElement.style.setProperty('--device-scale', scale.toFixed(4));
}
scaleDevice();
window.addEventListener('resize', scaleDevice);

/* ── M0: PassKey 인증 후 진입 ─────────────────────── */
async function startWithPasskey() {
  const btn  = $('m0-btn');
  const err  = $('m0-err');
  const skip = $('m0-skip');
  btn.disabled = true;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 인증 중...';
  err.style.display  = 'none';
  skip.style.display = 'none';

  if (!window.PublicKeyCredential) {
    err.textContent = 'PassKey를 지원하지 않는 브라우저입니다.';
    err.style.display = 'block';
    skip.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> PassKey로 시작';
    return;
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'JB은행', id: location.hostname },
        user: {
          id: new TextEncoder().encode('jbbank-demo-user'),
          name: 'demo@jbbank.co.kr',
          displayName: '데모 사용자',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'required' },
        timeout: 60000,
        attestation: 'none',
      },
    });
    go('M1');
  } catch (e) {
    const msg = e.name === 'NotAllowedError' ? '인증이 취소되었습니다.' : e.message;
    err.textContent = msg;
    err.style.display  = 'block';
    skip.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> PassKey로 시작';
  }
}

/* Live clock */
function updateClock() {
  const d = new Date();
  $('sb-time').textContent =
    d.getHours().toString().padStart(2,'0') + ':' +
    d.getMinutes().toString().padStart(2,'0');
}
updateClock();
setInterval(updateClock, 30000);

/* Screen navigation */
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  document.querySelectorAll('.tab-item').forEach(n =>
    n.classList.toggle('active', n.dataset.nav === id)
  );
  const tb = $('tab-bar');
  if (id === 'M0') {
    tb.style.display = 'none';
  } else {
    tb.style.display = 'block';
    if (id === 'M1') loadAccount();
    if (id === 'M3') loadSettings();
    if (id === 'M4') loadWallet();
  }
}

function showStatus(id, text, ok) {
  const el = $(id);
  el.textContent = text;
  el.className = 'status show ' + (ok ? 'ok' : 'err');
}

function fmtAmt(n) { return Number(n).toLocaleString('en-US') + ' USDC'; }
function fmtKrw(n) { return '₩' + Number(n).toLocaleString('ko-KR'); }

/* ── M1: Account ──────────────────────────────────── */
async function loadAccount() {
  try {
    const [accountRes, balanceRes] = await Promise.all([
      fetch('/api/demo/account'),
      fetch('/api/free/balances').catch(() => null),
    ]);
    const d = await accountRes.json();

    if (balanceRes && balanceRes.ok) {
      const bal = await balanceRes.json();
      const agent = bal.wallets?.find(w => w.role === 'payer');
      if (agent) {
        $('m1-balance').textContent = parseFloat(agent.usdc).toFixed(4) + ' USDC';
        $('m1-usage').textContent = 'Base Sepolia · ' + parseFloat(agent.eth).toFixed(5) + ' ETH (gas)';
      } else {
        $('m1-balance').textContent = fmtKrw(d.balanceKrw);
        $('m1-usage').textContent = '한도 ' + fmtKrw(d.monthlyLimitKrw) + ' / 사용 ' + fmtKrw(d.usedKrw);
      }
    } else {
      $('m1-balance').textContent = fmtAmt(d.balanceKrw);
      $('m1-usage').textContent = 'Limit ' + fmtAmt(d.monthlyLimitKrw) + ' / Spent ' + fmtAmt(d.usedKrw);
    }

    // 카테고리별 USDC 실결제 누계
    const usdcByCategory = { transport: 0, stay: 0, food: 0, content: 0 };
    d.transactions.forEach(t => {
      if (t.status === 'approved' && t.amountUsdc && t.category in usdcByCategory) {
        usdcByCategory[t.category] += parseFloat(t.amountUsdc);
      }
    });

    const setGauge = (cat) => {
      const used  = usdcByCategory[cat] ?? 0;
      const limit = d.categoryLimitsUsdc?.[cat] ?? 0;
      const pct   = limit ? Math.min(100, (used / limit) * 100) : 0;
      $('m1-' + cat + '-label').textContent =
        used.toFixed(4) + ' USDC / ' + limit.toFixed(2) + ' USDC';
      $('m1-' + cat).style.width = pct + '%';
    };
    setGauge('transport');
    setGauge('stay');
    setGauge('food');
    setGauge('content');

    const txEl = $('m1-tx');
    if (!d.transactions.length) {
      txEl.innerHTML = '<div class="empty">거래 내역이 없습니다.</div>';
    } else {
      txEl.innerHTML = d.transactions.slice(0, 10).map(t => {
        const sign = t.status === 'approved' ? '-' : '';
        const cls  = t.status === 'approved' ? 'minus' : 'plus';
        // amountUsdc가 있으면 실제 온체인 금액(USDC)을, 없으면 원화로 표시
        const amtLabel = t.amountUsdc
          ? sign + t.amountUsdc + ' USDC'
          : sign + '₩' + Number(t.amountKrw).toLocaleString('ko-KR');
        return '<div class="tx-row"><div class="tx-left"><div class="tx-icon">' +
          (t.status === 'approved' ? '💸' : '🛡️') +
          '</div><div class="tx-info"><span class="tx-name">' + t.merchant +
          '</span><span class="tx-time">' + new Date(t.createdAt).toLocaleString('ko-KR') +
          '</span></div></div><span class="tx-amt ' + cls + '">' + amtLabel + '</span></div>';
      }).join('');
    }

    $('m1-ai-name').textContent  = d.delegatedAi.name;
    $('m1-ai-trust').textContent = d.delegatedAi.trustGrade;
    $('m1-ai-auto').textContent  = d.delegatedAi.autoPayment ? 'ON' : 'OFF';
    $('m1-ai-exp').textContent   = 'D-' + d.delegatedAi.expiresInDays;
  } catch (e) {
    showStatus('m1-status', '조회 실패: ' + e.message, false);
  }
}

async function resetDemo() {
  if (!confirm('데모 상태를 초기화하시겠습니까?')) return;
  try {
    await fetch('/api/demo/reset', { method: 'POST' });
    loadAccount();
    showStatus('m1-status', '초기화 완료', true);
  } catch (e) {
    showStatus('m1-status', '초기화 실패: ' + e.message, false);
  }
}

/* ── Accordion ────────────────────────────────────── */
function toggleAccordion(idx) {
  const hd = $('acc-hd-' + idx);
  const bd = $('acc-bd-' + idx);
  const cv = $('acc-cv-' + idx);
  const isOpen = bd.classList.contains('open');
  hd.classList.toggle('open', !isOpen);
  bd.classList.toggle('open', !isOpen);
  cv.classList.toggle('open', !isOpen);
  // KTX 아코디언(idx=1) 첫 오픈 시 인사말 타이핑 효과
  if (idx === 1 && !isOpen && !ktxGreetingPlayed) {
    ktxGreetingPlayed = true;
    setTimeout(ktxPlayGreeting, 280); // accordion 열리는 애니 후 시작
  }
}

let ktxGreetingPlayed = false;
function ktxPlayGreeting() {
  const full = '안녕하세요! KTX 예약을 도와드릴게요.\n어디서 어디로 가실 건가요?';
  const textEl = $('ktx-greeting-text');
  const cursor = $('ktx-greeting-cursor');
  if (!textEl) return;
  let i = 0;
  const tick = setInterval(function() {
    if (i >= full.length) {
      clearInterval(tick);
      cursor.style.display = 'none';
      return;
    }
    const ch = full[i++];
    if (ch === '\n') {
      textEl.appendChild(document.createElement('br'));
    } else {
      textEl.appendChild(document.createTextNode(ch));
    }
    const log = $('ktx-chat-log');
    log.scrollTop = log.scrollHeight;
  }, 35);
}

/* ── M2: Micropayment ─────────────────────────────── */
async function runMicropayment() {
  const btn = $('m2-run');
  btn.disabled = true; btn.textContent = '결제 진행 중...';
  $('m2-status').className = 'status';
  const items = document.querySelectorAll('#m2-list .list-item');
  items.forEach(i => { i.classList.remove('done'); const c = i.querySelector('.chip'); c.textContent = '대기'; c.style.color = ''; });

  try {
    const res = await fetch('/api/demo/micropayment', { method: 'POST' });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    d.steps.forEach((step, i) => {
      if (items[i]) {
        items[i].classList.add('done');
        items[i].querySelector('.chip').textContent = '결제 완료';
      }
    });
    const totalUsdc = d.steps.reduce((s, x) => s + parseFloat(x.usdcPrice || '0'), 0);
    showStatus('m2-status', '5건 결제 완료 · 총 ' + totalUsdc.toFixed(3) + ' USDC', true);
  } catch (e) {
    // 아직 '대기' 상태인 항목을 '결제 실패'로 표시
    items.forEach(i => {
      if (i.querySelector('.chip').textContent === '대기') {
        i.querySelector('.chip').textContent = '결제 실패';
        i.querySelector('.chip').style.color = 'var(--danger)';
      }
    });
    showStatus('m2-status', '결제 실패: ' + e.message, false);
  } finally {
    btn.disabled = false; btn.textContent = '5건 순차 결제 실행';
  }
}

/* ── KTX 멀티턴 에이전트 챗 ────────────────────────── */
let ktxTrain = null;
let ktxMessages = [];  // {role, content} — Claude API 히스토리

function ktxPayErr(msg) {
  const el = $('ktx-pay-err');
  el.textContent = msg ? '⚠ ' + msg : '';
  el.style.display = msg ? 'block' : 'none';
}
function ktxSearchErr(msg) {
  const el = $('ktx-search-err');
  el.textContent = msg ? '⚠ ' + msg : '';
  el.style.display = msg ? 'block' : 'none';
}

function ktxMd(text) {
  // **bold** → <strong>bold</strong>, strip remaining lone *
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '$1')
    .split(String.fromCharCode(10)).join('<br>');
}
function ktxAppendBubble(role, text) {
  const log = $('ktx-chat-log');
  const row = document.createElement('div');
  row.className = 'ktx-bubble-row ' + role;
  if (role === 'agent') {
    row.innerHTML =
      '<div>' +
        '<div class="ktx-agent-label">' +
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a5 5 0 0 1 5 5c0 2-.8 3.8-2 5"/><path d="M12 2a5 5 0 0 0-5 5c0 2 .8 3.8 2 5"/><path d="M8.5 12c0 2 .8 3.8 2 4.8"/><path d="M15.5 12c0 2-.8 3.8-2 4.8"/><path d="M11 21.8c.3.1.6.2 1 .2s.7-.1 1-.2"/></svg>' +
          'ClaudeAssist' +
        '</div>' +
        '<div class="ktx-chat-bubble">' + ktxMd(text) + '</div>' +
      '</div>';
  } else {
    row.innerHTML = '<div class="ktx-chat-bubble">' + ktxMd(text) + '</div>';
  }
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

async function runKtxSearch() {
  const btn = $('ktx-search-btn');
  const textarea = $('ktx-query');
  const userText = textarea.value.trim();
  if (!userText) { textarea.focus(); return; }

  // 사용자 버블 추가 & 히스토리 업데이트
  ktxAppendBubble('user', userText);
  ktxMessages.push({ role: 'user', content: userText });
  textarea.value = '';
  textarea.style.height = 'auto';
  btn.disabled = true;
  ktxSearchErr('');

  // 로딩 버블
  const loadingRow = document.createElement('div');
  loadingRow.className = 'ktx-bubble-row agent';
  loadingRow.id = 'ktx-loading';
  loadingRow.innerHTML = '<div><div class="ktx-agent-label"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a5 5 0 0 1 5 5c0 2-.8 3.8-2 5"/><path d="M12 2a5 5 0 0 0-5 5c0 2 .8 3.8 2 5"/><path d="M8.5 12c0 2 .8 3.8 2 4.8"/><path d="M15.5 12c0 2-.8 3.8-2 4.8"/><path d="M11 21.8c.3.1.6.2 1 .2s.7-.1 1-.2"/></svg>ClaudeAssist</div><div class="ktx-chat-bubble" style="color:var(--muted)">···</div></div>';
  $('ktx-chat-log').appendChild(loadingRow);
  $('ktx-chat-log').scrollTop = $('ktx-chat-log').scrollHeight;

  try {
    const res = await fetch('/api/demo/ktx-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: ktxMessages }),
    });
    const d = await res.json();
    loadingRow.remove();
    if (!res.ok) throw new Error(d.error);

    if (d.type === 'question') {
      // 추가 질문 — 버블로 표시 후 대기
      ktxMessages.push({ role: 'assistant', content: d.message });
      ktxAppendBubble('agent', d.message);

    } else {
      // 열차 추천 — 카드 표시
      ktxMessages.push({ role: 'assistant', content: d.assistantMessage || '' });
      ktxAppendBubble('agent', '추천 열차를 찾았습니다. 아래에서 결제하실 수 있어요.');

      ktxTrain = { ...d.train,
        from: d.train.parsedFrom, to: d.train.parsedTo,
        date: d.train.parsedDate, passengers: d.train.parsedPassengers,
      };
      renderKtxCard(ktxTrain);
      $('ktx-steps').style.display = 'none';
      $('ktx-complete-card').style.display = 'none';
      $('ktx-run').style.display = '';
      $('ktx-run').disabled = false;
      ktxPayErr('');
      for (let i = 0; i < 4; i++) {
        $('ktx-d' + i).className = 'ktx-step-dot';
        $('ktx-d' + i).textContent = i + 1;
        $('ktx-s' + i).className = 'ktx-step';
      }
      $('ktx-result-area').style.display = 'block';
    }
  } catch (e) {
    loadingRow.remove();
    ktxSearchErr(e.message);
  } finally {
    btn.disabled = false;
    textarea.focus();
  }
}

function renderKtxCard(t) {
  const dateStr = t.date ? t.date.replace(/-/g, '.') : '';
  $('ktx-card-dynamic').innerHTML =
    '<div class="ktx-top">' +
      '<span class="ktx-badge">KTX</span>' +
      '<span class="ktx-train">' + t.trainNo + (dateStr ? ' · ' + dateStr : '') + '</span>' +
    '</div>' +
    '<div class="ktx-route">' +
      '<div class="ktx-station"><div class="ktx-time">' + t.depTime + '</div><div class="ktx-city">' + t.from + '</div></div>' +
      '<div class="ktx-mid"><div class="ktx-line"></div><div class="ktx-dur">' + t.duration + '</div></div>' +
      '<div class="ktx-station"><div class="ktx-time">' + t.arrTime + '</div><div class="ktx-city">' + t.to + '</div></div>' +
    '</div>' +
    '<div class="ktx-info">' +
      '<span class="ktx-tag">' + t.seatClass + '</span>' +
      '<span class="ktx-tag">' + t.car + ' ' + t.seat + '</span>' +
      '<span class="ktx-tag">어른 ' + (t.passengers || 1) + '명</span>' +
      (t.note ? '<span class="ktx-tag">' + t.note + '</span>' : '') +
    '</div>' +
    '<div class="ktx-price">' +
      '<div class="ktx-price-left">' +
        '<span class="ktx-krw-label">KRW 운임</span>' +
        '<span class="ktx-krw">₩' + Number(t.priceKrw).toLocaleString('ko-KR') + '</span>' +
      '</div>' +
      '<div class="ktx-price-right">' +
        '<span class="ktx-usdc-label">USDC 환산 (₩' + (t.exchangeRate || '—') + '/USD)</span>' +
        '<span class="ktx-usdc">' + (t.priceUsdc ? Number(t.priceUsdc).toFixed(4) + ' USDC' : '— USDC') + '</span>' +
      '</div>' +
    '</div>';
}

/* ── KTX 에이전트 결제 (x402 USDC) ─────────────────── */
async function runKtxReserve() {
  if (!ktxTrain) return;
  const btn = $('ktx-run');
  btn.disabled = true;
  btn.textContent = '결제 처리 중...';
  ktxPayErr('');
  $('ktx-steps').style.display = 'flex';

  const delays = [600, 800, 0, 500];

  for (let i = 0; i < 2; i++) {
    $('ktx-d' + i).classList.add('active');
    $('ktx-s' + i).classList.add('active');
    await new Promise(r => setTimeout(r, delays[i]));
    $('ktx-d' + i).classList.remove('active');
    $('ktx-d' + i).classList.add('done');
    $('ktx-d' + i).textContent = '✓';
    $('ktx-s' + i).classList.remove('active');
    $('ktx-s' + i).classList.add('done');
  }

  $('ktx-d2').classList.add('active');
  $('ktx-s2').classList.add('active');
  try {
    const res = await fetch('/api/demo/ktx-reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ktxTrain),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);

    $('ktx-d2').classList.remove('active');
    $('ktx-d2').classList.add('done');
    $('ktx-d2').textContent = '✓';
    $('ktx-s2').classList.remove('active');
    $('ktx-s2').classList.add('done');

    await new Promise(r => setTimeout(r, delays[3]));
    $('ktx-d3').classList.add('done');
    $('ktx-d3').textContent = '✓';
    $('ktx-s3').classList.add('done');

    $('ktx-complete-detail').textContent =
      ktxTrain.trainNo + ' ' + ktxTrain.from + '→' + ktxTrain.to +
      ' ' + ktxTrain.depTime + '~' + ktxTrain.arrTime +
      ' · 0.01 USDC · ' + d.elapsedMs + 'ms';
    $('ktx-run').style.display = 'none';
    const usdcAmt = ktxTrain.priceUsdc ? Number(ktxTrain.priceUsdc).toFixed(4) + ' USDC' : '0.01 USDC';
    $('ktx-complete-detail').innerHTML =
      ktxTrain.trainNo + ' &nbsp;' + ktxTrain.from + ' → ' + ktxTrain.to + '<br>' +
      ktxTrain.depTime + ' ~ ' + ktxTrain.arrTime +
      ' &nbsp;·&nbsp; ' + usdcAmt + ' · ' + d.elapsedMs + 'ms';
    $('ktx-complete-card').style.display = 'block';
    loadAccount();
  } catch (e) {
    $('ktx-d2').classList.remove('active');
    $('ktx-s2').classList.remove('active');
    ktxPayErr(e.message);
    btn.disabled = false;
    btn.textContent = '결제 · 예약 확정';
  }
}

/* ── M3: Settings ─────────────────────────────────── */
function setToggleBtn(id, isOn) {
  const btn = $(id);
  btn.textContent = isOn ? 'ON' : 'OFF';
  btn.classList.toggle('off', !isOn);
}

function toggleBtn(id) {
  const btn = $(id);
  setToggleBtn(id, btn.textContent !== 'ON');
}

async function loadSettings() {
  try {
    const [settingsRes, balanceRes] = await Promise.all([
      fetch('/api/demo/settings'),
      fetch('/api/free/balances').catch(() => null),
    ]);
    const d = await settingsRes.json();
    const b = d.budget;

    // 가용 예산: 실제 지갑 잔고(USDC) 우선, 없으면 budgetStore 값
    if (balanceRes && balanceRes.ok) {
      const bal = await balanceRes.json();
      const agent = bal.wallets?.find(w => w.role === 'payer');
      if (agent) {
        $('s-budget-total').value = parseFloat(agent.usdc).toFixed(4);
      } else {
        $('s-budget-total').value = b.monthlyTotal;
      }
    } else {
      $('s-budget-total').value = b.monthlyTotal;
    }
    setToggleBtn('s-budget-renew', b.autoRenew);
    $('s-cat-transport').value = b.categoriesUsdc.transport.limit.toFixed(2);
    $('s-cat-stay').value      = b.categoriesUsdc.stay.limit.toFixed(2);
    $('s-cat-food').value      = b.categoriesUsdc.food.limit.toFixed(2);
    $('s-cat-content').value   = b.categoriesUsdc.content.limit.toFixed(2);

    const a = d.autoCharge;
    setToggleBtn('s-auto-enabled', a.enabled);
    // KRW 스케일 레거시 값(>100)이면 USDC 적정 기본값으로 대체
    const asUsdc = (v, fallback) => v > 100 ? fallback : v.toFixed(4);
    $('s-auto-under').value       = asUsdc(a.autoApproveUnder,    '0.0500');
    $('s-auto-over').value        = asUsdc(a.confirmRequiredOver,  '0.5000');
    $('s-auto-daily').value       = asUsdc(a.dailyCap,             '0.3000');
    $('s-auto-today').textContent = asUsdc(a.accumulatedToday, '0.0000') + ' USDC';

    const m = d.m2m;
    setToggleBtn('s-m2m-enabled', m.enabled);
    $('s-m2m-net').textContent = m.network;
    $('s-m2m-req').value       = m.perRequestLimitUsdc;
    $('s-m2m-sess').value      = m.sessionLimitUsdc;
    applyM2mEnabledState(m.enabled);

    // 등록된 에이전트가 있으면 m2mAgent 상태 초기화
    if (m.whitelistedAgents.length > 0 && !m2mAgent) {
      const ag = m.whitelistedAgents[0];
      m2mAgent = { name: ag.name, address: ag.address, trustGrade: ag.trustGrade, txCount: 0 };
    }
    renderM2mAgentSection();
  } catch (e) {
    showStatus('m3-status', '설정 조회 실패: ' + e.message, false);
  }
}

async function saveBudget() {
  try {
    const patch = {
      budget: {
        monthlyTotal: Number($('s-budget-total').value),
        autoRenew: $('s-budget-renew').textContent === 'ON',
        categoriesUsdc: {
          transport: { limit: Number($('s-cat-transport').value) },
          stay:      { limit: Number($('s-cat-stay').value) },
          food:      { limit: Number($('s-cat-food').value) },
          content:   { limit: Number($('s-cat-content').value) },
        },
      },
    };
    const res = await fetch('/api/demo/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    showStatus('m3-status', '예산 설정이 저장되었습니다.', true);
    loadAccount();
  } catch (e) {
    showStatus('m3-status', '저장 실패: ' + e.message, false);
  }
}

async function saveAutoCharge() {
  try {
    const patch = {
      autoCharge: {
        enabled: $('s-auto-enabled').textContent === 'ON',
        autoApproveUnder: Number($('s-auto-under').value),
        confirmRequiredOver: Number($('s-auto-over').value),
        dailyCap: Number($('s-auto-daily').value),
      },
    };
    const res = await fetch('/api/demo/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    showStatus('m3-status', '자동승인 설정이 저장되었습니다.', true);
  } catch (e) {
    showStatus('m3-status', '저장 실패: ' + e.message, false);
  }
}

async function saveM2m() {
  try {
    const patch = {
      m2m: {
        enabled: $('s-m2m-enabled').textContent === 'ON',
        perRequestLimitUsdc: Number($('s-m2m-req').value),
        sessionLimitUsdc: Number($('s-m2m-sess').value),
      },
    };
    const res = await fetch('/api/demo/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    showStatus('m3-status', 'M2M 설정이 저장되었습니다.', true);
  } catch (e) {
    showStatus('m3-status', '저장 실패: ' + e.message, false);
  }
}

function setTab(idx) {
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  ['tab-0','tab-1','tab-2'].forEach((id, i) => $(id).style.display = i === idx ? 'block' : 'none');
}

/* ── M2M Toggle ───────────────────────────────────── */
function applyM2mEnabledState(enabled) {
  const inputs = [$('s-m2m-req'), $('s-m2m-sess')];
  inputs.forEach(inp => {
    if (!inp) return;
    inp.disabled = !enabled;
    inp.style.opacity = enabled ? '' : '0.4';
  });
  const section = $('m2m-agent-section');
  if (section) section.style.display = enabled ? '' : 'none';
}

function toggleM2mEnabled() {
  toggleBtn('s-m2m-enabled');
  const enabled = $('s-m2m-enabled').textContent === 'ON';
  applyM2mEnabledState(enabled);
}

/* ── M2M State ────────────────────────────────────── */
let m2mAgent = null;        // { name, address, trustGrade, txCount }
let m2mSessionSpent = 0;    // USDC spent this session
let m2mActivities = [];     // activity log items

/* ── M2M Agent Section Renderer ──────────────────── */
function renderM2mAgentSection() {
  const el = $('m2m-agent-section');
  if (!el) return;

  if (!m2mAgent) {
    el.innerHTML =
      '<div class="card"><div class="m2m-empty">' +
        '<div class="m2m-empty-icon">🤖</div>' +
        '<div class="m2m-empty-title">등록된 에이전트가 없습니다</div>' +
        '<div class="m2m-empty-desc">AI 결제 에이전트를 등록하면<br>사람 개입 없이 자율 결제가 가능합니다</div>' +
        '<button class="btn" onclick="openRegister()">+ ClaudeAssist 등록</button>' +
      '</div></div>';
    return;
  }

  const sessionLimit = parseFloat($('s-m2m-sess').value || '1');
  const pct = sessionLimit ? Math.min(100, (m2mSessionSpent / sessionLimit) * 100) : 0;
  const addrShort = m2mAgent.address.length > 14
    ? m2mAgent.address.slice(0, 6) + '...' + m2mAgent.address.slice(-4)
    : m2mAgent.address;

  const feedHtml = m2mActivities.length === 0
    ? '<div class="activity-empty">아직 활동 내역이 없습니다</div>'
    : m2mActivities.slice(0, 6).map(a =>
        '<div class="activity-item">' +
          '<div class="activity-top">' +
            '<span class="activity-agent">🤖 ' + a.agent + '</span>' +
            '<span class="activity-time">' + a.time + '</span>' +
          '</div>' +
          '<div class="activity-endpoint">' + a.endpoint + '</div>' +
          '<div class="activity-result ' + (a.ok ? 'ok' : 'err') + '">' +
            (a.ok ? '✅ ' + a.amount + ' USDC 결제 완료' : '❌ ' + a.error) +
          '</div>' +
        '</div>'
      ).join('');

  el.innerHTML =
    '<div class="agent-card">' +
      '<div class="agent-avatar">JB</div>' +
      '<div class="agent-info">' +
        '<div class="agent-name">' + m2mAgent.name + '</div>' +
        '<div class="agent-sub">전북은행 AI 에이전트 · Powered by Claude</div>' +
        '<div class="agent-addr">' + addrShort + '</div>' +
        '<div class="agent-stat">이 세션: ' + m2mAgent.txCount + '건 · ' + m2mSessionSpent.toFixed(4) + ' USDC</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">' +
        '<span class="chip">' + m2mAgent.trustGrade + '</span>' +
        '<button onclick="unregisterAgent()" style="color:var(--danger);background:none;border:none;cursor:pointer;padding:2px 7px;display:grid;place-items:center" title="에이전트 삭제">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="card">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:10px">세션 예산</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">' +
        '<span>소비</span>' +
        '<span style="color:var(--muted)">' + m2mSessionSpent.toFixed(4) + ' / ' + sessionLimit.toFixed(2) + ' USDC</span>' +
      '</div>' +
      '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
    '</div>' +
    '<button class="btn" id="m2m-run-btn" onclick="runM2mAgent()">⚡ 에이전트 자율 실행</button>' +
    '<div class="status" id="m2m-run-status"></div>' +
    '<div class="card" style="margin-top:12px">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:10px">⚡ 라이브 액티비티</div>' +
      '<div class="activity-feed">' + feedHtml + '</div>' +
    '</div>';
}

async function unregisterAgent() {
  if (!confirm('에이전트를 삭제하시겠습니까?')) return;
  await fetch('/api/demo/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ m2m: { whitelistedAgents: [] } }),
  });
  m2mAgent = null;
  m2mSessionSpent = 0;
  m2mActivities = [];
  renderM2mAgentSection();
}

/* ── Registration Modal ───────────────────────────── */
function openRegister() {
  goRegStep(0);
  // 랜덤 서브월렛 주소 생성 (데모용)
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
  const full = '0xJBCA' + rand;
  $('reg-addr').textContent = full.slice(0, 8) + '...' + full.slice(-4);
  $('reg-addr').dataset.full = full;
  $('reg-apikey').value = '';
  ['reg-s0','reg-s1','reg-s2'].forEach(id => { const el=$(id); el.className='status'; });
  $('m2m-modal').classList.add('open');
}

function closeRegister() {
  $('m2m-modal').classList.remove('open');
}

function goRegStep(n) {
  [0,1,2].forEach(i => {
    $('sp-' + i).classList.toggle('active', i === n);
    const dot = $('sd-' + i);
    dot.classList.remove('active','done');
    if (i === n) dot.classList.add('active');
    else if (i < n) dot.classList.add('done');
  });
}

function toggleKeyVis() {
  const inp = $('reg-apikey');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function toggleCat(el) {
  el.classList.toggle('on');
}

async function verifyApiKey() {
  const key = $('reg-apikey').value.trim();
  if (!key.startsWith('sk-ant-')) {
    showStatus('reg-s0', 'sk-ant- 로 시작하는 API 키를 입력하세요.', false);
    return;
  }
  showStatus('reg-s0', '연결 확인 중...', true);
  await new Promise(r => setTimeout(r, 900));
  showStatus('reg-s0', '✅ 연결됨 · claude-opus-4-6', true);
  setTimeout(() => goRegStep(1), 600);
}

async function passkeyApprove() {
  if (!window.PublicKeyCredential) {
    showStatus('reg-s1', '⚠️ PassKey 미지원 — 자동 승인으로 처리합니다.', true);
    await new Promise(r => setTimeout(r, 800));
    goRegStep(2);
    return;
  }
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: '전북은행', id: location.hostname },
        user: {
          id: new TextEncoder().encode('claude-agent-01'),
          name: 'ClaudeAssist',
          displayName: 'ClaudeAssist Agent',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'required' },
        timeout: 60000,
        attestation: 'none',
      }
    });
    showStatus('reg-s1', '✅ 에이전트 지갑 생성 승인됨', true);
    setTimeout(() => goRegStep(2), 500);
  } catch (e) {
    showStatus('reg-s1', '❌ ' + e.message, false);
  }
}

async function completeRegistration() {
  const perReq   = Number($('reg-per-req').value);
  const session  = Number($('reg-session').value);
  const fullAddr = $('reg-addr').dataset.full || '0xJBCAAgent0000';
  try {
    const res = await fetch('/api/demo/m2m-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: 'ClaudeAssist',
        address: fullAddr,
        trustGrade: 'A',
        perRequestLimitUsdc: perReq,
        sessionLimitUsdc: session,
      }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);

    m2mAgent = { name: 'ClaudeAssist', address: fullAddr, trustGrade: 'A', txCount: 0 };
    m2mSessionSpent = 0;
    $('s-m2m-req').value  = perReq;
    $('s-m2m-sess').value = session;
    closeRegister();
    renderM2mAgentSection();
  } catch (e) {
    showStatus('reg-s2', '❌ ' + e.message, false);
  }
}

/* ── M2M Autonomous Run ───────────────────────────── */
async function runM2mAgent() {
  const btn = $('m2m-run-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⚡ 실행 중...'; }

  try {
    const res = await fetch('/api/demo/m2m-run', { method: 'POST' });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);

    for (const step of d.steps) {
      const spent = parseFloat(step.usdcPrice || '0');
      m2mSessionSpent += spent;
      m2mAgent.txCount += 1;
      m2mActivities.unshift({
        agent:    'ClaudeAssist',
        endpoint: step.endpoint,
        amount:   step.usdcPrice,
        ok:       true,
        time:     new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
      });
    }
    renderM2mAgentSection();
    loadAccount(); // M1 잔고 및 거래내역 갱신
    const total = d.steps.reduce((s, x) => s + parseFloat(x.usdcPrice || '0'), 0);
    showStatus('m2m-run-status', d.steps.length + '건 자율 결제 완료 · ' + total.toFixed(4) + ' USDC', true);
  } catch (e) {
    m2mActivities.unshift({
      agent: 'ClaudeAssist', endpoint: '—', amount: '0', ok: false,
      error: e.message,
      time: new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
    });
    renderM2mAgentSection();
    showStatus('m2m-run-status', '실행 실패: ' + e.message, false);
  }
}

/* ── M4: Wallet ───────────────────────────────────── */
let m4WalletAddress = '';

async function loadWallet() {
  try {
    const res = await fetch('/api/free/balances');
    if (!res.ok) throw new Error('잔고 조회 실패');
    const data = await res.json();
    const agent = data.wallets?.find(w => w.role === 'payer');
    if (!agent) throw new Error('지갑 정보 없음');

    m4WalletAddress = agent.address || '';
    const usdc = parseFloat(agent.usdc).toFixed(4);
    const eth  = parseFloat(agent.eth).toFixed(6);
    const addrShort = m4WalletAddress.length > 12
      ? m4WalletAddress.slice(0, 6) + '...' + m4WalletAddress.slice(-4)
      : m4WalletAddress;

    $('m4-balance').textContent = usdc + ' USDC';
    $('m4-addr').textContent    = addrShort;
    $('m4-usdc').textContent    = usdc;
    $('m4-eth').textContent     = eth;
  } catch (e) {
    $('m4-balance').textContent = '조회 실패';
  }
}

async function copyAddress() {
  if (!m4WalletAddress) return;
  try {
    await navigator.clipboard.writeText(m4WalletAddress);
    showStatus('m4-copy-status', '✅ 주소가 클립보드에 복사되었습니다.', true);
    setTimeout(() => { $('m4-copy-status').className = 'status'; }, 2000);
  } catch {
    showStatus('m4-copy-status', '주소: ' + m4WalletAddress, true);
  }
}

function openBaseScan() {
  if (!m4WalletAddress) return;
  window.open('https://sepolia.basescan.org/address/' + m4WalletAddress, '_blank');
}

async function registerWalletPasskey() {
  const btn = $('m4-passkey-btn');
  btn.disabled = true; btn.textContent = '등록 중...';
  $('m4-passkey-status').className = 'status';

  if (!window.PublicKeyCredential) {
    showStatus('m4-passkey-status', '이 브라우저는 PassKey를 지원하지 않습니다.', false);
    btn.disabled = false; btn.textContent = '등록';
    return;
  }
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'JB은행', id: location.hostname },
        user: {
          id: new TextEncoder().encode('jbbank-wallet-user'),
          name: 'wallet@jbbank.co.kr',
          displayName: '내 지갑 PassKey',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'required' },
        timeout: 60000,
        attestation: 'none',
      },
    });
    showStatus('m4-passkey-status', '✅ PassKey가 등록되었습니다.', true);
    btn.textContent = '재등록';
  } catch (e) {
    const msg = e.name === 'NotAllowedError' ? '등록이 취소되었습니다.' : e.message;
    showStatus('m4-passkey-status', '❌ ' + msg, false);
    btn.textContent = '등록';
  } finally {
    btn.disabled = false;
  }
}
</script>
</body>
</html>`;
}

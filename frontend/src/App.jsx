import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AppShell    from './components/layout/AppShell.jsx';
import LoginPage    from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TradePage    from './pages/TradePage.jsx';
import WalletPage   from './pages/WalletPage.jsx';
import HistoryPage  from './pages/HistoryPage.jsx';
import ProfilePage  from './pages/ProfilePage.jsx';

// ── Global styles injected once into <head> ──────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --surface:#0d1117; --surface2:#111820; --border:#1c2a38;
  --up:#00ff88; --down:#ff3b5c; --gold:#f0b429;
  --text:#dce8f0; --muted:#3d5a72; --dim:#1a2a38;
}
html,body{background:#03060a;font-family:'Rajdhani',sans-serif;height:100%;overflow:hidden;}
#root,body{height:100%;}

/* shell */
.app{width:100%;height:100vh;background:var(--surface);display:flex;flex-direction:column;overflow:hidden;position:relative;user-select:none;}

/* loading spinner */
.loading{position:absolute;inset:0;background:#060a0e;display:flex;align-items:center;justify-content:center;z-index:500;}
.loading-ring{width:48px;height:48px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--gold);animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

/* toast */
.toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%) translateY(16px);background:#0d1520;border:1px solid var(--border);border-radius:10px;padding:10px 20px;font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--text);letter-spacing:.08em;opacity:0;transition:all .3s;z-index:400;white-space:nowrap;pointer-events:none;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* milestone banner */
.milestone{position:absolute;top:80px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;padding:8px 22px;border-radius:24px;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;letter-spacing:.1em;opacity:0;pointer-events:none;z-index:80;white-space:nowrap;}
.milestone.show{animation:ms-in 2.8s ease-out forwards;}
@keyframes ms-in{0%{opacity:0;transform:translateX(-50%) translateY(-6px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0}}

/* splash */
.splash{position:absolute;inset:0;z-index:300;background:#060a0e;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.sp-ring{width:96px;height:96px;border-radius:50%;border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;box-shadow:0 0 32px rgba(240,180,41,.3);margin-bottom:24px;animation:breathe 2.5s ease-in-out infinite;}
@keyframes breathe{0%,100%{box-shadow:0 0 32px rgba(240,180,41,.3)}50%{box-shadow:0 0 56px rgba(240,180,41,.55)}}
.sp-inner{font-size:34px;filter:drop-shadow(0 0 10px rgba(240,180,41,.9));}
.sp-name{font-family:'Share Tech Mono',monospace;font-size:30px;letter-spacing:.35em;color:var(--gold);text-shadow:0 0 22px rgba(240,180,41,.5);margin-bottom:8px;}
.sp-tag{font-size:14px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;margin-bottom:52px;}
.sp-btn{background:linear-gradient(160deg,#3a2800,#6a4a00);border:1.5px solid var(--gold);border-radius:12px;padding:16px 52px;font-family:'Rajdhani',sans-serif;font-size:19px;font-weight:700;letter-spacing:.22em;color:var(--gold);cursor:pointer;animation:btnp 2s ease-in-out infinite;}
@keyframes btnp{0%,100%{box-shadow:0 0 24px rgba(240,180,41,.2)}50%{box-shadow:0 0 44px rgba(240,180,41,.5)}}
.sp-btn:active{transform:scale(.97);}
.sp-free{margin-top:16px;font-size:12px;letter-spacing:.14em;color:var(--up);text-transform:uppercase;font-family:'Share Tech Mono',monospace;}

/* auth */
.auth-over{position:absolute;inset:0;z-index:200;background:#060a0e;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:24px;}
.auth-logo-block{text-align:center;}
.auth-logo-ico{font-size:2.6rem;filter:drop-shadow(0 0 10px rgba(240,180,41,.8));display:block;margin-bottom:8px;}
.auth-logo-txt{font-family:'Share Tech Mono',monospace;font-size:22px;letter-spacing:.28em;color:var(--gold);}
.auth-card{width:100%;max-width:380px;background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:26px 28px;}
.auth-tabs{display:flex;background:rgba(0,0,0,.3);border-radius:8px;padding:3px;margin-bottom:22px;}
.atab{flex:1;padding:9px 0;border-radius:6px;border:none;cursor:pointer;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:13px;letter-spacing:.1em;transition:all .2s;background:transparent;color:var(--muted);}
.atab.on{background:var(--gold);color:#000;}
.afield{margin-bottom:16px;}
.afield label{display:block;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.afield input{width:100%;padding:12px 14px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'Share Tech Mono',monospace;font-size:14px;outline:none;transition:border-color .2s;}
.afield input:focus{border-color:rgba(240,180,41,.45);}
.aerr{color:var(--down);font-size:12px;text-align:center;margin-bottom:12px;font-family:'Share Tech Mono',monospace;}
.asub{width:100%;padding:14px;border-radius:10px;background:linear-gradient(160deg,#3a2800,#6a4a00);border:1.5px solid var(--gold);color:var(--gold);font-family:'Rajdhani',sans-serif;font-weight:700;font-size:16px;letter-spacing:.15em;cursor:pointer;transition:opacity .2s;}
.asub:hover{opacity:.9;}
.asub:disabled{opacity:.5;cursor:not-allowed;}
.abonus{text-align:center;margin-top:14px;font-size:11px;color:var(--up);letter-spacing:.1em;font-family:'Share Tech Mono',monospace;}

/* bottom nav */
.bnav{display:flex;justify-content:flex-start;border-top:1px solid var(--border);flex-shrink:0;background:var(--surface);}
.ni{display:flex;align-items:center;gap:8px;padding:13px 24px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
.ni:hover{color:var(--text);}
.ni.on{color:var(--gold);border-bottom-color:var(--gold);}
.ni-ico{font-size:16px;}

/* top header */
.top-bar{padding:12px 28px 14px;border-bottom:1px solid var(--border);flex-shrink:0;display:flex;justify-content:space-between;align-items:flex-end;}
.bal-block label{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:3px;}
.bal-block .bv{font-family:'Share Tech Mono',monospace;font-size:18px;color:var(--text);}
.bal-block.right{text-align:right;}
.bal-block.right .bv{color:var(--up);}

/* market selectors */
.selectors{display:flex;gap:10px;padding:12px 28px;border-bottom:1px solid var(--border);position:relative;flex-shrink:0;}
.drop{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 14px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:border-color .2s;}
.drop:hover{border-color:var(--muted);}
.arr{border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid var(--muted);transition:transform .2s;flex-shrink:0;}
.drop.open .arr{transform:rotate(180deg);}
.dd-menu{display:none;position:absolute;top:calc(100% - 2px);background:#0d1520;border:1px solid var(--border);border-radius:8px;overflow:hidden;z-index:60;min-width:140px;box-shadow:0 8px 24px rgba(0,0,0,.7);}
.dd-menu.show{display:block;}
.dd-menu div{padding:10px 16px;font-size:13px;color:var(--text);cursor:pointer;transition:background .15s;font-family:'Rajdhani',sans-serif;font-weight:600;letter-spacing:.06em;}
.dd-menu div:hover{background:#182535;}
.dd-menu div.act{color:var(--gold);}
.drop span{font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--text);}

/* streak bar */
.streak-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 28px;border-bottom:1px solid var(--border);flex-shrink:0;}
.s-left{display:flex;align-items:center;gap:8px;}
.s-fire{font-size:20px;line-height:1;}
.s-cnt{font-family:'Share Tech Mono',monospace;font-size:20px;font-weight:bold;line-height:1;}
.s-lbl{font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}
.s-pips{display:flex;gap:5px;align-items:center;}
.pip{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--border);background:transparent;transition:all .3s;}
.pip.won{background:var(--up);border-color:var(--up);box-shadow:0 0 6px rgba(0,255,136,.7);}
.pip.lost{background:var(--down);border-color:var(--down);box-shadow:0 0 6px rgba(255,59,92,.7);}
.s-right{text-align:right;}
.s-best-lbl{font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}
.s-best{font-family:'Share Tech Mono',monospace;font-size:16px;color:var(--gold);}

/* trade layout */
.trade-main{display:flex;flex:1;flex-direction:column;overflow-y:auto;overflow-x:hidden;min-height:0;}
.trade-main::-webkit-scrollbar{width:4px;}
.trade-main::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.sym-label{text-align:center;padding:10px 0 2px;font-family:'Share Tech Mono',monospace;font-size:12px;letter-spacing:.25em;color:var(--muted);flex-shrink:0;}
.divider{height:1px;margin:0 28px;background:var(--border);flex-shrink:0;}

/* ticker */
.tkr-wrap{padding:8px 24px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;}
.tkr-title{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);}
.ticker{display:flex;align-items:center;gap:5px;background:linear-gradient(180deg,#1a0a00 0%,#0d0500 40%,#1a0a00 100%);border:2px solid #8B5E00;border-radius:10px;padding:8px 12px;box-shadow:0 0 0 1px #3a2800,inset 0 2px 12px rgba(0,0,0,.8),0 0 24px rgba(180,120,0,.12);position:relative;}
.ticker::before,.ticker::after{content:'';position:absolute;left:10px;right:10px;height:1px;background:linear-gradient(90deg,transparent,#8B5E00,#f0b429,#8B5E00,transparent);}
.ticker::before{top:3px;}
.ticker::after{bottom:3px;}
.dc{width:36px;height:52px;background:linear-gradient(180deg,#0a0300 0%,#150800 50%,#0a0300 100%);border:1px solid #5a3e00;border-radius:5px;overflow:hidden;position:relative;box-shadow:inset 0 0 10px rgba(0,0,0,.9),0 0 6px rgba(240,180,41,.08);}
.dc::before,.dc::after{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(240,180,41,.35),transparent);z-index:3;pointer-events:none;}
.dc::before{top:15px;}
.dc::after{bottom:15px;}
.reel{display:flex;flex-direction:column;will-change:transform;position:relative;z-index:1;}
.reel .r-digit{height:52px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Share Tech Mono',monospace;font-size:26px;font-weight:bold;color:#ffe066;text-shadow:0 0 8px rgba(255,200,0,.9),0 0 2px rgba(255,255,255,.4);}
.dc.dim .reel .r-digit{color:#cc9f00;text-shadow:0 0 6px rgba(200,140,0,.7);}
.vig{position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(180deg,rgba(0,0,0,.75) 0%,transparent 28%,transparent 72%,rgba(0,0,0,.75) 100%);}
.dsep{font-family:'Share Tech Mono',monospace;font-size:22px;font-weight:bold;color:#8B5E00;text-shadow:0 0 6px rgba(180,120,0,.5);margin:0 2px;margin-top:-8px;}
.live-tag{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;display:flex;align-items:center;gap:6px;transition:color .4s;}
.live-tag.up{color:var(--up);}
.live-tag.dn{color:var(--down);}
.live-dot{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 6px currentColor;animation:blink 1.4s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* orbit */
.orbit-sec{display:flex;flex-direction:column;align-items:center;padding:14px 24px 10px;flex-shrink:0;}
.orbit-title{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}
.orbit{position:relative;width:170px;height:170px;}
.ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;border:1px solid;transition:border-color .5s,box-shadow .5s;}
.r3{width:170px;height:170px;border-color:#162030;}
.r2{width:114px;height:114px;border-color:#1c2e42;}
.r3.ar,.r2.ar{border-color:rgba(240,180,41,.28)!important;box-shadow:0 0 18px rgba(240,180,41,.1);}
.r3.win{border-color:rgba(0,255,136,.4);box-shadow:0 0 20px rgba(0,255,136,.14);}
.r3.lose{border-color:rgba(255,59,92,.4);box-shadow:0 0 20px rgba(255,59,92,.14);}
@keyframes ospin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
.ring.sp{animation:ospin 8s linear infinite;}
.r2.sp{animation:ospin 5s linear infinite reverse;}
.otrace{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;border:1px dashed rgba(240,180,41,.15);pointer-events:none;opacity:0;transition:opacity .5s;}
.otrace.show{opacity:1;}
.core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 40% 38%,#1a3a52 0%,#0a1a28 70%);border:1px solid #1c3a55;box-shadow:0 0 18px rgba(20,80,120,.4),inset 0 0 16px rgba(0,0,0,.5);transition:background .5s,box-shadow .5s,border-color .5s;}
.core.win{background:radial-gradient(circle at 40% 38%,#00ff88,#004422);border-color:rgba(0,255,136,.5);box-shadow:0 0 28px rgba(0,255,136,.7);}
.core.lose{background:radial-gradient(circle at 40% 38%,#ff3b5c,#440011);border-color:rgba(255,59,92,.5);box-shadow:0 0 28px rgba(255,59,92,.7);}
.planet{position:absolute;top:50%;left:50%;width:12px;height:12px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px rgba(240,180,41,.9);transition:transform .8s cubic-bezier(.34,1.56,.64,1),background .4s,box-shadow .4s;}
.planet.win{background:var(--up);box-shadow:0 0 14px rgba(0,255,136,1);}
.planet.lose{background:var(--down);box-shadow:0 0 14px rgba(255,59,92,1);}
.nm-overlay{position:absolute;inset:0;border-radius:50%;pointer-events:none;opacity:0;}
.nm-overlay.show{animation:nm-pulse 1.2s ease-out forwards;}
@keyframes nm-pulse{0%{opacity:0}30%{opacity:1;box-shadow:inset 0 0 30px rgba(240,180,41,.35)}60%{opacity:.6}100%{opacity:0}}
@keyframes oshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.orbit.shaking{animation:oshake .5s ease-out;}
.rounds{display:flex;align-items:center;gap:10px;margin-top:12px;}
.rdot{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--border);background:transparent;transition:all .4s;}
.rdot.won{background:var(--up);border-color:var(--up);box-shadow:0 0 8px rgba(0,255,136,.8);}
.rdot.lost{background:var(--down);border-color:var(--down);box-shadow:0 0 8px rgba(255,59,92,.8);}
.rdot.near{background:#f0b429;border-color:#f0b429;box-shadow:0 0 8px rgba(240,180,41,.9);}
.rsep{font-size:10px;color:var(--dim);font-family:'Share Tech Mono',monospace;}
.orbit-status{margin-top:8px;font-size:11px;letter-spacing:.12em;font-family:'Share Tech Mono',monospace;color:var(--muted);text-transform:uppercase;min-height:16px;text-align:center;transition:color .3s;}
.orbit-status.win{color:var(--up);}
.orbit-status.lose{color:var(--down);}

/* stake */
.stake-row{display:flex;align-items:center;justify-content:center;gap:12px;padding:10px 24px 6px;flex-shrink:0;}
.stake-label{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}
.stake-ctrl{display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:6px 10px;}
.stake-btn{width:26px;height:26px;border-radius:50%;background:var(--dim);border:none;color:var(--text);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;}
.stake-btn:hover{background:#2a3f55;}
.stake-val{font-family:'Share Tech Mono',monospace;font-size:16px;color:var(--gold);min-width:54px;text-align:center;}

/* result banner */
.res-banner{display:none;margin:0 24px;border-radius:10px;padding:10px 16px;text-align:center;font-family:'Share Tech Mono',monospace;font-size:13px;letter-spacing:.1em;animation:slide-in .3s ease-out;flex-shrink:0;}
.res-banner.show{display:block;}
.res-banner.win{background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.3);color:var(--up);}
.res-banner.lose{background:rgba(255,59,92,.08);border:1px solid rgba(255,59,92,.3);color:var(--down);}
@keyframes slide-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* bet buttons */
.bet-btns{display:flex;justify-content:space-between;align-items:center;padding:10px 24px 14px;gap:16px;flex-shrink:0;}
.btn-up,.btn-dn{flex:1;border-radius:10px;padding:14px 0;font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;letter-spacing:.15em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .1s,box-shadow .2s,opacity .2s;border:none;}
.btn-up{background:linear-gradient(160deg,#003d20,#004d28);border:1.5px solid var(--up);color:var(--up);box-shadow:0 0 20px rgba(0,255,136,.15);}
.btn-dn{background:linear-gradient(160deg,#3d0010,#4d0018);border:1.5px solid var(--down);color:var(--down);box-shadow:0 0 20px rgba(255,59,92,.15);}
.btn-up:active,.btn-dn:active{transform:scale(.96);}
.btn-up:disabled,.btn-dn:disabled{opacity:.35;cursor:not-allowed;}

/* wallet */
.wallet-screen{display:flex;flex:1;overflow:hidden;min-height:0;}
.wallet-panel{width:100%;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;}
.w-header{padding:20px 28px 18px;background:linear-gradient(160deg,#0d1520,#111c2a);border-bottom:1px solid var(--border);flex-shrink:0;}
.w-title{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;}
.w-bal-row{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;}
.w-bal-item label{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px;}
.wv{font-family:'Share Tech Mono',monospace;font-size:22px;color:var(--text);}
.wv.g{color:var(--up);}
.w-acts{display:flex;gap:10px;}
.wb{flex:1;padding:12px 0;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;letter-spacing:.12em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .1s;}
.wb:active{transform:scale(.97);}
.wb-dep{background:linear-gradient(160deg,#003d20,#004d28);border:1.5px solid var(--up);color:var(--up);box-shadow:0 0 16px rgba(0,255,136,.12);}
.wb-wit{background:linear-gradient(160deg,#1a1000,#2a1c00);border:1.5px solid var(--gold);color:var(--gold);box-shadow:0 0 16px rgba(240,180,41,.1);}

/* wallet modal */
.wm-back{position:absolute;inset:0;z-index:200;background:rgba(4,8,14,.9);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;}
.wm-back.open{display:flex;}
.wm-sheet{width:100%;max-width:420px;background:#0d1520;border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:16px;padding:24px 28px 32px;animation:shup .28s cubic-bezier(.34,1.1,.64,1);display:flex;flex-direction:column;gap:14px;}
@keyframes shup{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.wm-title{font-size:18px;font-weight:700;letter-spacing:.08em;color:var(--text);}
.wm-sub{font-size:12px;color:var(--muted);letter-spacing:.06em;margin-top:-8px;}
.wm-disp{display:flex;align-items:center;justify-content:center;gap:12px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px 20px;transition:border-color .3s;}
.wm-disp.hv{border-color:rgba(240,180,41,.4);}
.wm-cur{font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--muted);letter-spacing:.1em;}
.wm-amt{font-family:'Share Tech Mono',monospace;font-size:32px;color:var(--gold);letter-spacing:.04em;min-width:90px;text-align:center;}
.wm-chips{display:flex;gap:8px;}
.wm-chip{flex:1;padding:9px 0;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .15s;font-family:'Rajdhani',sans-serif;letter-spacing:.06em;}
.wm-chip:hover,.wm-chip.sel{border-color:var(--gold);color:var(--gold);background:rgba(240,180,41,.1);}
.wm-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.wm-key{padding:15px 0;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:10px;font-family:'Share Tech Mono',monospace;font-size:19px;color:var(--text);cursor:pointer;transition:all .1s;user-select:none;}
.wm-key:active{background:#1a2535;transform:scale(.93);}
.wm-key.del{color:var(--muted);font-size:15px;}
.wm-key.z2{grid-column:span 2;}
.wm-confirm{padding:15px;border-radius:12px;border:none;font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;letter-spacing:.15em;cursor:pointer;transition:all .15s;}
.wm-dep{background:linear-gradient(160deg,#003d20,#004d28);border:1.5px solid var(--up);color:var(--up);box-shadow:0 0 18px rgba(0,255,136,.15);}
.wm-wit{background:linear-gradient(160deg,#3d1a00,#4d2200);border:1.5px solid var(--gold);color:var(--gold);box-shadow:0 0 18px rgba(240,180,41,.15);}
.wm-confirm:disabled{opacity:.3;cursor:not-allowed;}
.wm-confirm:not(:disabled):active{transform:scale(.97);}
.wm-cancel{text-align:center;font-size:12px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;cursor:pointer;padding:2px 0;font-family:'Share Tech Mono',monospace;}
.wm-cancel:hover{color:var(--text);}

/* tx list */
.tx-sec{flex:1;overflow-y:auto;padding:0 28px 16px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
.tx-sec::-webkit-scrollbar{width:4px;}
.tx-sec::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.tx-hd{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);padding:14px 0 10px;border-bottom:1px solid var(--border);margin-bottom:6px;position:sticky;top:0;background:var(--surface);}
.tx-empty{text-align:center;padding:48px 0;font-size:11px;letter-spacing:.15em;color:var(--dim);text-transform:uppercase;font-family:'Share Tech Mono',monospace;}
.tx-item{display:flex;align-items:center;gap:13px;padding:12px 0;border-bottom:1px solid var(--dim);}
.tx-item:last-child{border-bottom:none;}
.tx-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.tx-ico.deposit{background:rgba(0,255,136,.08);color:var(--up);border:1px solid rgba(0,255,136,.2);}
.tx-ico.withdraw{background:rgba(240,180,41,.08);color:var(--gold);border:1px solid rgba(240,180,41,.2);}
.tx-ico.bet_win{background:rgba(0,255,136,.08);color:var(--up);border:1px solid rgba(0,255,136,.2);}
.tx-ico.bet_loss{background:rgba(255,59,92,.08);color:var(--down);border:1px solid rgba(255,59,92,.2);}
.tx-ico.free{background:rgba(240,180,41,.08);color:var(--gold);border:1px solid rgba(240,180,41,.2);}
.tx-info{flex:1;min-width:0;}
.tx-lbl{font-size:13px;font-weight:600;color:var(--text);letter-spacing:.04em;}
.tx-meta{font-size:10px;color:var(--muted);font-family:'Share Tech Mono',monospace;margin-top:2px;}
.tx-right{text-align:right;}
.tx-amt{font-family:'Share Tech Mono',monospace;font-size:14px;}
.tx-amt.pos{color:var(--up);}
.tx-amt.neg{color:var(--down);}
.tx-amt.gld{color:var(--gold);}
.tx-bal{font-size:9px;color:var(--muted);font-family:'Share Tech Mono',monospace;margin-top:2px;}

/* history */
.hist-top-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:18px 28px 14px;flex-shrink:0;}
.hs{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 10px;text-align:center;}
.hs-v{font-family:'Share Tech Mono',monospace;font-size:20px;color:var(--gold);}
.hs-l{font-size:8px;letter-spacing:.12em;color:var(--muted);margin-top:4px;text-transform:uppercase;}
.hist-list{flex:1;overflow-y:auto;padding:0 28px 16px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
.hist-list::-webkit-scrollbar{width:4px;}
.hist-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.h-item{background:var(--surface2);border-radius:10px;padding:14px 16px;margin-bottom:10px;border:1px solid;}
.h-item.win{border-color:rgba(0,255,136,.15);}
.h-item.lose{border-color:rgba(255,59,92,.15);}
.h-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.h-meta{display:flex;align-items:center;gap:10px;}
.h-sym{font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--muted);}
.h-dir{font-size:13px;font-weight:700;letter-spacing:.08em;}
.h-dir.u{color:var(--up);}
.h-dir.d{color:var(--down);}
.h-pay{font-family:'Share Tech Mono',monospace;font-size:15px;font-weight:700;}
.h-pay.pos{color:var(--up);}
.h-pay.neg{color:var(--down);}
.h-rounds{display:flex;gap:6px;align-items:center;}
.hd{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-family:'Share Tech Mono',monospace;font-weight:700;}
.hd.w{background:rgba(0,255,136,.12);border:1px solid var(--up);color:var(--up);}
.hd.l{background:rgba(255,59,92,.08);border:1px solid var(--down);color:var(--down);}
.h-time{font-size:9px;color:var(--dim);font-family:'Share Tech Mono',monospace;margin-left:6px;}

/* profile */
.profile-wrap{display:flex;flex:1;overflow:hidden;min-height:0;}
.profile-col{flex:1;overflow-y:auto;padding:24px 32px 32px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
.profile-col::-webkit-scrollbar{width:4px;}
.profile-col::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.prof-hero{display:flex;align-items:center;gap:20px;padding:0 0 22px;border-bottom:1px solid var(--border);margin-bottom:22px;}
.prof-av{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#ff6600);display:flex;align-items:center;justify-content:center;font-size:26px;border:2px solid var(--gold);box-shadow:0 0 24px rgba(240,180,41,.25);flex-shrink:0;}
.prof-name{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;color:var(--text);}
.prof-lv{color:var(--gold);font-size:11px;letter-spacing:.2em;margin-top:2px;}
.prof-bal{font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--up);margin-top:4px;}
.xp-card{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:16px;}
.xp-lr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.xp-lbl{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}
.xp-v{font-family:'Share Tech Mono',monospace;color:var(--gold);font-size:14px;}
.xp-bg{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;}
.xp-fill{height:100%;background:linear-gradient(90deg,var(--gold),#ff8c00);border-radius:3px;transition:width .6s ease;}
.xp-lvrow{display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:var(--muted);font-family:'Share Tech Mono',monospace;}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
.sc{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px 12px;}
.sc-ico{font-size:20px;margin-bottom:6px;}
.sc-val{font-family:'Share Tech Mono',monospace;font-size:20px;color:var(--text);}
.sc-lbl{font-size:8px;letter-spacing:.12em;color:var(--muted);margin-top:3px;text-transform:uppercase;}
.logout-btn{padding:13px 32px;border-radius:10px;background:transparent;border:1px solid var(--border);color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;letter-spacing:.12em;cursor:pointer;transition:all .2s;}
.logout-btn:hover{border-color:var(--down);color:var(--down);}

/* onboarding */
.ob-overlay{position:absolute;inset:0;z-index:250;pointer-events:none;display:none;}
.ob-overlay.active{display:block;pointer-events:all;}
.ob-mask{position:absolute;inset:0;background:rgba(4,8,14,.84);backdrop-filter:blur(1px);}
.ob-spotlight{position:absolute;border-radius:12px;box-shadow:0 0 0 9999px rgba(4,8,14,.84),0 0 0 2px var(--gold),0 0 20px rgba(240,180,41,.4);transition:all .45s cubic-bezier(.34,1.1,.64,1);pointer-events:none;}
.ob-card{position:absolute;left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:400px;background:linear-gradient(160deg,#0d1520,#111c2a);border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:14px;padding:20px 22px 16px;box-shadow:0 12px 40px rgba(0,0,0,.7);}
.ob-pips{display:flex;gap:6px;margin-bottom:10px;}
.ob-pip{width:24px;height:3px;border-radius:2px;background:var(--border);}
.ob-pip.done{background:var(--gold);}
.ob-step-num{font-size:9px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-bottom:6px;font-family:'Share Tech Mono',monospace;}
.ob-headline{font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px;}
.ob-headline span{color:var(--gold);}
.ob-body{font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:14px;}
.ob-next{padding:11px 24px;border-radius:8px;background:var(--gold);border:none;color:#000;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;letter-spacing:.12em;cursor:pointer;}
.ob-skip{position:absolute;top:14px;right:18px;font-size:11px;letter-spacing:.1em;color:var(--muted);cursor:pointer;font-family:'Share Tech Mono',monospace;text-transform:uppercase;}
.ob-skip:hover{color:var(--text);}
`;

// ── Auto-login wrapper ────────────────────────────────────────────────────────
function AutoLogin({ children }) {
  const [ready, setReady] = useState(false);
  const { token, loadMe, logout } = useStore(s => ({
    token:   s.token,
    loadMe:  s.loadMe,
    logout:  s.logout,
  }));

  useEffect(() => {
    if (!token) { setReady(true); return; }
    loadMe().then(() => setReady(true)).catch(() => { logout(); setReady(true); });
  }, []); // eslint-disable-line

  if (!ready) return (
    <div className="app">
      <div className="loading"><div className="loading-ring" /></div>
    </div>
  );
  return children;
}

function ProtectedRoute({ children }) {
  const token = useStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    const id = 'orbitbet-global';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AutoLogin>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route index          element={<TradePage />} />
              <Route path="wallet"  element={<WalletPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AutoLogin>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

/* YKS ad simulators. Vanilla JS, no tracking, nothing stored.
   Previews are drawn from scratch to look like each platform's 2026 ad formats
   (generic icons, no platform logos). Estimates are ranges from the public
   benchmarks cited on each page: impressions = spend / CPM x 1000, clicks = spend / CPC. */
(function () {
  'use strict';
  var A = 'https://yksproductions.com/assets/';
  var ADSIM = 'https://yks-chat.ysuresh634.workers.dev/adsim';
  var ENQ = 'https://script.google.com/macros/s/AKfycbz_36FeQLa2AsN-GzlYZWhT-VgqQ9UabIogrysT_5eHl-tZWbpNAkZhg26S3E2l3QRp/exec';
  var T0 = Date.now();

  /* real YKS frames (the owner's own shoots) */
  var IMAGES = [
    { id: 'fashion', src: A + 'craft/fashion.webp', alt: 'Fashion portrait shot by YKS', tall: false },
    { id: 'tower', src: A + 'work/atlantis-tower.webp', alt: 'Dubai tower shot by YKS', tall: true },
    { id: 'market', src: A + 'posters/marriott-r1.webp', alt: 'Hotel food market shot by YKS for Marriott', tall: true },
    { id: 'interior', src: A + 'craft/realestate.webp', alt: 'Interior shot by YKS', tall: false },
    { id: 'sea', src: A + 'work/atlantis-sea.webp', alt: 'Dubai coastline shot by YKS', tall: true },
    { id: 'film', src: A + 'posters/marriott-film.webp', alt: 'Marriott brand film frame by YKS', tall: false }
  ];
  var CTAS = ['Learn more', 'Shop now', 'Book now', 'Sign up', 'Contact us', 'Get offer', 'Order now', 'Get quote', 'Apply now', 'Download', 'Watch more', 'Visit site'];

  /* ---------- benchmarks (every figure is cited on the page that uses it) ---------- */
  var USD_AED = 3.6725, AED_INR = 25.98, USD_INR = USD_AED * AED_INR;
  var P = {
    meta: {
      name: 'Meta', placements: [['ig_feed', 'Instagram feed'], ['ig_story', 'Instagram Story'], ['ig_reel', 'Instagram Reel'], ['fb_feed', 'Facebook feed']],
      m: {
        ae: { cpm: [10, 35], cpc: [0.6, 2.5], by: { ig_feed: [18, 35], ig_story: [18, 35], ig_reel: [18, 35], fb_feed: [10, 25] }, src: 'SL Marketing, Dubai paid social benchmarks' },
        'in': { cpm: [50, 250], cpc: [4, 50], by: { ig_feed: [80, 150], fb_feed: [80, 150], ig_story: [50, 120], ig_reel: [30, 80] }, src: 'Arham Technology and Vgraple, India Meta ads costs' }
      }, def: { ae: [150, 14], 'in': [2000, 14] }
    },
    linkedin: {
      name: 'LinkedIn', placements: [['li_feed', 'Feed (Sponsored content)'], ['li_msg', 'Message ad']],
      m: {
        ae: { cpm: [25, 116], cpc: [5, 18], minDay: 10 * USD_AED, minTxt: 'LinkedIn asks for at least USD 10 a day per campaign (about AED 37).', src: 'SL Marketing, Prontosys and Kiin' },
        'in': { cpm: [450, 1400], cpc: [120, 650], minDay: 10 * USD_INR, minTxt: 'LinkedIn asks for at least USD 10 a day per campaign (about \u20B9950).', src: 'PaidMediaWorld and Upgrowth' }
      }, def: { ae: [200, 14], 'in': [3000, 14] }
    },
    tiktok: {
      name: 'TikTok', placements: [['tt_feed', 'In-feed ad'], ['tt_top', 'TopView']],
      m: {
        ae: { cpm: [8, 45], cpc: [0.4, 9], minDay: 185, minTxt: 'TikTok asks for at least AED 185 a day per campaign and AED 75 a day per ad group.', src: 'SL Marketing and IGP Global' },
        'in': null
      }, def: { ae: [200, 14] }, offIn: 'TikTok has been blocked in India since June 2020, so there is nothing to buy there.'
    },
    snapchat: {
      name: 'Snapchat', placements: [['snap_ad', 'Snap Ad (between Stories)'], ['snap_disc', 'Story Ad (Discover tile)']],
      m: {
        ae: { cpm: [5, 12], cpc: [0.3, 1.2], minDay: 5 * USD_AED, minTxt: 'Snapchat asks for at least USD 5 a day (about AED 18).', src: 'SL Marketing' },
        'in': { cpm: [100, 320], cpc: [2, 12], minDay: 5 * USD_INR, minTxt: 'Snapchat asks for at least USD 5 a day (about \u20B9480).', src: 'Upgrowth, Sanrovax and Digital Griot' }
      }, def: { ae: [100, 14], 'in': [1500, 14] }
    },
    chatgpt: {
      name: 'ChatGPT', placements: [['cg', 'Sponsored, below an answer']],
      m: {
        ae: { cpm: [25 * USD_AED, 65 * USD_AED], cpc: [1.72 * USD_AED, 9.89 * USD_AED], minDay: 65, minTxt: 'ChatGPT Ads Manager asks for at least AED 65 a day.', src: 'Thrad and Opascope (early, mostly US tests)' },
        'in': { cpm: [25 * USD_INR, 65 * USD_INR], cpc: [1.72 * USD_INR, 9.89 * USD_INR], minDay: 725, minTxt: 'ChatGPT Ads Manager asks for at least \u20B9725 a day.', src: 'Thrad and Opascope (early, mostly US tests)' }
      }, def: { ae: [150, 14], 'in': [2000, 14] }
    },
    perplexity: { name: 'Perplexity', placements: [['px', 'Sponsored follow-up (retired format)']], m: { ae: null, 'in': null }, def: {} }
  };

  /* ---------- small helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function region() { try { return (window.YKS && YKS.region && YKS.region()) || null; } catch (e) { return null; } }
  function wa(text) { try { return YKS.waLink(text); } catch (e) { return 'https://wa.me/919746679720?text=' + encodeURIComponent(text || ''); } }
  function sig(n) { if (n < 10) return Math.round(n); var p = Math.pow(10, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; }
  function num(n, mk) { return Math.round(n).toLocaleString(mk === 'in' ? 'en-IN' : 'en-US'); }
  function money(n, mk) { return (mk === 'in' ? '\u20B9' : 'AED ') + num(n, mk); }
  function initials(s) { s = String(s || '').replace(/^@/, '').trim(); var w = s.split(/[\s._-]+/).filter(Boolean); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); }
  function domainOf(u) { try { return new URL(/^https?:/i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function slug(s) { return String(s || 'yourbrand').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9._]/g, '').slice(0, 24) || 'yourbrand'; }

  /* ---------- generic inline icons ---------- */
  var I = {
    heart: '<path d="M12 20.3 4.7 13A4.9 4.9 0 0 1 12 6.6 4.9 4.9 0 0 1 19.3 13Z"/>',
    comment: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.6Z"/>',
    send: '<path d="M21.5 3 10.4 13.6M21.5 3l-6.6 18-4.5-7.4L3 9.4Z"/>',
    save: '<path d="M18.5 21 12 15.5 5.5 21V3.5h13Z"/>',
    dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    chev: '<path d="m9 5 7 7-7 7"/>', up: '<path d="m6 15 6-6 6 6"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
    thumb: '<path d="M7 10.5v10H3.5v-10Zm0 0 4-7.5a2 2 0 0 1 2.6 2.3l-.8 3.7h6.1a2 2 0 0 1 2 2.4l-1.6 7a2 2 0 0 1-2 1.6H7"/>',
    repost: '<path d="M17 2.5 20.5 6 17 9.5M3.5 11V9a3 3 0 0 1 3-3h14M7 21.5 3.5 18 7 14.5M20.5 13v2a3 3 0 0 1-3 3h-14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    home: '<path d="M3.5 10.5 12 3.5l8.5 7V20.5h-6v-6h-5v6h-6Z"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    plus: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>', reel: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M3.5 8.5h17M8 3.5l3 5M13.5 3.5l3 5M10.5 11.5v6l5-3Z"/>',
    user: '<circle cx="12" cy="8.5" r="4"/><path d="M4 20.5a8 8 0 0 1 16 0"/>', music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    share: '<path d="M14 4.5 21 11.5l-7 7v-4c-5 0-8.5 1.5-11 5 1-5 4-10 11-11Z"/>', inbox: '<path d="M3.5 13.5 6 4.5h12l2.5 9V19.5h-17Zm0 0h5l1 2.5h5l1-2.5h5"/>',
    camera: '<rect x="3" y="6.5" width="18" height="13" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6.5 10 4h4l1.5 2.5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    up2: '<path d="M7 10v10H3.5V10Zm0 0 4-7a2 2 0 0 1 2.6 2.3L12.8 9h6.1a2 2 0 0 1 2 2.4l-1.6 7a2 2 0 0 1-2 1.6H7"/>',
    redo: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5M20 3.5v5h-5"/>', arrow: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>',
    bolt: '<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12Z"/>', layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>', sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15ZM10 21h4"/>', pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'
  };
  function ic(n, o) { o = o || {}; return '<svg class="svg" viewBox="0 0 24 24" width="' + (o.s || 24) + '" height="' + (o.s || 24) + '" style="' + (o.st || '') + 'width:' + (o.s || 24) + 'px;height:' + (o.s || 24) + 'px" fill="' + (o.fill || 'none') + '" stroke="' + (o.fill && !o.stroke ? 'none' : 'currentColor') + '" stroke-width="' + (o.w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; }

  /* ---------- preview pieces ---------- */
  function avatar(c, size, radius) {
    var st = 'width:' + (size || 32) + 'px;height:' + (size || 32) + 'px;' + (radius != null ? 'border-radius:' + radius + 'px;' : '') + 'background:' + esc(c.color || '#444') + ';font-size:' + Math.round((size || 32) * 0.38) + 'px';
    return '<span class="av" style="' + st + '">' + (c.avatar ? '<img src="' + esc(c.avatar) + '" alt="" onerror="this.remove()">' : '') + esc(initials(c.brand)) + '</span>';
  }
  function avatarI(c, size, radius) { // initials sit under the image; if the image loads it covers them
    var st = 'width:' + (size || 32) + 'px;height:' + (size || 32) + 'px;' + (radius != null ? 'border-radius:' + radius + 'px;' : '') + 'background:' + esc(c.color || '#444') + ';font-size:' + Math.round((size || 32) * 0.38) + 'px;position:relative';
    return '<span class="av" style="' + st + '"><span>' + esc(initials(c.brand)) + '</span>' + (c.avatar ? '<img src="' + esc(c.avatar) + '" alt="" style="position:absolute;inset:0" onerror="this.remove()">' : '') + '</span>';
  }
  avatar = avatarI;
  function media(c, cls, which) {
    var src = (which === 'tall' ? c.imgTall : c.imgWide) || c.img;
    return '<div class="media ' + cls + '"><img src="' + esc(src) + '" alt="' + esc(c.imgAlt || 'Ad image') + '" onerror="this.style.opacity=0"></div>';
  }
  function sb(dark) { return '<div class="sb"' + (dark ? ' style="color:#fff"' : '') + '><span>9:41</span><span class="ic"><svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="22.5" y="4" width="1.8" height="4" rx="1" fill="currentColor" opacity=".5"/></svg></span></div>'; }
  function phone(inner, dark, extra) { return '<div class="phone"><div class="scr' + (dark ? ' dark' : '') + '"><div class="island"></div>' + inner + '</div>' + (extra || '') + '</div>'; }
  function full(inner) { return '<div class="body" style="position:relative">' + inner + '</div>'; }
  function more(t, n) { t = String(t || ''); return t.length > n ? esc(t.slice(0, n).replace(/\s+\S*$/, '')) + '\u2026 <span style="color:#737373">more</span>' : esc(t); }
  function igTabs() { return '<div class="tabbar">' + ic('home', { s: 25 }) + ic('search', { s: 25 }) + ic('plus', { s: 25 }) + ic('reel', { s: 25 }) + '<span class="av" style="width:25px;height:25px;background:#ccc"></span></div>'; }

  var R = {};
  R.ig_feed = function (c) {
    return phone(sb() + '<div class="body ig" style="overflow:hidden">' +
      '<div style="display:flex;align-items:center;padding:4px 12px 8px;font-weight:700;font-size:20px;letter-spacing:-.02em;font-family:Georgia,serif;font-style:italic">Feed<span style="margin-left:auto;display:flex;gap:16px">' + ic('heart', { s: 24 }) + ic('send', { s: 24 }) + '</span></div>' +
      '<div class="hd">' + avatar(c, 32) + '<div><div class="nm">' + esc(c.handle) + '</div><div class="sp">Sponsored</div></div><span class="more">' + ic('dots', { s: 20 }) + '</span></div>' +
      media(c, 'r45', 'wide') +
      '<div class="ctabar" style="background:' + esc(c.color) + '"><span>' + esc(c.cta) + '</span>' + ic('chev', { s: 18 }) + '</div>' +
      '<div class="acts">' + ic('heart', { s: 25 }) + ic('comment', { s: 24 }) + ic('send', { s: 24 }) + '<span class="sv">' + ic('save', { s: 24 }) + '</span></div>' +
      '<div class="cap"><b>' + esc(c.handle) + '</b> ' + more(c.caption || c.text, 80) + '</div></div>' + igTabs());
  };
  R.ig_story = function (c) {
    return phone(full('<div class="vert">' + media(c, '', 'tall') + '<div class="shade"></div><div class="prog"><i class="on"></i><i></i><i></i></div>' +
      '<div class="tophd">' + avatar(c, 30) + '<div><div class="nm">' + esc(c.handle) + '</div><div class="sp">Sponsored</div></div><span style="margin-left:auto;display:flex;gap:10px">' + ic('dots', { s: 20 }) + ic('close', { s: 22 }) + '</span></div>' +
      '<div class="bot" style="text-align:center"><div style="font-weight:700;font-size:20px;line-height:1.2;margin:0 8px 16px;text-shadow:0 1px 4px rgba(0,0,0,.5)">' + esc(c.headline) + '</div>' + ic('up', { s: 22, st: 'display:block;margin:0 auto 2px;' }) + '<div class="pillcta">' + ic('link', { s: 16 }) + esc(c.cta) + '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-top:14px"><div style="flex:1;height:40px;border:1px solid rgba(255,255,255,.6);border-radius:22px;font-size:13px;display:flex;align-items:center;padding:0 14px;text-align:left">Send message</div>' + ic('heart', { s: 25 }) + ic('send', { s: 24 }) + '</div></div></div>'), true);
  };
  R.ig_reel = function (c) {
    return phone(full('<div class="vert">' + media(c, '', 'tall') + '<div class="shade"></div>' +
      '<div style="position:absolute;top:54px;left:14px;right:14px;display:flex;color:#fff;font-weight:700;font-size:20px;z-index:3">Reels<span style="margin-left:auto">' + ic('camera', { s: 25 }) + '</span></div>' +
      '<div class="side">' + ic('heart', { s: 30 }) + '<span style="margin-top:-12px">Like</span>' + ic('comment', { s: 28 }) + '<span style="margin-top:-12px">Comment</span>' + ic('send', { s: 28 }) + ic('dots', { s: 24 }) + '</div>' +
      '<div class="bot" style="bottom:62px"><div style="display:flex;align-items:center;gap:8px">' + avatar(c, 30) + '<b style="font-size:14px">' + esc(c.handle) + '</b></div>' +
      '<div style="font-size:12px;opacity:.9;margin-top:4px">Sponsored</div><div class="reelcap clamp2">' + esc(c.caption || c.text) + '</div>' +
      '<div class="widecta" style="max-width:80%;background:' + esc(c.color) + '"><span>' + esc(c.cta) + '</span>' + ic('chev', { s: 16 }) + '</div></div></div>' +
      '<div class="tabbar" style="position:absolute;left:0;right:0;bottom:0;background:#000;color:#fff">' + ic('home', { s: 25 }) + ic('search', { s: 25 }) + ic('plus', { s: 25 }) + ic('reel', { s: 25 }) + '<span class="av" style="width:25px;height:25px;background:#555"></span></div>'), true);
  };
  R.fb_feed = function (c) {
    return phone(sb() + '<div class="body fb" style="background:#e4e6eb;overflow:hidden"><div style="background:#fff;padding:2px 12px 8px;display:flex;align-items:center;font-weight:800;font-size:24px;color:#1b74e4;letter-spacing:-.03em">feed<span style="margin-left:auto;display:flex;gap:8px;color:#050505">' + ic('search', { s: 22 }) + ic('comment', { s: 22 }) + '</span></div>' +
      '<div style="background:#fff;margin-top:6px"><div class="hd">' + avatar(c, 40) + '<div><div class="nm">' + esc(c.brand) + '</div><div class="sp">Sponsored \u00B7 ' + ic('globe', { s: 12, w: 2 }) + '</div></div><span style="margin-left:auto;color:#65676b;display:flex;gap:10px">' + ic('dots', { s: 20 }) + ic('close', { s: 20 }) + '</span></div>' +
      '<div class="tx clamp3">' + esc(c.text) + '</div>' + media(c, 'r11', 'wide') +
      '<div class="lk"><div style="min-width:0"><div class="dm">' + esc(c.domain) + '</div><div class="hl clamp2">' + esc(c.headline) + '</div></div><span class="bt">' + esc(c.cta) + '</span></div>' +
      '<div class="rx"><span>\uD83D\uDC4D Like this?</span><span>Comments \u00B7 Shares</span></div><div class="ac"><span>' + ic('thumb', { s: 18 }) + 'Like</span><span>' + ic('comment', { s: 18 }) + 'Comment</span><span>' + ic('share', { s: 18 }) + 'Share</span></div></div></div>');
  };
  function liBar() { return '<div style="display:flex;align-items:center;gap:8px;padding:2px 12px 8px;background:#fff">' + '<span class="av" style="width:28px;height:28px;background:#bbb"></span><div style="flex:1;height:32px;background:#edf3f8;border-radius:4px;display:flex;align-items:center;gap:6px;padding:0 10px;color:#666;font-size:13px">' + ic('search', { s: 16 }) + 'Search</div>' + ic('comment', { s: 22 }) + '</div>'; }
  R.li_feed = function (c) {
    return phone(sb() + '<div class="body li" style="overflow:hidden">' + liBar() +
      '<div class="post"><div class="hd">' + avatar(c, 44, 4) + '<div style="min-width:0"><div class="nm">' + esc(c.brand) + '</div><div class="sub">' + esc(c.followers || 'Company page') + '</div><div class="sub">Promoted</div></div><span style="margin-left:auto;color:#666">' + ic('dots', { s: 20 }) + '</span></div>' +
      '<div class="tx">' + more(c.liText || c.text, 130) + '</div>' + media(c, 'r11', 'wide') +
      '<div class="strip"><div style="min-width:0"><div class="hl clamp2">' + esc(c.liHeadline || c.headline) + '</div><div class="dm">' + esc(c.domain) + '</div></div><span class="bt">' + esc(c.cta) + '</span></div>' +
      '<div class="ac"><span>' + ic('thumb', { s: 18 }) + 'Like</span><span>' + ic('comment', { s: 18 }) + 'Comment</span><span>' + ic('repost', { s: 18 }) + 'Repost</span><span>' + ic('send', { s: 18 }) + 'Send</span></div></div></div>');
  };
  R.li_msg = function (c) {
    return phone(sb() + '<div class="body li"><div class="msg"><div class="bar">' + ic('chev', { s: 20, st: 'transform:rotate(180deg);' }) + avatar(c, 36, 4) + '<div><div class="nm">' + esc(c.brand) + '</div><div class="sub">Sponsored</div></div></div>' +
      '<div class="bubble"><b>Hi there,</b><br><br>' + esc(c.liText || c.text) + '</div>' + media(c, 'r191', 'wide').replace('class="media', 'style="margin:0 12px;width:auto;border-radius:8px" class="media') +
      '<div class="msgbtns" style="margin-top:12px"><span>' + esc(c.cta) + '</span><span>Not interested</span></div></div></div>');
  };
  function ttSide(c) { return '<div class="side" style="bottom:130px"><div class="avwrap">' + avatar(c, 44) + '<span class="plus">+</span></div>' + ic('heart', { s: 32, fill: '#fff' }) + '<span style="margin-top:-12px">Like</span>' + ic('comment', { s: 30, fill: '#fff' }) + '<span style="margin-top:-12px">Comment</span>' + ic('save', { s: 30, fill: '#fff' }) + ic('share', { s: 30, fill: '#fff' }) + '<span style="margin-top:-12px">Share</span><span class="av" style="width:32px;height:32px;background:#333;border:6px solid #222"></span></div>'; }
  function ttNav() { return '<div class="nav"><span style="text-align:center">' + ic('home', { s: 22 }) + '<br>Home</span><span style="text-align:center">' + ic('search', { s: 22 }) + '<br>Discover</span><span class="mid">+</span><span style="text-align:center">' + ic('inbox', { s: 22 }) + '<br>Inbox</span><span style="text-align:center">' + ic('user', { s: 22 }) + '<br>Profile</span></div>'; }
  R.tt_feed = function (c) {
    return phone(full('<div class="vert tt">' + media(c, '', 'tall') + '<div class="shade"></div><div class="topnav"><span class="dim">Following</span><span style="border-bottom:2px solid #fff;padding-bottom:3px">For You</span></div>' + ttSide(c) +
      '<div class="bot" style="bottom:64px;right:70px"><div class="handle">' + esc(c.brand) + '<span class="spons">Sponsored</span></div><div class="reelcap clamp2" style="max-width:100%">' + esc(c.ttText || c.text) + ' <b>' + esc(c.tags || '') + '</b></div>' +
      '<div style="display:flex;align-items:center;gap:6px;font-size:12.5px;margin-top:6px">' + ic('music', { s: 14 }) + '<span>Promoted music</span></div>' +
      '<div class="ttcta" style="max-width:100%"><span>' + esc(c.cta) + '</span>' + ic('chev', { s: 16 }) + '</div></div>' + ttNav() + '</div>'), true);
  };
  R.tt_top = function (c) {
    return phone(full('<div class="vert tt topview">' + media(c, '', 'tall') + '<div class="shade"></div><span class="count">Skip 5</span>' +
      '<div style="position:absolute;top:54px;left:12px;z-index:4;color:#fff;font-size:12px;background:rgba(0,0,0,.45);border-radius:4px;padding:2px 8px">Sponsored</div>' +
      '<div class="bot" style="bottom:40px;text-align:center"><div style="font-weight:800;font-size:22px;line-height:1.15;margin-bottom:14px;text-shadow:0 1px 4px rgba(0,0,0,.5)">' + esc(c.headline) + '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:10px">' + avatar(c, 28) + '<b>' + esc(c.brand) + '</b></div><div class="ttcta" style="max-width:none;margin:0 10px;justify-content:center;gap:6px">' + esc(c.cta) + ic('chev', { s: 16 }) + '</div>' +
      '<div style="font-size:12px;opacity:.8;margin-top:12px">First video when the app opens</div></div></div>'), true);
  };
  R.snap_ad = function (c) {
    return phone(full('<div class="vert snap">' + media(c, '', 'tall') + '<div class="shade"></div>' +
      '<div class="tophd" style="top:52px">' + avatar(c, 34, 10) + '<div><div class="nm">' + esc(c.brand) + '</div><div class="adlbl">Ad</div></div><span style="margin-left:auto">' + ic('dots', { s: 22 }) + '</span></div>' +
      '<div class="bot" style="bottom:22px"><div style="font-weight:800;font-size:21px;line-height:1.15;text-align:center;margin:0 10px 14px;text-shadow:0 1px 4px rgba(0,0,0,.55)">' + esc(c.snapHeadline || c.headline) + '</div>' +
      ic('up', { s: 22, st: 'display:block;margin:0 auto;' }) +
      '<div class="attach">' + avatar(c, 38, 10) + '<div style="min-width:0"><div class="t clamp2">' + esc(c.snapHeadline || c.headline) + '</div><div class="s">' + esc(c.domain) + '</div></div><span class="bt">' + esc(c.cta) + '</span></div></div></div>'), true);
  };
  R.snap_disc = function (c) {
    var src = c.imgTall || c.img;
    return phone(full('<div class="snap"><div class="disc"><div style="display:flex;align-items:center;gap:8px"><span class="av" style="width:32px;height:32px;background:#ddd"></span>' + ic('search', { s: 22 }) + '<b style="margin:0 auto;font-size:17px">Stories</b>' + ic('dots', { s: 22 }) + '</div><h4>For you</h4>' +
      '<div class="tiles"><div class="tile"><img src="' + esc(src) + '" alt=""><span class="ad">Ad</span><span class="lbl">' + esc(c.snapHeadline || c.headline) + '<br><span style="font-weight:600;font-size:11.5px">' + esc(c.brand) + '</span></span></div>' +
      '<div class="tile ph"><span class="lbl">Sports</span></div><div class="tile ph" style="background:linear-gradient(160deg,#d8cfc4,#a8998a)"><span class="lbl">Food</span></div><div class="tile ph" style="background:linear-gradient(160deg,#c9d5d0,#8ea79c)"><span class="lbl">Travel</span></div></div></div></div>'));
  };
  R.cg = function (c) {
    var q = c.question || ('Where can I find ' + (c.sells || 'a good option') + (c.city ? ' in ' + c.city : '') + '?');
    return phone(sb() + '<div class="body"><div class="cg"><div class="bar">' + ic('menu', { s: 22 }) + '<span>Chat ' + ic('chev', { s: 14, st: 'transform:rotate(90deg);vertical-align:-2px;' }) + '</span>' + ic('plus', { s: 22 }) + '</div>' +
      '<div class="thread"><div class="u">' + esc(q) + '</div><div class="a"><p>Here are a few things worth comparing before you choose:</p><p><b>1. Reviews and recent work.</b> Look at what past customers say and what was delivered.</p><p><b>2. Price and what\u2019s included.</b> Ask for a clear quote up front.</p></div>' +
      '<div class="tools">' + ic('copy') + ic('up2') + ic('redo') + '</div>' +
      '<div class="ad"><div class="lbl">Sponsored ' + ic('info', { s: 13 }) + '</div><div class="in"><div style="min-width:0;flex:1"><div class="who"><span class="fav" style="background:' + esc(c.color) + '">' + (c.avatar ? '<img src="' + esc(c.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()">' : esc(initials(c.brand).slice(0, 1))) + '</span>' + esc(c.brand) + '</div>' +
      '<div class="ti clamp2">' + esc(c.cgTitle || c.headline) + '</div><div class="ds clamp2">' + esc(c.cgText || c.text) + '</div></div><div class="th"><img src="' + esc(c.imgWide || c.img) + '" alt=""></div></div></div></div>' +
      '<div class="composer">' + ic('plus', { s: 20 }) + 'Ask anything' + '<span class="send">' + ic('arrow', { s: 16, w: 2.4 }) + '</span></div></div></div>');
  };
  R.px = function (c) {
    var q = c.question || ('Best ' + (c.sells || 'options') + (c.city ? ' in ' + c.city : ''));
    var spq = c.pxQuestion || ('What makes ' + c.brand + ' different?');
    return phone(sb() + '<div class="body" style="position:relative"><span class="retired">Retired format, shown for history</span><div class="px"><div style="height:30px"></div><div class="q">' + esc(q) + '</div>' +
      '<div class="srcrow"><span>1 \u00B7 review site</span><span>2 \u00B7 local guide</span><span>3 \u00B7 news</span></div>' +
      '<div class="ans"><p>Several well-reviewed options stand out. Shoppers usually compare quality, price and how quickly they can get it <sup>1</sup>. Recent guides also point to service and after-sales support <sup>2</sup>.</p></div>' +
      '<div class="rel"><div class="h">' + ic('layers', { s: 16 }) + 'Related</div><div class="it"><span>How do prices compare?</span>' + ic('plus', { s: 16 }) + '</div>' +
      '<div class="it sp"><span>' + esc(spq) + '<span class="tag">Sponsored</span></span>' + ic('plus', { s: 16 }) + '</div><div class="it"><span>Which option is fastest?</span>' + ic('plus', { s: 16 }) + '</div></div>' +
      '<div class="ask">Ask a follow-up</div></div></div>');
  };

  /* ---------- estimator ---------- */
  function estimate(pk, mk, placement, daily, days) {
    var m = P[pk].m[mk]; if (!m) return null;
    var cpm = (m.by && m.by[placement]) || m.cpm, total = daily * days;
    return {
      total: total, cpm: cpm, cpc: m.cpc,
      imp: [sig(total / cpm[1] * 1000), sig(total / cpm[0] * 1000)],
      clk: [sig(total / m.cpc[1]), sig(total / m.cpc[0])],
      under: m.minDay && daily < m.minDay ? m.minTxt : '', minTxt: m.minTxt || '', src: m.src
    };
  }

  /* ---------- template copy (used when the AI is busy) ---------- */
  function templateCopy(d) {
    var b = d.brand || 'Your brand', s = d.sells || 'what you do', c = d.city || (d.market === 'in' ? 'India' : 'Dubai');
    var cta = { awareness: 'Learn more', traffic: 'Visit site', leads: 'Get quote', sales: 'Shop now' }[d.objective] || 'Learn more';
    var tag = '#' + slug(b).replace(/[._]/g, '') + ' #' + c.replace(/\s+/g, '') + ' #' + s.split(/\s+/)[0].replace(/[^A-Za-z]/g, '');
    return {
      meta_headline: (s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 40) + ' in ' + c, meta_text: b + ' brings you ' + s + ' in ' + c + '. See what we do and pick what suits you.', meta_cta: cta,
      ig_caption: s.charAt(0).toUpperCase() + s.slice(1) + ', done properly. Made for ' + c + '.', hashtags: tag, tiktok_text: 'POV: you just found ' + s + ' in ' + c + '.',
      snap_headline: s.charAt(0).toUpperCase() + s.slice(1, 34), li_headline: b + ': ' + s + ' for teams in ' + c, li_text: 'Looking for ' + s + ' in ' + c + '? ' + b + ' can help. Here is what we do and how to start.',
      chatgpt_title: b + ' \u2014 ' + s, chatgpt_text: s.charAt(0).toUpperCase() + s.slice(1) + ' in ' + c + '. See options and get in touch.', perplexity_question: 'What does ' + b + ' offer in ' + c + '?'
    };
  }

  /* ---------- image helpers (uploads stay in this browser) ---------- */
  function avgColor(src, cb) {
    var im = new Image(); im.onload = function () {
      try {
        var cv = document.createElement('canvas'); cv.width = cv.height = 24; var x = cv.getContext('2d'); x.drawImage(im, 0, 0, 24, 24);
        var d = x.getImageData(0, 0, 24, 24).data, r = 0, g = 0, b = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        r = r / n * 0.7 | 0; g = g / n * 0.7 | 0; b = b / n * 0.7 | 0; // darken so white CTA text stays readable
        cb('#' + [r, g, b].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''));
      } catch (e) { cb(null); }
    }; im.onerror = function () { cb(null); }; im.src = src;
  }
  function readImages(files, max, cb) {
    var out = [], list = Array.prototype.slice.call(files || [], 0, max).filter(function (f) { return /^image\//.test(f.type) && f.size < 15e6; });
    if (!list.length) return cb(out);
    list.forEach(function (f) { out.push(URL.createObjectURL(f)); });
    cb(out);
  }
  function darkEnough(hex) { var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return null; var n = parseInt(m[1], 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; var l = (0.299 * r + 0.587 * g + 0.114 * b); if (l > 170) { r = r * 0.45 | 0; g = g * 0.45 | 0; b = b * 0.45 | 0; } return '#' + [r, g, b].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''); }

  /* ---------- the per-platform simulator ---------- */
  function seg(name, items, cur) { return '<div class="seg" role="group" data-seg="' + name + '">' + items.map(function (it) { return '<button type="button" data-v="' + it[0] + '" aria-pressed="' + (it[0] === cur) + '"' + (it[2] ? ' disabled title="' + esc(it[2]) + '"' : '') + '>' + esc(it[1]) + '</button>'; }).join('') + '</div>'; }
  function picker() { return '<div class="pick" data-pick>' + IMAGES.map(function (im, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-i="' + i + '" aria-label="Use ' + esc(im.alt) + '"><img src="' + im.src.replace('.webp', '.webp') + '" alt="" loading="lazy"></button>'; }).join('') + '<button type="button" class="up" data-up aria-label="Upload your own image">Upload yours</button></div><input type="file" accept="image/*" data-file hidden>'; }

  function mountSim(root) {
    var pk = root.getAttribute('data-platform'), cfg = P[pk];
    var mk = region() === 'in' ? 'in' : 'ae'; if (!cfg.m[mk] && cfg.m.ae) mk = 'ae';
    if (pk === 'tiktok') mk = 'ae';
    var st = { pl: cfg.placements[0][0], img: IMAGES[0].src, imgTall: IMAGES[1].src, own: null, objective: 'traffic' };
    var dflt = { meta: ['YKS Productions', 'Ads that stop the scroll', 'Strategy, shoot, edit and ad buying from one person. Content built for the feed it runs on.'],
      linkedin: ['YKS Productions', 'Video that B2B buyers actually watch', 'Brand films, founder content and paid LinkedIn campaigns, planned, shot and run by one person.'],
      tiktok: ['YKS Productions', 'Made for the For You feed', 'Hook-first vertical video shot for TikTok, not resized from TV.'],
      snapchat: ['YKS Productions', 'Swipe up to see the work', 'Vertical ads shot for Snapchat in Dubai.'],
      chatgpt: ['YKS Productions', 'Video and paid ads in Dubai', 'One person for strategy, shoot, edit and ads. See the work and get a plan.'],
      perplexity: ['YKS Productions', 'Video and paid ads in Dubai', 'One person for strategy, shoot, edit and ads.'] }[pk];
    var budgetOk = !!(cfg.m.ae || cfg.m['in']);
    root.innerHTML = '<div class="sim"><form class="panel" onsubmit="return false" aria-label="Ad details">' +
      '<div class="fld"><label for="s-brand">Brand name</label><input id="s-brand" value="' + esc(dflt[0]) + '" maxlength="40" autocomplete="organization"></div>' +
      (pk === 'chatgpt' || pk === 'perplexity' ? '<div class="fld"><label for="s-q">What a customer might ask</label><input id="s-q" value="' + (pk === 'chatgpt' ? 'Who can shoot and run ads for my brand in Dubai?' : 'Best video production for ads in Dubai') + '" maxlength="90"></div>' : '') +
      '<div class="fld"><label for="s-head">Headline</label><input id="s-head" value="' + esc(dflt[1]) + '" maxlength="60"></div>' +
      '<div class="fld"><label for="s-text">Ad text</label><textarea id="s-text" maxlength="300">' + esc(dflt[2]) + '</textarea></div>' +
      '<div class="row2"><div class="fld"><label for="s-cta">Button</label><select id="s-cta">' + CTAS.map(function (c) { return '<option' + (c === 'Learn more' ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="s-web">Website</label><input id="s-web" value="yksproductions.com" maxlength="60" inputmode="url"></div></div>' +
      '<div class="fld"><span class="lab">Image <span class="muted">(real YKS shoots, or upload yours; it stays on your device)</span></span>' + picker() + '</div>' +
      (budgetOk ? '<div class="fld"><span class="lab">Market</span>' + seg('mk', [['ae', 'UAE (AED)'], ['in', 'India (\u20B9)', cfg.m['in'] ? '' : (cfg.offIn || 'Not available')]], mk) + (cfg.offIn ? '<div class="hint">' + esc(cfg.offIn) + '</div>' : '') + '</div>' +
      '<div class="row2"><div class="fld"><label for="s-day">Daily budget (<span data-cur>' + (mk === 'in' ? '\u20B9' : 'AED') + '</span>)</label><input id="s-day" type="number" inputmode="numeric" min="1" step="10" value="' + cfg.def[mk][0] + '"></div>' +
      '<div class="fld"><label for="s-days">Days</label><input id="s-days" type="number" inputmode="numeric" min="1" max="365" value="' + cfg.def[mk][1] + '"></div></div>' +
      '<div class="fld"><span class="lab">Objective</span>' + seg('obj', [['awareness', 'Awareness'], ['traffic', 'Traffic'], ['leads', 'Leads'], ['sales', 'Sales']], 'traffic') + '</div>' : '') +
      '</form><div class="stage"><div class="tabs">' + seg('pl', cfg.placements, st.pl) + '</div><div data-prev></div>' +
      '<p class="note">Preview for illustration, not affiliated with ' + esc(cfg.name) + '. Real layouts vary by device and app version.</p></div></div>' +
      (budgetOk ? '<div class="res" data-res aria-live="polite"></div>' : '');
    var f = function (id) { return $('#' + id, root); };
    function ctx() {
      var b = f('s-brand').value.trim() || 'Your brand';
      return { brand: b, handle: slug(b), headline: f('s-head').value, text: f('s-text').value, cta: f('s-cta').value, domain: domainOf(f('s-web').value) || 'yourbrand.com',
        img: st.own || st.img, imgWide: st.own || st.img, imgTall: st.own || st.imgTall, color: st.color || '#1f2a44', avatar: st.own ? null : A + 'favicon-192.png', question: f('s-q') ? f('s-q').value : '', tags: '#Dubai' };
    }
    function draw() {
      $('[data-prev]', root).innerHTML = R[st.pl](ctx());
      var res = $('[data-res]', root); if (!res) return;
      var day = Math.max(0, +f('s-day').value || 0), days = Math.max(1, Math.min(365, +f('s-days').value || 1));
      var e = estimate(pk, mk, st.pl, day, days); if (!e) { res.innerHTML = ''; return; }
      var clickFirst = st.objective !== 'awareness';
      var kI = '<div class="kpi' + (clickFirst ? '' : ' main') + '"><div class="l">Impressions (estimate)</div><div class="v">' + num(e.imp[0], mk) + ' \u2013 ' + num(e.imp[1], mk) + '</div><div class="d">At ' + money(e.cpm[0], mk) + ' \u2013 ' + money(e.cpm[1], mk) + ' per 1,000 views</div></div>';
      var kC = '<div class="kpi' + (clickFirst ? ' main' : '') + '"><div class="l">Clicks (estimate)</div><div class="v">' + num(e.clk[0], mk) + ' \u2013 ' + num(e.clk[1], mk) + '</div><div class="d">At ' + money(e.cpc[0], mk) + ' \u2013 ' + money(e.cpc[1], mk) + ' per click</div></div>';
      res.innerHTML = '<div class="panel"><h3 style="margin-bottom:12px">What ' + money(e.total, mk) + ' could buy</h3><div class="kpis">' + (clickFirst ? kC + kI : kI + kC) + '</div>' +
        (e.under ? '<div class="flag">Below the platform minimum. ' + esc(e.under) + '</div>' : e.minTxt ? '<div class="flag ok">' + esc(e.minTxt) + '</div>' : '') +
        '<p class="est">Estimate only, as a range. Benchmarks: ' + esc(e.src) + ' (see Sources below). You are usually charged either per view or per click, so read the two ranges separately, not added together. Real results depend on targeting, season, the creative and the offer.</p>' +
        '<div class="btns"><a class="btn p" target="_blank" rel="noopener" href="' + esc(wa('Hi Yedukrishna, I tried the ' + cfg.name + ' ad simulator (' + money(day, mk) + ' a day for ' + days + ' days). Can you plan this properly for ' + ctx().brand + '?')) + '">Want this live? WhatsApp me</a></div>' +
        whyShort() + '</div>';
    }
    root.addEventListener('input', draw);
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !root.contains(b)) return;
      var sg = b.closest('[data-seg]');
      if (sg && !b.disabled) {
        $$('button', sg).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var k = sg.getAttribute('data-seg'), v = b.getAttribute('data-v');
        if (k === 'pl') st.pl = v; if (k === 'obj') st.objective = v;
        if (k === 'mk' && v !== mk) { mk = v; $('[data-cur]', root).textContent = mk === 'in' ? '\u20B9' : 'AED'; f('s-day').value = cfg.def[mk][0]; }
        draw(); return;
      }
      if (b.hasAttribute('data-up')) { $('[data-file]', root).click(); return; }
      if (b.hasAttribute('data-i')) {
        $$('[data-pick] button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var im = IMAGES[+b.getAttribute('data-i')]; st.own = null; st.color = null; st.img = im.src; st.imgTall = im.tall ? im.src : IMAGES[1].src; if (!im.tall) st.imgTall = im.src; draw();
      }
    });
    $('[data-file]', root).addEventListener('change', function () {
      readImages(this.files, 1, function (urls) {
        if (!urls.length) return; st.own = urls[0];
        $$('[data-pick] button', root).forEach(function (x) { x.setAttribute('aria-pressed', x.hasAttribute('data-up')); });
        avgColor(urls[0], function (c) { st.color = c; draw(); }); draw();
      });
    });
    draw();
  }

  /* ---------- short "why work with me" (after results and on the hub) ---------- */
  function whyShort() {
    return '<div class="why"><h3>Why work with me</h3><ul>' +
      '<li><b>One person, no hand-offs.</b> I plan it, shoot it, edit it, buy the ads and report on them. No agency markup.</li>' +
      '<li><b>Made for ads.</b> Hook-first, shot in the format each platform plays, not a TV edit squeezed into a phone.</li>' +
      '<li><b>Tested, and reported honestly.</b> Several versions go live, the weak ones stop, and you see the real numbers.</li>' +
      '<li><b>Dubai and India.</b> I know both markets, their costs and their audiences.</li></ul>' +
      '<p style="margin:12px 0 0"><a href="/why-yks/">What changes when you hire me \u2192</a></p></div>';
  }

  /* ---------- brand AI simulator ---------- */
  function mountBrand(root) {
    var mk = region() === 'in' ? 'in' : 'ae', obj = 'traffic', uploads = [], busy = false, last = null;
    root.innerHTML = '<form class="panel" data-bform novalidate>' +
      '<div class="fld"><label for="b-ig">Your Instagram link or handle</label><input id="b-ig" placeholder="instagram.com/yourbrand or @yourbrand" maxlength="120" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="url"><div class="hint">I only read public page details (name, picture, bio). No login, nothing stored.</div></div>' +
      '<details data-more><summary class="btn" style="width:100%;margin-bottom:14px">Instagram not working? Add details instead</summary>' +
      '<div class="row2"><div class="fld"><label for="b-brand">Brand name</label><input id="b-brand" maxlength="60" autocomplete="organization"></div><div class="fld"><label for="b-city">City</label><input id="b-city" maxlength="40" placeholder="' + (mk === 'in' ? 'Bengaluru' : 'Dubai') + '"></div></div>' +
      '<div class="fld"><label for="b-sells">What you sell</label><input id="b-sells" maxlength="120" placeholder="e.g. bridal makeup, villas, specialty coffee"></div>' +
      '<div class="fld"><label for="b-web">Website (optional)</label><input id="b-web" maxlength="200" inputmode="url" placeholder="yourbrand.com" autocapitalize="off"></div>' +
      '<div class="fld"><span class="lab">Your images (1 to 3, optional)</span><input id="b-img" type="file" accept="image/*" multiple><div class="hint">Images stay in your browser. They are never uploaded or stored.</div></div></details>' +
      '<div class="row2"><div class="fld"><span class="lab">Market</span>' + seg('bmk', [['ae', 'UAE'], ['in', 'India']], mk) + '</div><div class="fld"><span class="lab">Goal</span>' + seg('bobj', [['awareness', 'Reach'], ['traffic', 'Traffic'], ['leads', 'Leads'], ['sales', 'Sales']], obj) + '</div></div>' +
      '<button class="btn p" type="submit" style="width:100%" data-go>Generate my ads</button><p class="status" data-status role="status" aria-live="polite"></p></form>' +
      '<div class="ai-out" data-out></div>';
    var S = $('[data-status]', root);
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-seg] button'); if (!b) return;
      var sg = b.closest('[data-seg]'); $$('button', sg).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      if (sg.getAttribute('data-seg') === 'bmk') mk = b.getAttribute('data-v'); else obj = b.getAttribute('data-v');
    });
    $('#b-img', root).addEventListener('change', function () { readImages(this.files, 3, function (u) { uploads = u; }); });
    $('[data-bform]', root).addEventListener('submit', function (ev) {
      ev.preventDefault(); if (busy) return;
      var ig = $('#b-ig', root).value.trim(), d = { brand: $('#b-brand', root).value.trim(), sells: $('#b-sells', root).value.trim(), city: $('#b-city', root).value.trim(), url: $('#b-web', root).value.trim(), market: mk, objective: obj };
      var h = (/instagram\.com\/([A-Za-z0-9._]{1,30})/i.exec(ig) || [])[1] || (/^@?([A-Za-z0-9._]{1,30})$/.exec(ig) || [])[1] || '';
      if (ig && !h) { S.className = 'status err'; S.textContent = 'That does not look like an Instagram handle. Try @yourbrand.'; return; }
      if (!h && !d.brand && !d.url) { S.className = 'status err'; S.textContent = 'Add your Instagram handle, or open "Add details instead" and type your brand name.'; $('[data-more]', root).open = true; return; }
      busy = true; $('[data-go]', root).disabled = true; S.className = 'status'; S.textContent = 'Reading public details and writing your ads\u2026';
      var body = { market: mk, objective: obj }; if (h) body.handle = h; ['brand', 'sells', 'city', 'url'].forEach(function (k) { if (d[k]) body[k] = d[k]; });
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 28000);
      fetch(ADSIM, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'http_' + r.status }; }); })
        .catch(function () { return { ok: false, error: 'network' }; })
        .then(function (j) { clearTimeout(tm); finish(j || {}, h, d); });
    });
    function finish(j, h, d) {
      busy = false; $('[data-go]', root).disabled = false;
      var p = j.profile || {}, copy = j.ok && j.copy ? j.copy : null, notes = [];
      if (j.error === 'rate') { S.className = 'status err'; S.textContent = 'Lots of tries from this connection. Please wait a minute and try again.'; return; }
      if (h && p.blocked) notes.push('Instagram did not share public details with my tool just now (it often asks for a login). I used ' + (p.web_image || p.icon ? 'your website and ' : '') + 'what you typed instead. Add details below for a closer match.');
      if (!copy) { copy = templateCopy({ brand: d.brand || p.name || h, sells: d.sells || p.description || '', city: d.city, market: mk, objective: obj }); notes.push('The AI copywriter is busy right now, so this copy is a simple template from your details. Try again in a minute for AI-written ads.'); }
      var brand = d.brand || p.name || h || 'Your brand';
      var sample = !uploads.length && !p.web_image && !p.image;
      var imgs = uploads.length ? uploads : [p.web_image || p.image].filter(Boolean);
      if (!imgs.length) { imgs = [IMAGES[0].src, IMAGES[1].src]; notes.push('No image found, so these previews use a sample YKS frame. Upload your own above to see your product.'); }
      var c = { brand: brand, handle: h || slug(brand), avatar: p.icon || (h && !p.blocked ? p.image : '') || '', color: darkEnough(p.theme) || '#1f2a44', img: imgs[0], imgWide: imgs[0], imgTall: imgs[1] || imgs[0], imgAlt: brand + ' ad image', sample: sample,
        headline: copy.meta_headline, text: copy.meta_text, cta: CTAS.indexOf(copy.meta_cta) >= 0 ? copy.meta_cta : 'Learn more', caption: copy.ig_caption + (copy.hashtags ? ' ' + copy.hashtags : ''), tags: copy.hashtags,
        ttText: copy.tiktok_text, snapHeadline: copy.snap_headline, liHeadline: copy.li_headline, liText: copy.li_text, cgTitle: copy.chatgpt_title, cgText: copy.chatgpt_text, pxQuestion: copy.perplexity_question,
        domain: domainOf(d.url) || (p.site_status === 'ok' ? domainOf(d.url) : '') || slug(brand).replace(/[._]/g, '') + '.com', sells: d.sells, city: d.city || (mk === 'in' ? 'India' : 'Dubai') };
      last = c;
      var draw = function () {
        var cells = [['ig_feed', 'Instagram feed'], ['ig_story', 'Instagram Story'], ['ig_reel', 'Instagram Reel'], ['tt_feed', 'TikTok in-feed' + (mk === 'in' ? ' (UAE only; blocked in India)' : '')], ['snap_ad', 'Snapchat Snap Ad'], ['li_feed', 'LinkedIn feed'], ['cg', 'ChatGPT sponsored'], ['px', 'Perplexity (retired format)']];
        $('[data-out]', root).innerHTML = '<div class="prof">' + avatar(c, 48) + '<div style="min-width:0"><div class="t">' + esc(brand) + (h ? ' <span class="muted">@' + esc(h) + '</span>' : '') + '</div><div class="s">' + (p.blocked ? 'Instagram blocked the public read; built from your details.' : p.source === 'instagram' ? 'From your public Instagram details. Not right? Add details and try again.' : 'Built from the details you gave.') + '</div></div></div>' +
          (notes.length ? '<div class="flag" style="margin-bottom:16px">' + notes.map(esc).join('<br>') + '</div>' : '') +
          '<div class="ai-grid">' + cells.map(function (x) { return '<figure>' + R[x[0]](c) + '<figcaption>' + esc(x[1]) + '</figcaption></figure>'; }).join('') + '</div>' +
          '<p class="note" style="font-size:15px">AI-generated preview for illustration. Real campaigns are built and shot by YKS. Not affiliated with any platform shown.' + (c.sample ? ' Image: sample YKS frame.' : '') + '</p>' +
          '<div class="btns" style="justify-content:center"><a class="btn p" target="_blank" rel="noopener" href="' + esc(wa('Hi Yedukrishna, I tried your brand ad simulator for ' + brand + (h ? ' (@' + h + ')' : '') + '. Want this live, can we talk?')) + '">Want this live? WhatsApp me</a><a class="btn" href="#lead" data-tolead>Or send my details</a></div>' +
          whyShort() + leadForm(brand, h);
        bindLead(root, brand, h);
        $('[data-out]', root).classList.add('on');
      };
      if (uploads.length && !p.theme) avgColor(uploads[0], function (col) { if (col) c.color = col; draw(); }); else draw();
      S.className = 'status'; S.textContent = j.ok ? 'Done. Scroll to see your ads.' : 'Done, with a template (see note).';
      setTimeout(function () { var o = $('[data-out]', root); if (o && o.scrollIntoView) o.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    }
  }
  function leadForm(brand, h) {
    return '<div class="panel lead" id="lead"><h3>Send me your details</h3><p class="small" style="margin-top:6px">Optional. It comes straight to me and I reply on WhatsApp or email.</p><form data-lead novalidate>' +
      '<div class="row2"><div class="fld"><label for="l-name">Your name</label><input id="l-name" required maxlength="80" autocomplete="name"></div><div class="fld"><label for="l-phone">WhatsApp or phone</label><input id="l-phone" maxlength="30" inputmode="tel" autocomplete="tel"></div></div>' +
      '<div class="row2"><div class="fld"><label for="l-email">Email</label><input id="l-email" type="email" maxlength="120" autocomplete="email"></div><div class="fld"><label for="l-city">City</label><input id="l-city" maxlength="40"></div></div>' +
      '<div class="fld"><label for="l-msg">Anything I should know?</label><textarea id="l-msg" maxlength="800" placeholder="Budget, timing, which platforms"></textarea></div>' +
      '<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="btn p" type="submit" style="width:100%">Send to Yedukrishna</button><p class="status" data-lstat role="status" aria-live="polite"></p></form></div>';
  }
  function bindLead(root, brand, h) {
    var fm = $('[data-lead]', root); if (!fm) return;
    fm.addEventListener('submit', function (ev) {
      ev.preventDefault(); var s = $('[data-lstat]', fm), g = function (id) { return ($('#' + id, fm).value || '').trim(); };
      if (!g('l-name') || (!g('l-phone') && !g('l-email'))) { s.className = 'status err'; s.textContent = 'Please add your name and a WhatsApp number or email.'; return; }
      var btn = $('button[type=submit]', fm); btn.disabled = true; s.className = 'status'; s.textContent = 'Sending\u2026';
      var payload = { kind: 'enquiry', fields: { name: g('l-name'), phone: g('l-phone'), email: g('l-email'), service: 'Paid ads (brand ad simulator)', city: g('l-city'), message: g('l-msg'), company: brand + (h ? ' (@' + h + ')' : '') },
        meta: { form: 'adsim', source: 'marketing.yksproductions.com/ad-simulators', subject: 'Ad simulator enquiry: ' + brand + (h ? ' @' + h : ''), page: location.href, found_via: 'Brand ad simulator', talent: false, category: 'client', ai: null, confirmed: '', seconds_on_page: Math.round((Date.now() - T0) / 1000), website: fm.querySelector('[name=website]').value } };
      fetch(ENQ, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (!j || j.ok !== true) throw 0; s.className = 'status ok'; s.textContent = 'Sent. I will get back to you soon.'; fm.reset(); })
        .catch(function () { btn.disabled = false; s.className = 'status err'; s.innerHTML = 'That did not send. Please <a href="' + esc(wa('Hi Yedukrishna, about ads for ' + brand)) + '" target="_blank" rel="noopener">WhatsApp me</a> instead.'; });
    });
  }

  /* ---------- page chrome: mobile menu ---------- */
  function menu() {
    var b = $('[data-menu]'), d = $('#drawer'); if (!b || !d) return;
    b.addEventListener('click', function () { var o = d.classList.toggle('open'); b.setAttribute('aria-expanded', o); b.textContent = o ? 'Close' : 'Menu'; });
    d.addEventListener('click', function (e) { if (e.target.closest('a')) { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.textContent = 'Menu'; } });
  }
  function boot() {
    menu();
    $$('[data-platform]').forEach(mountSim);
    $$('[data-brandai]').forEach(mountBrand);
    $$('[data-why]').forEach(function (el) { el.innerHTML = whyShort(); });
    $$('[data-preview]').forEach(function (el) { // static card thumbnails on the hub
      var k = el.getAttribute('data-preview');
      el.innerHTML = R[k]({ brand: 'YKS Productions', handle: 'yksproductions', headline: 'Ads that stop the scroll', text: 'Strategy, shoot, edit and ad buying from one person.', caption: 'Shot for the feed it runs on.', cta: 'Learn more', domain: 'yksproductions.com', img: IMAGES[0].src, imgWide: IMAGES[0].src, imgTall: IMAGES[1].src, color: '#1f2a44', avatar: A + 'favicon-192.png', question: 'Who can shoot and run ads for my brand in Dubai?' });
    });
  }
  window.YKSSIM = { estimate: estimate, P: P, templateCopy: templateCopy };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

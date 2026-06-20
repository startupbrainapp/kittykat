/* KittyKat — Settings/Admin state extension (prototype).
   Adds the `KK.admin` namespace on top of the Execution engine in data.js.
   Loaded AFTER data.js. Persisted to its own localStorage key (kk_admin_v1)
   so it never touches the Execution flow's state (kk_state_v1).
   Backs the Admin, Team, Presets, and Data Sources pages.
   In a real build this becomes the settings/admin API; entities stay identical. */
(function () {
  if (!window.KK) { console.warn('data-admin.js: window.KK missing — load data.js first'); return; }
  var KEY = 'kk_admin_v1';

  var SEED = {
    members: [
      { id: 'kathy',  name: 'Kathy S.',  email: 'kathy@bape.com',  initial: 'K', color: 'var(--brand-accent)', role: 'CMO',           access: 'All campaigns',                  lastActive: 'Active now', activeNow: true },
      { id: 'marcus', name: 'Marcus T.', email: 'marcus@bape.com', initial: 'M', color: 'var(--status-green)',  role: 'Creative Lead', access: 'Hana Matsuri, Sakura Camo, Baby Milo', lastActive: '2h ago' },
      { id: 'yuki',   name: 'Yuki A.',   email: 'yuki@bape.com',   initial: 'Y', color: 'var(--status-amber)',  role: 'Regional Manager, JP', access: 'Japan campaigns',          lastActive: '1d ago' },
      { id: 'sarah',  name: 'Sarah L.',  email: 'sarah@bape.com',  initial: 'S', color: 'var(--bg-elevated)',   role: 'Designer',      access: 'Sakura Camo, Shark Hoodie',       lastActive: '3h ago' },
      { id: 'james',  name: 'James K.',  email: 'james@bape.com',  initial: 'J', color: 'var(--bg-elevated)',   role: 'Analyst',       access: 'All campaigns (view only)',       lastActive: '5h ago' },
      { id: 'priya',  name: 'Priya R.',  email: 'priya@bape.com',  initial: 'P', color: 'var(--bg-elevated)',   role: 'Designer',      access: 'Baby Milo, Color Camo',           lastActive: '1d ago' },
      { id: 'tom',    name: 'Tom W.',    email: 'tom@bape.com',    initial: 'T', color: 'var(--status-amber)',  role: 'Regional Manager, UK', access: 'UK campaigns',             lastActive: '2d ago' }
    ],
    invites: [
      { id: 'inv-alex', email: 'alex.chen@bape.com', role: 'Designer', invited: 'Apr 14, 2026' },
      { id: 'inv-nina', email: 'nina.o@bape.com',    role: 'Analyst',  invited: 'Apr 12, 2026' }
    ],
    // roles available when inviting / changing a member's role
    roles: ['CMO', 'Creative Lead', 'Regional Manager, JP', 'Regional Manager, UK', 'Designer', 'Analyst', 'Reviewer'],

    integrations: [
      { id: 'meta',      name: 'Meta Ads',           logo: 'meta',      cls: 'meta',      connected: true,  lastSync: '2h ago' },
      { id: 'google',    name: 'Google Ads',         logo: 'google',    cls: 'google',    connected: true,  lastSync: '1h ago' },
      { id: 'tiktok',    name: 'TikTok Ads',         logo: 'tiktok',    cls: 'tiktok',    connected: true,  lastSync: '3h ago' },
      { id: 'pinterest', name: 'Pinterest Ads',      logo: 'pinterest', cls: 'pinterest', connected: true,  lastSync: '6h ago' },
      { id: 'ga4',       name: 'Google Analytics 4', logo: 'ga4',       cls: 'ga4',       connected: true,  lastSync: '30m ago' },
      { id: 'shopify',   name: 'Shopify',            logo: 'shopify',   cls: 'shopify',   connected: true,  lastSync: '1h ago' }
    ],

    settings: {
      retainCampaignData: '24 months',
      retainCreativeAssets: '12 months',
      autoDeleteRejected: true,
      gdprPurge: true
    },

    plan: { name: 'Pro Plan', renews: 'Apr 30, 2026', price: '$499', period: '/mo' },

    workspaces: [
      { id: 'bape', name: 'BAPE', logo: 'bape-logo.png', active: true }
    ],

    audit: [
      { user: 'Kathy S.', system: false, action: 'Changed role for James K. to Analyst', date: 'Apr 17, 2026', time: '10:42 AM' },
      { user: 'Marcus T.', system: false, action: 'Approved brief "Sakura Camo"',          date: 'Apr 17, 2026', time: '9:15 AM' },
      { user: 'System', system: true,  action: 'Auto-synced Meta Ads data',               date: 'Apr 17, 2026', time: '8:00 AM' },
      { user: 'Yuki A.', system: false, action: 'Exported Q1 Brand Health report',         date: 'Apr 16, 2026', time: '4:30 PM' },
      { user: 'Kathy S.', system: false, action: 'Updated scoring weights',                date: 'Apr 16, 2026', time: '2:15 PM' },
      { user: 'System', system: true,  action: 'Auto-purged 34 rejected assets',          date: 'Apr 16, 2026', time: '12:00 AM' },
      { user: 'Sarah L.', system: false, action: 'Uploaded 12 assets to Sakura Camo',       date: 'Apr 15, 2026', time: '3:45 PM' },
      { user: 'Marcus T.', system: false, action: 'Invited priya@bape.com',                 date: 'Apr 15, 2026', time: '11:20 AM' }
    ],

    // --- Presets page ---
    templates: [
      { id: 'tpl-ss26',     title: 'SS26 Campaign Brief', desc: 'Standard seasonal campaign brief with audience, channels, and territory pre-filled.', owner: 'Kathy S.',  used: 12 },
      { id: 'tpl-collab',   title: 'Collab Brief',        desc: 'Template for collaboration campaigns with partner info fields.',                        owner: 'Marcus T.', used: 6 },
      { id: 'tpl-regional', title: 'Regional Launch',     desc: 'Localized campaign brief with region-specific fields.',                                 owner: 'Yuki A.',   used: 8 }
    ],
    exportFormats: [
      { id: 'fmt-meta',      name: 'Meta Ads',       specs: '1080x1080, 1080x1920, 1200x628 · JPG/PNG' },
      { id: 'fmt-google',    name: 'Google Display', specs: '300x250, 728x90, 160x600 · JPG' },
      { id: 'fmt-tiktok',    name: 'TikTok',         specs: '1080x1920 · MP4/JPG' },
      { id: 'fmt-pinterest', name: 'Pinterest',      specs: '1000x1500 · PNG' }
    ],
    audiences: [
      { id: 'aud-genz',    name: 'Gen Z Streetwear',      region: '18-24, US+JP',    interests: 'Streetwear interest',     used: 8 },
      { id: 'aud-mill',    name: 'Millennial Collectors', region: '25-34, Global',   interests: 'Sneaker/archive interest', used: 5 },
      { id: 'aud-jp',      name: 'JP Hypebeast',          region: '18-30, Japan only', interests: 'Harajuku/Shibuya',       used: 4 },
      { id: 'aud-uk',      name: 'UK Skate',              region: '16-28, UK',       interests: 'Skateboarding/street',    used: 3 },
      { id: 'aud-luxury',  name: 'Luxury Crossover',      region: '28-45, US+EU',    interests: 'Designer/luxury',         used: 2 }
    ],
    weights: [
      { id: 'w-dna',         label: 'Brand DNA fit',        value: 30, color: 'var(--brand-accent)' },
      { id: 'w-audience',    label: 'Audience overlap',     value: 25, color: 'var(--status-green)' },
      { id: 'w-whitespace',  label: 'Competitor whitespace', value: 25, color: 'var(--status-amber)' },
      { id: 'w-trending',    label: 'Trending signal',      value: 20, color: 'var(--status-red)' }
    ],

    // --- Data Sources (brand_setup_v2) ---
    dataSources: [
      { id: 'ds-ig',         group: 'Social Channels',     name: 'Instagram — @bape_us',      connected: true,  detail: 'Synced 2h ago' },
      { id: 'ds-tt',         group: 'Social Channels',     name: 'TikTok — @bape',            connected: true,  detail: 'Synced 3h ago' },
      { id: 'ds-yt',         group: 'Social Channels',     name: 'YouTube — BAPE Official',   connected: false, detail: 'Not connected' },
      { id: 'ds-x',          group: 'Social Channels',     name: 'X — @BAPEOFFICIAL',         connected: false, detail: 'Not connected' },
      { id: 'ds-comp-supreme', group: 'Competitor Handles', name: '@supremenewyork',          connected: true,  detail: 'Tracking' },
      { id: 'ds-comp-stussy',  group: 'Competitor Handles', name: '@stussy',                  connected: true,  detail: 'Tracking' },
      { id: 'ds-catalog',    group: 'Product Catalog',     name: 'Shopify product feed',      connected: true,  detail: '482 products' },
      { id: 'ds-ga4',        group: 'Ad Platform Connections', name: 'Google Analytics 4',   connected: true,  detail: 'Synced 30m ago' },
      { id: 'ds-meta',       group: 'Ad Platform Connections', name: 'Meta Ads',             connected: true,  detail: 'Synced 2h ago' },
      { id: 'ds-google-ads', group: 'Ad Platform Connections', name: 'Google Ads',          connected: false, detail: 'Not connected' }
    ]
  };

  function read() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return null;
  }
  var hadSaved = !!read();
  var state = read() || JSON.parse(JSON.stringify(SEED));
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function uid(prefix, list) {
    var n = 1, id;
    do { id = prefix + '-' + n++; } while (list.some(function (x) { return x.id === id; }));
    return id;
  }
  function nameFromEmail(email) {
    var local = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
    return local.split(' ').map(function (w) { return w ? w[0].toUpperCase() + w.slice(1) : ''; }).join(' ') || email;
  }
  // pad-free 2-digit
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(d) {
    d = d || new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM'; var hr = h % 12; if (hr === 0) hr = 12;
    return {
      date: months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
      time: hr + ':' + two(m) + ' ' + ampm
    };
  }

  var admin = {
    // ---------- Team ----------
    members: function () { return state.members.slice(); },
    member: function (id) { return state.members.find(function (m) { return m.id === id; }) || null; },
    roles: function () { return state.roles.slice(); },
    addMember: function (input) {
      input = input || {};
      var email = (input.email || '').trim();
      if (!email) return null;
      var name = (input.name || nameFromEmail(email)).trim();
      var member = {
        id: uid('mbr', state.members),
        name: name, email: email, initial: (name[0] || '?').toUpperCase(),
        color: 'var(--bg-elevated)',
        role: input.role || 'Designer',
        access: input.access || 'No campaigns yet',
        lastActive: 'Never', activeNow: false
      };
      state.members.push(member); save();
      this.log(input.by || 'You', 'Added member ' + email);
      return member;
    },
    updateMember: function (id, patch) {
      var m = this.member(id); if (!m) return null;
      var prevRole = m.role;
      Object.keys(patch || {}).forEach(function (k) { m[k] = patch[k]; });
      save();
      if (patch && patch.role && patch.role !== prevRole) this.log('You', 'Changed role for ' + m.name + ' to ' + patch.role);
      return m;
    },
    removeMember: function (id) {
      var m = this.member(id); if (!m) return false;
      state.members = state.members.filter(function (x) { return x.id !== id; });
      save(); this.log('You', 'Removed member ' + m.email); return true;
    },

    // ---------- Invites ----------
    invites: function () { return state.invites.slice(); },
    invite: function (email, role) {
      email = (email || '').trim(); if (!email) return null;
      var s = stamp();
      var inv = { id: uid('inv', state.invites), email: email, role: role || 'Designer', invited: s.date };
      state.invites.push(inv); save();
      this.log('You', 'Invited ' + email); return inv;
    },
    resendInvite: function (id) {
      var inv = state.invites.find(function (i) { return i.id === id; });
      if (inv) this.log('You', 'Resent invite to ' + inv.email);
      return inv || null;
    },
    revokeInvite: function (id) {
      var inv = state.invites.find(function (i) { return i.id === id; });
      state.invites = state.invites.filter(function (i) { return i.id !== id; });
      save(); if (inv) this.log('You', 'Revoked invite to ' + inv.email);
      return !!inv;
    },

    // ---------- Integrations ----------
    integrations: function () { return state.integrations.slice(); },
    setIntegration: function (id, connected) {
      var it = state.integrations.find(function (x) { return x.id === id; });
      if (!it) return null;
      it.connected = !!connected;
      it.lastSync = connected ? 'just now' : 'Not connected';
      save();
      this.log('You', (connected ? 'Connected ' : 'Disconnected ') + it.name);
      return it;
    },

    // ---------- Settings (data retention) ----------
    settings: function () { return Object.assign({}, state.settings); },
    setSetting: function (key, value) {
      if (!(key in state.settings)) return null;
      state.settings[key] = value; save();
      this.log('You', 'Updated setting: ' + key);
      return state.settings[key];
    },

    plan: function () { return Object.assign({}, state.plan); },

    // ---------- Workspaces ----------
    workspaces: function () { return state.workspaces.slice(); },
    addWorkspace: function (name) {
      name = (name || '').trim(); if (!name) return null;
      var ws = { id: uid('ws', state.workspaces), name: name, logo: '', active: false };
      state.workspaces.push(ws); save();
      this.log('You', 'Added workspace ' + name); return ws;
    },

    // ---------- Audit log ----------
    audit: function () { return state.audit.slice(); },
    log: function (user, action, date) {
      var s = stamp(date);
      state.audit.unshift({ user: user || 'You', system: user === 'System', action: action, date: s.date, time: s.time });
      if (state.audit.length > 200) state.audit.length = 200;
      save();
    },
    auditCsv: function () {
      var rows = [['User', 'Action', 'Date', 'Time']].concat(state.audit.map(function (e) {
        return [e.user, e.action, e.date, e.time];
      }));
      return rows.map(function (r) {
        return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
    },

    // ---------- Presets: templates ----------
    templates: function () { return state.templates.slice(); },
    addTemplate: function (input) {
      input = input || {};
      var t = { id: uid('tpl', state.templates), title: (input.title || 'Untitled Template').trim(), desc: input.desc || '', owner: input.owner || 'You', used: 0 };
      state.templates.unshift(t); save(); return t;
    },
    updateTemplate: function (id, patch) {
      var t = state.templates.find(function (x) { return x.id === id; }); if (!t) return null;
      Object.keys(patch || {}).forEach(function (k) { t[k] = patch[k]; }); save(); return t;
    },
    duplicateTemplate: function (id) {
      var t = state.templates.find(function (x) { return x.id === id; }); if (!t) return null;
      var copy = { id: uid('tpl', state.templates), title: t.title + ' (Copy)', desc: t.desc, owner: 'You', used: 0 };
      state.templates.unshift(copy); save(); return copy;
    },
    removeTemplate: function (id) {
      var had = state.templates.some(function (x) { return x.id === id; });
      state.templates = state.templates.filter(function (x) { return x.id !== id; }); save(); return had;
    },

    // ---------- Presets: export formats ----------
    exportFormats: function () { return state.exportFormats.slice(); },
    addFormat: function (input) {
      input = input || {};
      var f = { id: uid('fmt', state.exportFormats), name: (input.name || 'New Format').trim(), specs: input.specs || '' };
      state.exportFormats.push(f); save(); return f;
    },
    removeFormat: function (id) {
      var had = state.exportFormats.some(function (x) { return x.id === id; });
      state.exportFormats = state.exportFormats.filter(function (x) { return x.id !== id; }); save(); return had;
    },

    // ---------- Presets: audiences ----------
    audiences: function () { return state.audiences.slice(); },
    addAudience: function (input) {
      input = input || {};
      var a = { id: uid('aud', state.audiences), name: (input.name || 'New Audience').trim(), region: input.region || '', interests: input.interests || '', used: 0 };
      state.audiences.push(a); save(); return a;
    },
    removeAudience: function (id) {
      var had = state.audiences.some(function (x) { return x.id === id; });
      state.audiences = state.audiences.filter(function (x) { return x.id !== id; }); save(); return had;
    },

    // ---------- Presets: scoring weights ----------
    weights: function () { return state.weights.slice(); },
    setWeights: function (map) {
      // map: { id: value, ... }
      state.weights.forEach(function (w) { if (map && typeof map[w.id] === 'number') w.value = map[w.id]; });
      save(); this.log('You', 'Updated scoring weights'); return state.weights.slice();
    },
    weightsTotal: function () { return state.weights.reduce(function (n, w) { return n + (w.value || 0); }, 0); },

    // ---------- Data Sources ----------
    dataSources: function (group) {
      var list = state.dataSources.slice();
      return group ? list.filter(function (d) { return d.group === group; }) : list;
    },
    dataSourceGroups: function () {
      var set = [];
      state.dataSources.forEach(function (d) { if (set.indexOf(d.group) < 0) set.push(d.group); });
      return set;
    },
    toggleSource: function (id, connected) {
      var d = state.dataSources.find(function (x) { return x.id === id; }); if (!d) return null;
      d.connected = (typeof connected === 'boolean') ? connected : !d.connected;
      d.detail = d.connected ? 'Synced just now' : 'Not connected';
      save(); return d;
    },
    addSource: function (input) {
      input = input || {};
      var d = { id: uid('ds', state.dataSources), group: input.group || 'Social Channels', name: (input.name || 'New source').trim(), connected: !!input.connected, detail: input.connected ? 'Synced just now' : 'Not connected' };
      state.dataSources.push(d); save(); return d;
    },
    removeSource: function (id) {
      var had = state.dataSources.some(function (x) { return x.id === id; });
      state.dataSources = state.dataSources.filter(function (x) { return x.id !== id; }); save(); return had;
    },

    // ---------- maintenance ----------
    save: save,
    reset: function () { state = JSON.parse(JSON.stringify(SEED)); save(); return state; }
  };

  window.KK.admin = admin;
  if (!hadSaved) save();
})();

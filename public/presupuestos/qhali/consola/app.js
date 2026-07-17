// Qhali — Consola de administración. SPA vanilla (sin frameworks, sin build step).
(function () {
  'use strict';

  // ------------------------------------------------------------ helpers base
  function el(tag, opts, children) {
    var node = document.createElement(tag);
    opts = opts || {};
    Object.keys(opts).forEach(function (k) {
      var v = opts[k];
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'on') { Object.keys(v).forEach(function (ev) { node.addEventListener(ev, v[ev]); }); }
      else if (k === 'attrs') { Object.keys(v).forEach(function (a) { node.setAttribute(a, v[a]); }); }
      else if (k in node) { try { node[k] = v; } catch (e) { node.setAttribute(k, v); } }
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild((typeof c === 'string' || typeof c === 'number') ? document.createTextNode(String(c)) : c);
    });
    return node;
  }

  function ic(name, size) {
    size = size || 20;
    var wrap = el('span', { class: 'ic' });
    var lib = window.lucide;
    var ctor = lib && (lib[name] || lib.Circle);
    if (ctor) {
      var svg = lib.createElement(ctor);
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', '1.75');
      wrap.appendChild(svg);
    }
    return wrap;
  }

  function money(n) { return '$' + (Number(n) || 0).toLocaleString('es-AR'); }
  function finalDe(costo) { return Math.round(costo.precio_lista * (1 + costo.margen)); }

  // ------------------------------------------------------------ primitivas UI
  function btn(label, opts) {
    opts = opts || {};
    var variant = opts.variant || 'primary';
    var size = opts.size || 'md';
    var classes = ['btn', 'btn-' + variant, 'btn-' + size];
    if (opts.fullWidth) classes.push('btn-full');
    if (opts.className) classes.push(opts.className);
    var b = el('button', { class: classes.join(' '), type: 'button' });
    if (opts.leftIcon) b.appendChild(opts.leftIcon);
    if (label !== null && label !== undefined) b.appendChild(document.createTextNode(label));
    if (opts.rightIcon) b.appendChild(opts.rightIcon);
    if (opts.disabled) b.disabled = true;
    if (opts.onClick) b.addEventListener('click', opts.onClick);
    return b;
  }

  function iconBtn(opts) {
    opts = opts || {};
    var size = opts.size || 'md';
    var tone = opts.tone || 'ghost';
    var classes = ['icon-btn', 'icon-btn-' + size, 'icon-btn-' + tone];
    if (opts.shape === 'rounded') classes.push('icon-btn-rounded');
    var b = el('button', { class: classes.join(' '), type: 'button', attrs: { 'aria-label': opts.ariaLabel || '' } });
    if (opts.icon) b.appendChild(opts.icon);
    if (opts.disabled) b.disabled = true;
    if (opts.onClick) b.addEventListener('click', opts.onClick);
    return b;
  }

  var ESTADO_TONE = { pendiente: 'warning', pagado: 'info', preparado: 'brand', despachado: 'info', entregado: 'success', cancelado: 'danger' };
  function qbadge(opts) {
    opts = opts || {};
    var tone = opts.tone || 'neutral';
    var text = opts.text;
    if (opts.estado) {
      tone = ESTADO_TONE[opts.estado] || 'neutral';
      if (text === undefined) text = opts.estado.charAt(0).toUpperCase() + opts.estado.slice(1);
    }
    var span = el('span', { class: 'qbadge qbadge-' + tone });
    if (opts.dot) span.appendChild(el('span', { class: 'qbadge-dot' }));
    span.appendChild(document.createTextNode(text || ''));
    return span;
  }

  function qtag(text, opts) {
    opts = opts || {};
    var span = el('span', { class: 'qtag qtag-' + (opts.tone || 'brand') });
    if (opts.icon) span.appendChild(opts.icon);
    span.appendChild(document.createTextNode(text));
    return span;
  }

  function emptyState(opts) {
    opts = opts || {};
    var wrap = el('div', { class: 'empty-state' });
    if (opts.icon) { var i = el('div', { class: 'empty-state-icon' }); i.appendChild(opts.icon); wrap.appendChild(i); }
    if (opts.title) wrap.appendChild(el('div', { class: 'empty-state-title' }, [opts.title]));
    if (opts.description) wrap.appendChild(el('p', { class: 'empty-state-desc' }, [opts.description]));
    return wrap;
  }

  function priceTagEl(value, size) {
    return el('div', { class: 'price-tag price-tag-' + (size || 'md') }, [money(value)]);
  }

  // title: string|Node|null ; actionChildren: Node|Node[]|null — cada item es hijo directo de .panel-action
  function panelShell(title, actionChildren, className) {
    var section = el('section', { class: 'panel' + (className ? ' ' + className : '') });
    if (title || actionChildren) {
      var header = el('header', { class: 'panel-header' });
      if (title) header.appendChild(typeof title === 'string' ? el('h2', { class: 'panel-title' }, [title]) : title);
      if (actionChildren) {
        var a = el('div', { class: 'panel-action' });
        (Array.isArray(actionChildren) ? actionChildren : [actionChildren]).forEach(function (n) { a.appendChild(n); });
        header.appendChild(a);
      }
      section.appendChild(header);
    }
    return section;
  }

  function inputField(opts) {
    opts = opts || {};
    var wrap = el('div', { class: 'input-wrap' });
    if (opts.label) wrap.appendChild(el('label', { class: 'field-label' }, [opts.label]));
    var box = el('div', { class: 'input-box' + (opts.disabled ? ' disabled' : '') });
    if (opts.leadingIcon) { var li = el('span', { class: 'input-adorn' }); li.appendChild(opts.leadingIcon); box.appendChild(li); }
    var inputOpts = { class: 'input-el', type: opts.type || 'text', placeholder: opts.placeholder || '', value: opts.value !== undefined ? opts.value : '' };
    var input = el('input', inputOpts);
    if (opts.min !== undefined) input.setAttribute('min', opts.min);
    if (opts.disabled) input.disabled = true;
    box.appendChild(input);
    if (opts.trailingIcon) { var ti = el('span', { class: 'input-adorn' }); ti.appendChild(opts.trailingIcon); box.appendChild(ti); }
    wrap.appendChild(box);
    if (opts.helperText) wrap.appendChild(el('span', { class: 'input-helper' }, [opts.helperText]));
    wrap._input = input;
    return wrap;
  }

  function selectEl(options, value, onChange, extraStyle) {
    var sel = el('select', { class: 'qselect' });
    if (extraStyle) sel.style.cssText += extraStyle;
    options.forEach(function (o) {
      var isObj = o !== null && typeof o === 'object';
      var optVal = isObj ? o.value : o;
      var optLabel = isObj ? o.label : o;
      var opt = el('option', { value: optVal }, [optLabel]);
      if (optVal === value) opt.selected = true;
      sel.appendChild(opt);
    });
    if (onChange) sel.addEventListener('change', function (e) { onChange(e.target.value); });
    return sel;
  }

  function segmentedControl(options, value, onChange) {
    var wrap = el('div', { class: 'segmented' });
    function build(current) {
      wrap.innerHTML = '';
      options.forEach(function (o) {
        var b = el('button', { class: 'segmented-btn' + (o.value === current ? ' active' : ''), type: 'button' }, [o.label]);
        b.addEventListener('click', function () { onChange(o.value); });
        wrap.appendChild(b);
      });
    }
    build(value);
    wrap._setActive = build;
    return wrap;
  }

  function deleteConfirm(opts) {
    opts = opts || {};
    var wrap = el('span', {});
    function showIcon() {
      wrap.innerHTML = '';
      wrap.appendChild(iconBtn({ ariaLabel: 'Eliminar', size: 'sm', tone: 'ghost', icon: ic('Trash2', 16), onClick: showConfirm }));
    }
    function showConfirm() {
      wrap.innerHTML = '';
      var pill = el('span', { class: 'delete-confirm-pill' });
      var lbl = el('span', { class: 'delete-confirm-label' }, [opts.label || '¿Eliminar?']);
      if (opts.hint) lbl.title = opts.hint;
      pill.appendChild(lbl);
      pill.appendChild(btn('Sí', { size: 'sm', className: 'btn-danger-solid', onClick: function () { opts.onConfirm && opts.onConfirm(); } }));
      pill.appendChild(btn('No', { size: 'sm', variant: 'ghost', onClick: showIcon }));
      wrap.appendChild(pill);
    }
    showIcon();
    return wrap;
  }

  function openDrawer(opts) {
    closeDrawer();
    var root = document.getElementById('drawer-root');
    var scrim = el('div', { class: 'drawer-scrim' });
    var panelEl = el('div', { class: 'drawer-panel' });
    var header = el('header', { class: 'drawer-header' });
    var titleEl = el('span', { class: 'drawer-title' }, [opts.title || '']);
    var closeBtn = iconBtn({ ariaLabel: 'Cerrar', icon: ic('X', 18), onClick: function () { close(); } });
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    var body = el('div', { class: 'drawer-body' });
    var footer = el('footer', { class: 'drawer-footer' });
    panelEl.appendChild(header);
    panelEl.appendChild(body);
    panelEl.appendChild(footer);
    scrim.addEventListener('click', function () { close(); });
    root.appendChild(scrim);
    root.appendChild(panelEl);
    function close() { root.innerHTML = ''; }
    var api = {
      close: close,
      setTitle: function (t) { titleEl.textContent = t; },
      setBody: function (nodes) { body.innerHTML = ''; (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { body.appendChild(n); }); },
      setFooter: function (nodes) { footer.innerHTML = ''; (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { footer.appendChild(n); }); },
    };
    opts.build(api);
    return api;
  }
  function closeDrawer() { var root = document.getElementById('drawer-root'); if (root) root.innerHTML = ''; }

  // ------------------------------------------------------------ estado global
  var state = {
    nav: 'panel',
    filtroProds: null,
    prods: [],
    dists: [],
    orders: [],
    caja: null,
    ui: { productos: {}, pedidos: {}, caja: {} },
  };

  function initState() {
    var catalogo = window.QhaliData;
    var admin = window.QhaliAdmin;
    state.prods = catalogo.productos.map(function (p) {
      return Object.assign({}, p, { stock_minimo: p.stock_minimo != null ? p.stock_minimo : 5, costo: admin.costos[p.id] || null });
    });
    state.dists = admin.distribuidores.map(function (d) { return Object.assign({}, d); });
    state.orders = admin.pedidos.map(function (o) { return Object.assign({}, o); });
    state.caja = {
      abierta: false, montoInicial: 0, aperturaHora: null, empleado: 'Paula L.', movimientos: [],
      historial: [{
        fecha: 'Ayer 16 jul', empleado: 'Paula L.', aperturaHora: '08:32', cierreHora: '20:05',
        montoInicial: 20000, efectivo: 18670, transfer: 6120, ingresos: 0, egresos: 3500,
        esperado: 35170, contado: 35170, dif: 0, ventas: 5,
        movimientos: [{ tipo: 'egreso', concepto: 'Compra bolsas kraft', monto: 3500, hora: '11:20' }],
      }],
    };
  }

  // ------------------------------------------------------------ shell (sidebar + topbar)
  var NAV_ITEMS = [
    { key: 'panel', label: 'Panel', icon: 'LayoutDashboard' },
    { key: 'productos', label: 'Productos', icon: 'Package', hasBadge: true },
    { key: 'pedidos', label: 'Pedidos', icon: 'ShoppingBag', hasBadge: true },
    { key: 'caja', label: 'Caja', icon: 'Wallet', hasDot: true },
    { key: 'distribuidores', label: 'Distribuidores', icon: 'Truck' },
  ];
  var TITLES = { panel: 'Panel de control', productos: 'Productos, stock y márgenes', pedidos: 'Gestión de pedidos', caja: 'Caja del día', distribuidores: 'Distribuidores' };

  function buildShell() {
    var app = document.getElementById('app');
    app.innerHTML = '';

    var sidebar = el('aside', { class: 'sidebar' });
    var brand = el('div', { class: 'sidebar-brand' });
    brand.appendChild(el('img', { attrs: { src: '../assets/logo-badge-circle.png', alt: 'Qhali' } }));
    var brandText = el('div', {});
    brandText.appendChild(el('div', { class: 'sidebar-brand-name' }, ['Qhali']));
    brandText.appendChild(el('div', { class: 'sidebar-brand-eyebrow' }, ['Consola']));
    brand.appendChild(brandText);
    sidebar.appendChild(brand);

    var nav = el('nav', { class: 'sidebar-nav' });
    NAV_ITEMS.forEach(function (it) {
      var b = el('button', { class: 'nav-item', type: 'button', attrs: { 'data-key': it.key } });
      b.appendChild(ic(it.icon, 19));
      b.appendChild(el('span', { class: 'nav-label' }, [it.label]));
      if (it.key === 'caja') b.appendChild(el('span', { class: 'nav-dot', attrs: { 'data-caja-dot': '1', title: 'Caja abierta' } }));
      if (it.hasBadge) b.appendChild(el('span', { class: 'nav-badge', attrs: { 'data-badge': it.key } }, ['0']));
      b.addEventListener('click', function () { state.filtroProds = null; goTo(it.key); });
      nav.appendChild(b);
    });
    sidebar.appendChild(nav);

    var footer = el('div', { class: 'sidebar-footer' });
    footer.appendChild(el('span', { class: 'sidebar-avatar' }, ['PL']));
    var userWrap = el('div', { class: 'sidebar-user' });
    userWrap.appendChild(el('div', { class: 'sidebar-user-name' }, ['Paula L.']));
    userWrap.appendChild(el('div', { class: 'sidebar-user-role' }, ['Empleada']));
    footer.appendChild(userWrap);
    sidebar.appendChild(footer);
    sidebar.appendChild(el('a', { class: 'sidebar-back', attrs: { href: '../index.html' } }, ['← Volver a la presentación']));

    var contentCol = el('div', { class: 'content-col' });
    var topbar = el('header', { class: 'topbar' });
    topbar.appendChild(el('h1', { class: 'topbar-title', id: 'topbar-title' }, ['']));
    topbar.appendChild(iconBtn({ ariaLabel: 'Notificaciones', tone: 'tonal', icon: ic('Bell', 18) }));
    contentCol.appendChild(topbar);
    var main = el('main', { class: 'main', id: 'main-content' });
    contentCol.appendChild(main);

    app.appendChild(sidebar);
    app.appendChild(contentCol);
  }

  function goTo(key) { state.nav = key; renderMain(); }

  function updateSidebarActive() {
    document.querySelectorAll('.nav-item').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-key') === state.nav);
    });
  }

  function setNavBadge(key, n) {
    var elx = document.querySelector('[data-badge="' + key + '"]');
    if (!elx) return;
    elx.textContent = n;
    elx.classList.toggle('show', n > 0);
  }

  function updateSidebarBadges() {
    var reponer = state.prods.filter(function (p) { return p.stock <= p.stock_minimo; }).length;
    var pendientes = state.orders.filter(function (o) { return o.estado === 'pendiente'; }).length;
    setNavBadge('productos', reponer);
    setNavBadge('pedidos', pendientes);
    var dot = document.querySelector('[data-caja-dot]');
    if (dot) dot.classList.toggle('show', !!state.caja.abierta);
  }

  function mountSection(builder) {
    var main = document.getElementById('main-content');
    function refresh() {
      main.innerHTML = '';
      main.appendChild(builder(refresh));
    }
    refresh();
  }

  function renderMain() {
    document.getElementById('topbar-title').textContent = TITLES[state.nav];
    if (state.nav === 'productos') state.ui.productos = { q: '', cat: 'Todos', soloReponer: state.filtroProds === 'reponer' };
    if (state.nav === 'pedidos') state.ui.pedidos = { filtro: 'todos' };
    if (state.nav === 'caja') state.ui.caja = { inicial: '', mov: { tipo: 'egreso', concepto: '', monto: '' }, contado: '' };
    var builders = { panel: renderDashboard, productos: renderProductos, pedidos: renderPedidos, caja: renderCaja, distribuidores: renderDistribuidores };
    mountSection(builders[state.nav]);
    updateSidebarActive();
    updateSidebarBadges();
  }

  // ------------------------------------------------------------ Panel de control (dashboard)
  function statCard(tone, iconName, valueText, labelText) {
    var card = panelShell(null, null);
    card.style.padding = '18px';
    var body = el('div', { class: 'stat-card-body' });
    var iconWrap = el('span', { class: 'stat-icon' });
    iconWrap.style.background = 'color-mix(in srgb, ' + tone + ' 14%, transparent)';
    iconWrap.style.color = tone;
    iconWrap.appendChild(ic(iconName, 22));
    var textWrap = el('div', { style: 'min-width:0' });
    textWrap.appendChild(el('div', { class: 'stat-value' }, [String(valueText)]));
    textWrap.appendChild(el('div', { class: 'stat-label' }, [labelText]));
    body.appendChild(iconWrap);
    body.appendChild(textWrap);
    card.appendChild(body);
    return card;
  }

  function renderDashboard() {
    var prods = state.prods, orders = state.orders, dists = state.dists;
    var bajos = prods.filter(function (p) { return p.stock > 0 && p.stock <= p.stock_minimo; });
    var sinStock = prods.filter(function (p) { return p.stock === 0; });
    var hoy = orders.filter(function (o) { return o.fecha.indexOf('Hoy') === 0; });

    var wrap = el('div', { class: 'stack' });
    var grid = el('div', { class: 'grid-stats' });
    grid.appendChild(statCard('var(--color-primary)', 'ShoppingBag', hoy.length, 'Pedidos hoy'));
    grid.appendChild(statCard('var(--green-cta)', 'DollarSign', money(hoy.reduce(function (s, o) { return s + o.total; }, 0)), 'Ventas hoy'));
    grid.appendChild(statCard('var(--kraft-500)', 'Package', prods.length, 'Productos activos'));
    grid.appendChild(statCard('var(--warning-500)', 'TriangleAlert', bajos.length + sinStock.length, 'A reponer'));
    wrap.appendChild(grid);

    var grid2 = el('div', { class: 'grid-2main' });

    // Stock en tiempo real
    var stockPanel = panelShell('Stock en tiempo real', [qbadge({ tone: 'success', dot: true, text: 'Realtime' })]);
    var scroll = el('div', { class: 'table-scroll' });
    var table = el('table', { class: 'qtable' });
    var thead = el('thead', {});
    var trh = el('tr', {});
    ['Producto', 'Stock', 'Mínimo', 'Estado'].forEach(function (h, i) { trh.appendChild(el('th', { class: i > 0 ? 'right' : '' }, [h])); });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = el('tbody', {});
    prods.slice().sort(function (a, b) { return (a.stock / (a.stock_minimo || 1)) - (b.stock / (b.stock_minimo || 1)); }).slice(0, 7).forEach(function (p) {
      var tr = el('tr', {});
      var tdProd = el('td', {});
      tdProd.appendChild(el('span', { class: 'cell-strong' }, [p.nombre]));
      tdProd.appendChild(el('div', { class: 'cell-sub' }, [p.categoria + ' · ' + p.unit]));
      tr.appendChild(tdProd);
      tr.appendChild(el('td', { class: 'right cell-strong' }, [String(p.stock)]));
      tr.appendChild(el('td', { class: 'right' }, [String(p.stock_minimo)]));
      var tdEstado = el('td', { class: 'right' });
      tdEstado.appendChild(p.stock === 0 ? qbadge({ tone: 'danger', text: 'Sin stock' }) : p.stock <= p.stock_minimo ? qbadge({ tone: 'warning', text: 'Bajo' }) : qbadge({ tone: 'success', text: 'OK' }));
      tr.appendChild(tdEstado);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    stockPanel.appendChild(scroll);

    // Reposición por distribuidor
    var repoPanel = panelShell('Reposición por distribuidor', null);
    var repoBody = el('div', { class: 'panel-body' });
    var porProv = {};
    sinStock.concat(bajos).forEach(function (p) {
      var k = (p.costo && p.costo.prov) || 'sin';
      (porProv[k] = porProv[k] || []).push(p);
    });
    function distName(id) {
      var d = dists.find(function (x) { return x.id === id; });
      return d ? d.nombre : 'Sin proveedor asignado';
    }
    var keys = Object.keys(porProv);
    if (keys.length === 0) {
      repoBody.appendChild(emptyState({ icon: ic('CircleCheck', 26), title: 'Todo abastecido', description: 'No hay productos por reponer.' }));
    } else {
      keys.forEach(function (prov) {
        var items = porProv[prov];
        var group = el('div', {});
        var head = el('div', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:8px' });
        head.appendChild(ic('Truck', 16));
        head.appendChild(el('span', { style: 'font-family:var(--font-display);font-weight:600;font-size:14px;color:var(--text-strong)' }, [distName(prov)]));
        group.appendChild(head);
        var tagsWrap = el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px' });
        items.forEach(function (p) { tagsWrap.appendChild(qtag(p.nombre + ' · ' + p.stock, { tone: p.stock === 0 ? 'kraft' : 'brand' })); });
        group.appendChild(tagsWrap);
        repoBody.appendChild(group);
      });
    }
    repoBody.appendChild(btn('Ver productos a reponer', {
      variant: 'outline', fullWidth: true, leftIcon: ic('ClipboardList', 16),
      onClick: function () { state.filtroProds = 'reponer'; goTo('productos'); },
    }));
    repoPanel.appendChild(repoBody);

    grid2.appendChild(stockPanel);
    grid2.appendChild(repoPanel);
    wrap.appendChild(grid2);
    return wrap;
  }

  // ------------------------------------------------------------ Productos (CRUD + costos/margen)
  function renderProductos() {
    var catalogo = window.QhaliData;
    var ui = state.ui.productos;

    function distName(id) {
      var d = state.dists.find(function (x) { return x.id === id; });
      return d ? d.nombre : '—';
    }
    function filtered() {
      return state.prods.filter(function (p) {
        return (ui.cat === 'Todos' || p.categoria === ui.cat) &&
          p.nombre.toLowerCase().indexOf(ui.q.toLowerCase()) !== -1 &&
          (!ui.soloReponer || p.stock <= p.stock_minimo);
      });
    }

    var countTitle = el('h2', { class: 'panel-title' }, ['Productos (' + filtered().length + ')']);

    var searchWrap = el('div', { style: 'width:220px' });
    var searchInput = inputField({ placeholder: 'Buscar…', value: ui.q, leadingIcon: ic('Search', 16) });
    searchWrap.appendChild(searchInput);

    var catSelect = selectEl(catalogo.categorias, ui.cat, function (v) { ui.cat = v; refreshTable(); });
    catSelect.style.width = '190px';

    var checkboxLabel = el('label', { class: 'checkbox-reponer' + (ui.soloReponer ? ' on' : '') });
    var checkbox = el('input', { type: 'checkbox' });
    checkbox.checked = ui.soloReponer;
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(document.createTextNode('A reponer'));

    var nuevoBtn = btn('Nuevo producto', { size: 'sm', leftIcon: ic('Plus', 16), onClick: function () { openProductForm({}); } });

    var section = panelShell(countTitle, [searchWrap, catSelect, checkboxLabel, nuevoBtn]);

    var scroll = el('div', { class: 'table-scroll' });
    var table = el('table', { class: 'qtable' });
    var thead = el('thead', {});
    var trh = el('tr', {});
    ['Producto', 'SKU', 'Distribuidor', 'Costo', 'Margen', 'Venta', 'Stock', ''].forEach(function (h, i) {
      trh.appendChild(el('th', { class: (i >= 3 && i <= 5) ? 'right' : '' }, [h]));
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = el('tbody', {});
    table.appendChild(tbody);
    scroll.appendChild(table);
    var emptyWrap = el('div', {});
    section.appendChild(scroll);
    section.appendChild(emptyWrap);

    function addStock(id, d) {
      state.prods = state.prods.map(function (x) { return x.id === id ? Object.assign({}, x, { stock: Math.max(0, x.stock + d) }) : x; });
      refreshTable();
      updateSidebarBadges();
    }
    function del(id) {
      state.prods = state.prods.filter(function (x) { return x.id !== id; });
      refreshTable();
      updateSidebarBadges();
    }
    function save(p) {
      var exists = state.prods.some(function (x) { return x.id === p.id; });
      state.prods = exists ? state.prods.map(function (x) { return x.id === p.id ? p : x; }) : [p].concat(state.prods);
      refreshTable();
      updateSidebarBadges();
    }
    function openProductForm(prod) { renderProductForm(prod, save); }

    function refreshTable() {
      var list = filtered();
      countTitle.textContent = 'Productos (' + list.length + ')';
      tbody.innerHTML = '';
      list.forEach(function (p) {
        var tr = el('tr', { class: p.stock === 0 ? 'row-danger' : p.stock <= p.stock_minimo ? 'row-warning' : '' });
        var tdProd = el('td', {});
        tdProd.appendChild(el('span', { class: 'cell-strong' }, [p.nombre]));
        tdProd.appendChild(el('div', { class: 'cell-sub' }, [p.categoria + ' · ' + p.unit]));
        tr.appendChild(tdProd);
        tr.appendChild(el('td', { class: 'mono' }, [p.sku]));
        tr.appendChild(el('td', {}, [p.costo ? distName(p.costo.prov) : '—']));
        tr.appendChild(el('td', { class: 'right' }, [p.costo ? money(p.costo.precio_lista) : '—']));
        tr.appendChild(el('td', { class: 'right' }, [p.costo ? (Math.round(p.costo.margen * 100) + '%') : '—']));
        tr.appendChild(el('td', { class: 'right cell-strong', style: 'color:var(--text-price)' }, [money(p.costo ? finalDe(p.costo) : p.precio_final)]));
        var tdStock = el('td', {});
        var stockWrap = el('span', { class: 'stock-controls' });
        stockWrap.appendChild(iconBtn({ ariaLabel: 'Restar stock', size: 'sm', tone: 'ghost', icon: ic('Minus', 14), onClick: function () { addStock(p.id, -1); } }));
        stockWrap.appendChild(el('span', { class: 'stock-value' }, [String(p.stock)]));
        stockWrap.appendChild(iconBtn({ ariaLabel: 'Sumar stock', size: 'sm', tone: 'ghost', icon: ic('Plus', 14), onClick: function () { addStock(p.id, 1); } }));
        if (p.stock === 0) stockWrap.appendChild(qbadge({ tone: 'danger', text: 'Sin stock' }));
        else if (p.stock <= p.stock_minimo) stockWrap.appendChild(qbadge({ tone: 'warning', text: 'Bajo' }));
        tdStock.appendChild(stockWrap);
        tr.appendChild(tdStock);
        var tdActions = el('td', { class: 'right', style: 'white-space:nowrap' });
        var actions = el('span', { class: 'row-actions' });
        actions.appendChild(iconBtn({ ariaLabel: 'Editar', size: 'sm', tone: 'ghost', icon: ic('Pencil', 16), onClick: function () { openProductForm(p); } }));
        actions.appendChild(deleteConfirm({ label: '¿Eliminar producto?', onConfirm: function () { del(p.id); } }));
        tdActions.appendChild(actions);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
      });
      emptyWrap.innerHTML = '';
      if (list.length === 0) emptyWrap.appendChild(emptyState({ icon: ic('PackageSearch', 28), title: 'Sin productos', description: 'Ajustá la búsqueda o creá un producto nuevo.' }));
    }

    searchInput._input.addEventListener('input', function (e) { ui.q = e.target.value; refreshTable(); });
    checkbox.addEventListener('change', function (e) { ui.soloReponer = e.target.checked; checkboxLabel.classList.toggle('on', ui.soloReponer); refreshTable(); });

    refreshTable();
    return section;
  }

  function renderProductForm(prod, onSave) {
    var isNew = !prod.id;
    var categorias = window.QhaliData.categorias.filter(function (c) { return c !== 'Todos'; });
    var f = {
      nombre: prod.nombre || '', sku: prod.sku || '', categoria: prod.categoria || categorias[0],
      unit: prod.unit || 'x 100 g', stock: prod.stock != null ? prod.stock : 0, stock_minimo: prod.stock_minimo != null ? prod.stock_minimo : 5,
      prov: (prod.costo && prod.costo.prov) || '', precio_lista: (prod.costo && prod.costo.precio_lista != null) ? prod.costo.precio_lista : '',
      margen: prod.costo ? Math.round(prod.costo.margen * 100) : 45,
      precio_manual: prod.precio_final != null ? prod.precio_final : '',
    };

    function conCosto() { return f.precio_lista !== '' && Number(f.precio_lista) > 0; }
    function finalPrice() { return conCosto() ? Math.round(Number(f.precio_lista) * (1 + Number(f.margen) / 100)) : (Number(f.precio_manual) || 0); }
    function valido() { return f.nombre.trim() && f.sku.trim() && finalPrice() > 0; }

    openDrawer({
      title: isNew ? 'Nuevo producto' : 'Editar producto',
      build: function (drawer) {
        var nombreField = inputField({ label: 'Nombre', value: f.nombre, placeholder: 'Nuez mariposa extra light' });

        var row1 = el('div', { class: 'form-row' });
        var skuField = inputField({ label: 'SKU', value: f.sku, placeholder: 'FS-NUE1' });
        var unitField = inputField({ label: 'Unidad de venta', value: f.unit, placeholder: 'x 100 g' });
        row1.appendChild(skuField);
        row1.appendChild(unitField);

        var catField = el('label', { class: 'field' });
        catField.appendChild(el('span', { class: 'field-label' }, ['Categoría']));
        var catSelect = selectEl(categorias, f.categoria, function (v) { f.categoria = v; });
        catField.appendChild(catSelect);

        var row2 = el('div', { class: 'form-row' });
        var stockField = inputField({ label: 'Stock actual', type: 'number', min: 0, value: f.stock });
        var minField = inputField({ label: 'Stock mínimo (alerta)', type: 'number', min: 0, value: f.stock_minimo });
        row2.appendChild(stockField);
        row2.appendChild(minField);

        var provField = el('label', { class: 'field' });
        provField.appendChild(el('span', { class: 'field-label' }, ['Distribuidor']));
        var provOptions = [{ value: '', label: 'Sin asignar' }].concat(state.dists.map(function (d) { return { value: d.id, label: d.nombre }; }));
        var provSelect = selectEl(provOptions, f.prov, function (v) { f.prov = v; });
        provField.appendChild(provSelect);

        var row3 = el('div', { class: 'form-row' });
        var listaField = inputField({ label: 'Precio de lista (costo)', type: 'number', min: 0, value: f.precio_lista, leadingIcon: ic('DollarSign', 16), helperText: 'Vacío = precio manual' });
        var margenWrap = el('div', { class: 'w-140' });
        var margenField = inputField({ label: 'Margen (%)', type: 'number', min: 0, value: f.margen, trailingIcon: ic('Percent', 16), disabled: !conCosto() });
        margenWrap.appendChild(margenField);
        row3.appendChild(listaField);
        row3.appendChild(margenWrap);

        var computedWrap = el('div', {});

        function renderComputed() {
          computedWrap.innerHTML = '';
          margenField._input.disabled = !conCosto();
          if (conCosto()) {
            var panelBox = el('div', { class: 'costo-final-panel' });
            var left = el('div', {});
            left.appendChild(el('div', { class: 'costo-final-eyebrow' }, ['Precio final de venta']));
            left.appendChild(el('div', { class: 'costo-final-desc' }, ['Calculado automáticamente: costo × (1 + margen)']));
            panelBox.appendChild(left);
            panelBox.appendChild(priceTagEl(finalPrice(), 'lg'));
            computedWrap.appendChild(panelBox);
          } else {
            var manualField = inputField({ label: 'Precio de venta (manual)', type: 'number', min: 0, value: f.precio_manual, leadingIcon: ic('DollarSign', 16) });
            manualField._input.addEventListener('input', function (e) { f.precio_manual = e.target.value; updateSubmit(); });
            computedWrap.appendChild(manualField);
          }
        }

        var submitBtn;
        function updateSubmit() { if (submitBtn) submitBtn.disabled = !valido(); }

        nombreField._input.addEventListener('input', function (e) { f.nombre = e.target.value; updateSubmit(); });
        skuField._input.addEventListener('input', function (e) { f.sku = e.target.value; updateSubmit(); });
        unitField._input.addEventListener('input', function (e) { f.unit = e.target.value; });
        stockField._input.addEventListener('input', function (e) { f.stock = e.target.value; });
        minField._input.addEventListener('input', function (e) { f.stock_minimo = e.target.value; });
        listaField._input.addEventListener('input', function (e) { f.precio_lista = e.target.value; renderComputed(); updateSubmit(); });
        margenField._input.addEventListener('input', function (e) { f.margen = e.target.value; renderComputed(); updateSubmit(); });

        renderComputed();

        drawer.setBody([nombreField, row1, catField, row2, el('div', { class: 'divider' }), el('div', { class: 'form-heading' }, ['Costo y margen']), provField, row3, computedWrap]);

        var cancelBtn = btn('Cancelar', { variant: 'ghost', onClick: drawer.close });
        submitBtn = btn(isNew ? 'Crear producto' : 'Guardar cambios', {
          leftIcon: ic('Check', 16),
          disabled: !valido(),
          onClick: function () {
            var final = finalPrice();
            var newProd = {
              id: prod.id || ('p' + Date.now()),
              nombre: f.nombre.trim(), sku: f.sku.trim().toUpperCase(), categoria: f.categoria, unit: f.unit,
              stock: Number(f.stock) || 0, stock_minimo: Number(f.stock_minimo) || 0, precio_final: final,
              costo: conCosto() ? { precio_lista: Number(f.precio_lista), margen: Number(f.margen) / 100, prov: f.prov || null } : null,
            };
            onSave(newProd);
            drawer.close();
          },
        });
        drawer.setFooter([cancelBtn, submitBtn]);
      },
    });
  }

  // ------------------------------------------------------------ Pedidos (avanzar estado)
  var CADENA = ['pendiente', 'pagado', 'preparado', 'despachado', 'entregado'];

  function renderPedidos() {
    var ui = state.ui.pedidos;

    var segWrap = el('div', { style: 'width:400px' });
    var seg = segmentedControl(
      [{ value: 'todos', label: 'Todos' }, { value: 'pendiente', label: 'Pendientes' }, { value: 'preparado', label: 'Preparar' }, { value: 'despachado', label: 'Despachar' }],
      ui.filtro,
      function (v) { ui.filtro = v; seg._setActive(v); refreshTable(); }
    );
    segWrap.appendChild(seg);

    var section = panelShell('Pedidos', [segWrap]);
    var scroll = el('div', { class: 'table-scroll' });
    var table = el('table', { class: 'qtable' });
    var thead = el('thead', {});
    var trh = el('tr', {});
    ['Pedido', 'Cliente', 'Entrega', 'Ítems', 'Total', 'Estado', 'Acción'].forEach(function (h, i) {
      trh.appendChild(el('th', { class: (i === 3 || i === 4 || i === 6) ? 'right' : '' }, [h]));
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = el('tbody', {});
    table.appendChild(tbody);
    scroll.appendChild(table);
    var emptyWrap = el('div', {});
    section.appendChild(scroll);
    section.appendChild(emptyWrap);

    function avanzar(id) {
      state.orders = state.orders.map(function (o) {
        if (o.id !== id) return o;
        var i = CADENA.indexOf(o.estado);
        return Object.assign({}, o, { estado: CADENA[Math.min(i + 1, CADENA.length - 1)] });
      });
      refreshTable();
      updateSidebarBadges();
    }

    function refreshTable() {
      var list = ui.filtro === 'todos' ? state.orders : state.orders.filter(function (o) { return o.estado === ui.filtro; });
      tbody.innerHTML = '';
      list.forEach(function (o) {
        var sig = CADENA[CADENA.indexOf(o.estado) + 1];
        var tr = el('tr', {});
        var tdPedido = el('td', { class: 'mono' });
        tdPedido.appendChild(document.createTextNode('#' + o.id));
        tdPedido.appendChild(el('div', { style: 'color:var(--text-muted)' }, [o.fecha]));
        tr.appendChild(tdPedido);
        tr.appendChild(el('td', { class: 'cell-strong' }, [o.cliente]));
        var tdEntrega = el('td', {});
        var entregaSpan = el('span', { style: 'display:inline-flex;align-items:center;gap:6px' });
        entregaSpan.appendChild(ic(o.tipo === 'retiro_local' ? 'Store' : 'Truck', 15));
        entregaSpan.appendChild(document.createTextNode(o.tipo === 'retiro_local' ? 'Retiro' : 'Envío'));
        tdEntrega.appendChild(entregaSpan);
        tr.appendChild(tdEntrega);
        tr.appendChild(el('td', { class: 'right' }, [String(o.items)]));
        tr.appendChild(el('td', { class: 'right cell-strong' }, [money(o.total)]));
        var tdEstado = el('td', {});
        tdEstado.appendChild(qbadge({ estado: o.estado }));
        tr.appendChild(tdEstado);
        var tdAccion = el('td', { class: 'right' });
        if (sig) tdAccion.appendChild(btn('Marcar ' + sig, { size: 'sm', variant: 'outline', rightIcon: ic('ArrowRight', 14), onClick: function () { avanzar(o.id); } }));
        else tdAccion.appendChild(el('span', { style: 'color:var(--text-muted);font-size:13px' }, ['Completado']));
        tr.appendChild(tdAccion);
        tbody.appendChild(tr);
      });
      emptyWrap.innerHTML = '';
      if (list.length === 0) emptyWrap.appendChild(emptyState({ icon: ic('ShoppingBag', 28), title: 'Sin pedidos en este estado' }));
    }

    refreshTable();
    return section;
  }

  // ------------------------------------------------------------ Distribuidores (CRUD)
  function renderDistribuidores() {
    var section = panelShell('Distribuidores', [btn('Nuevo distribuidor', { size: 'sm', leftIcon: ic('Plus', 16), onClick: function () { openDistForm({}); } })]);
    var scroll = el('div', { class: 'table-scroll' });
    var table = el('table', { class: 'qtable' });
    var thead = el('thead', {});
    var trh = el('tr', {});
    ['Nombre', 'Contacto', 'Teléfono', 'Dirección', 'Productos', ''].forEach(function (h, i) {
      trh.appendChild(el('th', { class: (i === 4) ? 'right' : '' }, [h]));
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = el('tbody', {});
    table.appendChild(tbody);
    scroll.appendChild(table);
    section.appendChild(scroll);

    function bajosDe(id) { return state.prods.filter(function (p) { return p.costo && p.costo.prov === id && p.stock <= p.stock_minimo; }).length; }
    function asignados(id) { return state.prods.filter(function (p) { return p.costo && p.costo.prov === id; }).length; }

    function save(d) {
      var exists = state.dists.some(function (x) { return x.id === d.id; });
      state.dists = exists ? state.dists.map(function (x) { return x.id === d.id ? d : x; }) : state.dists.concat([d]);
      refreshTable();
    }
    function del(id) {
      state.dists = state.dists.filter(function (x) { return x.id !== id; });
      state.prods = state.prods.map(function (p) { return (p.costo && p.costo.prov === id) ? Object.assign({}, p, { costo: Object.assign({}, p.costo, { prov: null }) }) : p; });
      refreshTable();
    }
    function openDistForm(d) { renderDistForm(d, save); }

    function refreshTable() {
      tbody.innerHTML = '';
      state.dists.forEach(function (d) {
        var tr = el('tr', {});
        tr.appendChild(el('td', { class: 'cell-strong' }, [d.nombre]));
        tr.appendChild(el('td', { class: 'mono' }, [d.contacto || '—']));
        tr.appendChild(el('td', {}, [d.tel || '—']));
        tr.appendChild(el('td', {}, [d.direccion || '—']));
        var tdProds = el('td', { class: 'right' });
        tdProds.appendChild(btn(asignados(d.id) + ' productos', { size: 'sm', variant: 'ghost', leftIcon: ic('Package', 14), onClick: function () { renderDistProductosDrawer(d, function () { refreshTable(); }); } }));
        tr.appendChild(tdProds);
        var tdActions = el('td', { class: 'right', style: 'white-space:nowrap' });
        var actions = el('span', { class: 'row-actions' });
        var nBajos = bajosDe(d.id);
        actions.appendChild(btn('Reposición' + (nBajos > 0 ? ' (' + nBajos + ')' : ''), { size: 'sm', variant: nBajos > 0 ? 'primary' : 'outline', leftIcon: ic('ClipboardList', 14), onClick: function () { renderReposicionDrawer(d); } }));
        actions.appendChild(iconBtn({ ariaLabel: 'Editar', size: 'sm', tone: 'ghost', icon: ic('Pencil', 16), onClick: function () { openDistForm(d); } }));
        var nAsig = asignados(d.id);
        actions.appendChild(deleteConfirm({ label: nAsig > 0 ? (nAsig + ' productos quedarán sin proveedor. ¿Eliminar?') : '¿Eliminar?', onConfirm: function () { del(d.id); } }));
        tdActions.appendChild(actions);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
      });
    }

    refreshTable();
    return section;
  }

  function renderDistForm(dist, onSave) {
    var isNew = !dist.id;
    var f = { nombre: dist.nombre || '', contacto: dist.contacto || '', tel: dist.tel || '', direccion: dist.direccion || '' };
    openDrawer({
      title: isNew ? 'Nuevo distribuidor' : 'Editar distribuidor',
      build: function (drawer) {
        var nombreField = inputField({ label: 'Nombre', value: f.nombre, placeholder: 'Merci Alimentos (mayorista)' });
        var contactoField = inputField({ label: 'Contacto (email o referencia)', value: f.contacto, placeholder: 'ventas@proveedor.com.ar' });
        var telField = inputField({ label: 'Teléfono', value: f.tel, placeholder: '342-5311386' });
        var dirField = inputField({ label: 'Dirección', value: f.direccion, placeholder: 'Santa Fe' });

        var submitBtn;
        function updateSubmit() { submitBtn.disabled = !f.nombre.trim(); }
        nombreField._input.addEventListener('input', function (e) { f.nombre = e.target.value; updateSubmit(); });
        contactoField._input.addEventListener('input', function (e) { f.contacto = e.target.value; });
        telField._input.addEventListener('input', function (e) { f.tel = e.target.value; });
        dirField._input.addEventListener('input', function (e) { f.direccion = e.target.value; });

        drawer.setBody([nombreField, contactoField, telField, dirField]);

        var cancelBtn = btn('Cancelar', { variant: 'ghost', onClick: drawer.close });
        submitBtn = btn(isNew ? 'Crear distribuidor' : 'Guardar cambios', {
          leftIcon: ic('Check', 16),
          disabled: !f.nombre.trim(),
          onClick: function () {
            onSave(Object.assign({}, dist, f, { id: dist.id || ('d' + Date.now()), nombre: f.nombre.trim() }));
            drawer.close();
          },
        });
        drawer.setFooter([cancelBtn, submitBtn]);
      },
    });
  }

  // ------------------------------------------------------------ Reposición por distribuidor (con PDF)
  function renderReposicionDrawer(dist) {
    function sugerida(p) { return Math.max(p.stock_minimo * 2 - p.stock, 1); }
    var items = state.prods.filter(function (p) { return p.costo && p.costo.prov === dist.id && p.stock <= p.stock_minimo; }).map(function (p) { return { id: p.id, cant: sugerida(p) }; });
    var paso = 'editar';
    var addId = '';

    function get(id) { return state.prods.find(function (p) { return p.id === id; }); }
    function disponibles() { return state.prods.filter(function (p) { return p.costo && p.costo.prov === dist.id && !items.some(function (i) { return i.id === p.id; }); }); }

    openDrawer({
      title: 'Reposición · ' + dist.nombre,
      build: function (drawer) { renderStep(drawer); },
    });

    function renderStep(drawer) {
      drawer.setTitle(paso === 'pdf' ? 'Vista previa del pedido' : 'Reposición · ' + dist.nombre);
      if (paso === 'pdf') renderPdfStep(drawer); else renderEditStep(drawer);
    }

    function renderEditStep(drawer) {
      var body = [];
      body.push(el('p', { class: 'helper-p' }, ['Se agregaron automáticamente los productos de ' + dist.nombre + ' con stock bajo o sin stock. Ajustá cantidades, quitá o sumá productos antes de generar el PDF.']));
      if (items.length === 0) body.push(emptyState({ icon: ic('CircleCheck', 26), title: 'Nada para reponer', description: 'Este distribuidor no tiene productos con stock bajo. Podés agregar manualmente.' }));
      items.forEach(function (item) {
        var p = get(item.id);
        var row = el('div', { class: 'item-row' });
        var main = el('div', { class: 'item-row-main' });
        main.appendChild(el('div', { class: 'item-row-title' }, [p.nombre]));
        var sub = el('div', { class: 'item-row-sub' });
        sub.appendChild(document.createTextNode(p.unit));
        if (p.stock === 0) sub.appendChild(qbadge({ tone: 'danger', text: 'Sin stock' }));
        else if (p.stock <= p.stock_minimo) sub.appendChild(qbadge({ tone: 'warning', text: 'Stock ' + p.stock }));
        else sub.appendChild(el('span', {}, ['Stock ' + p.stock]));
        main.appendChild(sub);
        row.appendChild(main);
        var qtyWrap = el('div', { class: 'item-row-qty' });
        var qtyInput = el('input', { class: 'qty-input', type: 'number', min: '1' });
        qtyInput.value = item.cant;
        qtyWrap.appendChild(iconBtn({ ariaLabel: 'Menos', size: 'sm', tone: 'ghost', icon: ic('Minus', 14), onClick: function () { item.cant = Math.max(1, item.cant - 1); qtyInput.value = item.cant; } }));
        qtyWrap.appendChild(qtyInput);
        qtyWrap.appendChild(iconBtn({ ariaLabel: 'Más', size: 'sm', tone: 'ghost', icon: ic('Plus', 14), onClick: function () { item.cant = item.cant + 1; qtyInput.value = item.cant; } }));
        qtyInput.addEventListener('input', function (e) { item.cant = Math.max(1, Number(e.target.value) || 1); });
        row.appendChild(qtyWrap);
        row.appendChild(iconBtn({ ariaLabel: 'Quitar', size: 'sm', tone: 'ghost', icon: ic('X', 16), onClick: function () { items = items.filter(function (i) { return i.id !== item.id; }); renderEditStep(drawer); } }));
        body.push(row);
      });
      var disp = disponibles();
      var addRow = el('div', { class: 'add-row' });
      var addOptions = [{ value: '', label: 'Agregar otro producto de ' + dist.nombre + '…' }].concat(disp.map(function (p) { return { value: p.id, label: p.nombre + ' · stock ' + p.stock }; }));
      var addBtn;
      var addSelect = selectEl(addOptions, addId, function (v) { addId = v; addBtn.disabled = !addId; });
      addRow.appendChild(addSelect);
      addBtn = btn('Agregar', {
        size: 'sm', variant: 'outline', disabled: !addId, leftIcon: ic('Plus', 14),
        onClick: function () { var p = get(addId); items.push({ id: p.id, cant: sugerida(p) }); addId = ''; renderEditStep(drawer); },
      });
      addRow.appendChild(addBtn);
      body.push(addRow);
      if (disp.length === 0 && items.length > 0) body.push(el('p', { class: 'muted-note' }, ['Todos los productos de este distribuidor ya están en el pedido.']));

      drawer.setBody(body);
      var cancelBtn = btn('Cancelar', { variant: 'ghost', onClick: drawer.close });
      var genBtn = btn('Generar PDF (' + items.length + ')', { disabled: items.length === 0, leftIcon: ic('FileText', 16), onClick: function () { paso = 'pdf'; renderStep(drawer); } });
      drawer.setFooter([cancelBtn, genBtn]);
    }

    function renderPdfStep(drawer) {
      var hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
      var wrap = el('div', { class: 'informe-print' });
      var head = el('div', { class: 'informe-head' });
      head.appendChild(el('img', { attrs: { src: '../assets/logo-badge-circle.png', alt: 'Qhali' } }));
      var headText = el('div', {});
      headText.appendChild(el('div', { class: 'informe-head-title' }, ['Qhali · Pedido de reposición']));
      headText.appendChild(el('div', { class: 'informe-head-sub' }, [hoy + ' · Solicitado por Paula L.']));
      head.appendChild(headText);
      wrap.appendChild(head);

      var distBlock = el('div', { class: 'informe-dist-block' });
      distBlock.appendChild(el('b', { style: 'color:var(--text-strong)' }, ['Para: ' + dist.nombre]));
      distBlock.appendChild(el('br', {}));
      var infoParts = [];
      if (dist.contacto) infoParts.push(dist.contacto);
      if (dist.tel) infoParts.push(dist.tel);
      if (dist.direccion) infoParts.push(dist.direccion);
      distBlock.appendChild(document.createTextNode(infoParts.join(' · ')));
      wrap.appendChild(distBlock);

      var table = el('table', { class: 'informe-table' });
      var thead = el('thead', {});
      var trh = el('tr', {});
      ['SKU', 'Producto', 'Stock', 'Pedir'].forEach(function (h, i) { trh.appendChild(el('th', { class: (i >= 2) ? 'right' : '' }, [h])); });
      thead.appendChild(trh);
      table.appendChild(thead);
      var tbody = el('tbody', {});
      items.forEach(function (item) {
        var p = get(item.id);
        var tr = el('tr', {});
        tr.appendChild(el('td', { style: 'font-family:var(--font-mono);font-size:12px' }, [p.sku]));
        var tdName = el('td', { style: 'color:var(--text-strong);font-weight:600' });
        tdName.appendChild(document.createTextNode(p.nombre));
        tdName.appendChild(el('span', { style: 'color:var(--text-muted);font-weight:400' }, [' · ' + p.unit]));
        tr.appendChild(tdName);
        tr.appendChild(el('td', { class: 'right' }, [String(p.stock)]));
        tr.appendChild(el('td', { class: 'right', style: 'font-weight:700;color:var(--text-strong)' }, [String(item.cant)]));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      wrap.appendChild(el('div', { class: 'informe-note' }, [items.length + ' artículos · Cantidades en la unidad de venta indicada.']));
      wrap.appendChild(el('div', { class: 'informe-obs' }, ['Observaciones: ______________________________________________']));

      drawer.setBody([wrap]);
      var backBtn = btn('Volver a editar', { variant: 'ghost', leftIcon: ic('ChevronLeft', 16), onClick: function () { paso = 'editar'; renderStep(drawer); } });
      var printBtn = btn('Imprimir / Guardar PDF', { leftIcon: ic('Printer', 16), onClick: function () { window.print(); } });
      drawer.setFooter([backBtn, printBtn]);
    }
  }

  // ------------------------------------------------------------ Productos de un distribuidor (lista + edición rápida)
  function renderDistProductosDrawer(dist, onChange) {
    var addId = '';

    function list() { return state.prods.filter(function (p) { return p.costo && p.costo.prov === dist.id; }); }
    function otros() { return state.prods.filter(function (p) { return !(p.costo && p.costo.prov === dist.id); }); }

    function setLista(id, v) {
      state.prods = state.prods.map(function (x) {
        if (x.id !== id) return x;
        return Object.assign({}, x, { costo: Object.assign({}, x.costo, { precio_lista: Math.max(0, Number(v) || 0) }) });
      });
    }
    function quitar(id, drawer) {
      state.prods = state.prods.map(function (x) { return x.id === id ? Object.assign({}, x, { costo: Object.assign({}, x.costo, { prov: null }) }) : x; });
      renderBody(drawer);
    }
    function agregar(drawer) {
      var target = state.prods.find(function (x) { return x.id === addId; });
      if (!target) return;
      state.prods = state.prods.map(function (x) {
        if (x.id !== addId) return x;
        if (x.costo) return Object.assign({}, x, { costo: Object.assign({}, x.costo, { prov: dist.id }) });
        return Object.assign({}, x, { costo: { precio_lista: Math.round((x.precio_final || 0) / 1.45), margen: 0.45, prov: dist.id } });
      });
      addId = '';
      renderBody(drawer);
    }

    openDrawer({
      title: 'Productos · ' + dist.nombre,
      build: function (drawer) { renderBody(drawer); },
    });

    function renderBody(drawer) {
      var body = [];
      body.push(el('p', { class: 'helper-p' }, ['Editá el precio de lista (costo) de cada producto — el precio de venta se recalcula solo. Con la × lo quitás de este distribuidor.']));
      var l = list();
      if (l.length === 0) body.push(emptyState({ icon: ic('PackageOpen', 26), title: 'Sin productos asignados', description: 'Agregá productos desde el selector de abajo.' }));
      l.forEach(function (p) {
        var row = el('div', { class: 'item-row' });
        var main = el('div', { class: 'item-row-main' });
        main.appendChild(el('div', { class: 'item-row-title' }, [p.nombre]));
        var subLine = el('div', { class: 'item-row-sub' });
        subLine.appendChild(document.createTextNode(p.unit + ' · '));
        subLine.appendChild(el('span', { style: 'font-family:var(--font-mono)' }, [p.sku]));
        main.appendChild(subLine);
        var venta = el('div', { class: 'venta-line' });
        var ventaText = document.createTextNode('Venta: ' + money(finalDe(p.costo)) + ' ');
        venta.appendChild(ventaText);
        venta.appendChild(el('small', {}, ['(' + Math.round(p.costo.margen * 100) + '% margen)']));
        main.appendChild(venta);
        row.appendChild(main);

        var listaCol = el('label', { class: 'lista-col' });
        listaCol.appendChild(el('span', { class: 'lista-col-label' }, ['Lista $']));
        var listaInput = el('input', { class: 'lista-input', type: 'number', min: '0' });
        listaInput.value = p.costo.precio_lista;
        listaInput.addEventListener('input', function (e) {
          setLista(p.id, e.target.value);
          var updated = state.prods.find(function (x) { return x.id === p.id; });
          ventaText.textContent = 'Venta: ' + money(finalDe(updated.costo)) + ' ';
        });
        listaCol.appendChild(listaInput);
        row.appendChild(listaCol);

        row.appendChild(iconBtn({ ariaLabel: 'Quitar de este distribuidor', size: 'sm', tone: 'ghost', icon: ic('X', 16), onClick: function () { quitar(p.id, drawer); } }));
        body.push(row);
      });

      var addRow = el('div', { class: 'add-row' });
      var ot = otros();
      var addOptions = [{ value: '', label: 'Agregar producto a ' + dist.nombre + '…' }].concat(ot.map(function (p) { return { value: p.id, label: p.nombre + ((p.costo && p.costo.prov) ? ' (de otro distribuidor)' : '') }; }));
      var addBtn;
      var addSelect = selectEl(addOptions, addId, function (v) { addId = v; addBtn.disabled = !addId; });
      addRow.appendChild(addSelect);
      addBtn = btn('Agregar', { size: 'sm', variant: 'outline', disabled: !addId, leftIcon: ic('Plus', 14), onClick: function () { agregar(drawer); } });
      addRow.appendChild(addBtn);
      body.push(addRow);

      drawer.setBody(body);
      drawer.setFooter([btn('Listo', { leftIcon: ic('Check', 16), onClick: function () { drawer.close(); onChange && onChange(); } })]);
    }
  }

  // ------------------------------------------------------------ Caja (apertura, movimientos, cierre e informe)
  function renderCaja(refresh) {
    var ui = state.ui.caja;

    function cobrados() { return state.orders.filter(function (o) { return o.fecha.indexOf('Hoy') === 0 && o.estado !== 'pendiente'; }); }
    function efectivo() { return cobrados().filter(function (o) { return o.tipo === 'retiro_local'; }).reduce(function (s, o) { return s + o.total; }, 0); }
    function transferencias() { return cobrados().filter(function (o) { return o.tipo === 'envio_nacional'; }).reduce(function (s, o) { return s + o.total; }, 0); }
    function ingresos() { return state.caja.movimientos.filter(function (m) { return m.tipo === 'ingreso'; }).reduce(function (s, m) { return s + m.monto; }, 0); }
    function egresos() { return state.caja.movimientos.filter(function (m) { return m.tipo === 'egreso'; }).reduce(function (s, m) { return s + m.monto; }, 0); }
    function esperado() { return (state.caja.montoInicial || 0) + efectivo() + ingresos() - egresos(); }
    function hora() { return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }

    if (!state.caja.abierta) {
      var wrap0 = el('div', { class: 'grid-auto340' });

      var abrirPanel = panelShell('Abrir caja', null);
      var abrirBody = el('div', { class: 'panel-body' });
      abrirBody.appendChild(el('p', { class: 'helper-p' }, ['La caja está cerrada. Ingresá el efectivo inicial para comenzar el día — las ventas cobradas se van sumando solas.']));
      var inicialField = inputField({ label: 'Monto inicial en efectivo', type: 'number', min: 0, value: ui.inicial, leadingIcon: ic('DollarSign', 16), placeholder: '20000' });
      abrirBody.appendChild(inicialField);
      var abrirBtn = btn('Abrir caja', {
        size: 'lg', leftIcon: ic('LockOpen', 18), disabled: ui.inicial === '',
        onClick: function () {
          state.caja = Object.assign({}, state.caja, { abierta: true, montoInicial: Number(ui.inicial) || 0, aperturaHora: hora(), empleado: 'Paula L.', movimientos: [] });
          ui.inicial = '';
          refresh();
        },
      });
      inicialField._input.addEventListener('input', function (e) { ui.inicial = e.target.value; abrirBtn.disabled = ui.inicial === ''; });
      abrirBody.appendChild(abrirBtn);
      abrirPanel.appendChild(abrirBody);
      wrap0.appendChild(abrirPanel);

      var histPanel = panelShell('Cierres anteriores', null);
      if (state.caja.historial.length === 0) {
        var eb = el('div', { class: 'panel-body' });
        eb.appendChild(emptyState({ icon: ic('Archive', 26), title: 'Sin cierres registrados' }));
        histPanel.appendChild(eb);
      } else {
        var listWrap = el('div', { style: 'padding:6px 0' });
        state.caja.historial.forEach(function (c) {
          var row = el('div', { class: 'cierre-row' });
          var left = el('div', {});
          left.appendChild(el('div', { class: 'cierre-fecha' }, [c.fecha]));
          left.appendChild(el('div', { class: 'cierre-desc' }, ['Facturó ' + money(c.efectivo + c.transfer) + ' · ' + (c.dif === 0 ? 'Sin diferencia' : ((c.dif > 0 ? 'Sobrante ' : 'Faltante ') + money(Math.abs(c.dif))))]));
          row.appendChild(left);
          row.appendChild(btn('Ver informe', { size: 'sm', variant: 'outline', leftIcon: ic('FileText', 14), onClick: function () { renderInformeCaja(c); } }));
          listWrap.appendChild(row);
        });
        histPanel.appendChild(listWrap);
      }
      wrap0.appendChild(histPanel);
      return wrap0;
    }

    // ---- caja abierta ----
    var stack = el('div', { class: 'stack' });
    var grid = el('div', { class: 'grid-stats' });
    var ef = efectivo(), tr2 = transferencias(), esp = esperado();
    var statDefs = [
      { l: 'Caja abierta · ' + state.caja.aperturaHora, v: money(state.caja.montoInicial), d: 'Monto inicial', icon: 'LockOpen', tone: 'var(--color-primary)' },
      { l: 'Efectivo por ventas', v: money(ef), d: cobrados().filter(function (o) { return o.tipo === 'retiro_local'; }).length + ' pedidos cobrados', icon: 'Banknote', tone: 'var(--green-cta)' },
      { l: 'Transferencias', v: money(tr2), d: 'No suman al efectivo físico', icon: 'ArrowLeftRight', tone: 'var(--info-500)' },
      { l: 'Esperado en caja', v: money(esp), d: 'Inicial + efectivo + mov.', icon: 'Calculator', tone: 'var(--kraft-600)' },
    ];
    statDefs.forEach(function (s) {
      var card = panelShell(null, null);
      card.style.padding = '18px';
      var body = el('div', { class: 'stat-card-body' });
      var iconWrap = el('span', { class: 'stat-icon' });
      iconWrap.style.background = 'color-mix(in srgb, ' + s.tone + ' 14%, transparent)';
      iconWrap.style.color = s.tone;
      iconWrap.appendChild(ic(s.icon, 22));
      var textWrap = el('div', { class: 'stat-card-wide', style: 'min-width:0' });
      textWrap.appendChild(el('div', { class: 'stat-label-top' }, [s.l]));
      textWrap.appendChild(el('div', { class: 'stat-value' }, [s.v]));
      textWrap.appendChild(el('div', { class: 'stat-desc' }, [s.d]));
      body.appendChild(iconWrap);
      body.appendChild(textWrap);
      card.appendChild(body);
      grid.appendChild(card);
    });
    stack.appendChild(grid);

    var grid2 = el('div', { class: 'grid-auto340' });

    var movPanel = panelShell('Movimientos manuales', null);
    var movBody = el('div', { class: 'panel-body' });
    var movRow = el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap' });
    var tipoSelect = selectEl([{ value: 'egreso', label: 'Egreso' }, { value: 'ingreso', label: 'Ingreso' }], ui.mov.tipo, function (v) { ui.mov.tipo = v; });
    tipoSelect.style.width = '120px';
    movRow.appendChild(tipoSelect);
    var conceptoWrap = el('div', { style: 'flex:1;min-width:150px' });
    var conceptoField = inputField({ placeholder: 'Concepto (ej. compra de bolsas)', value: ui.mov.concepto });
    conceptoWrap.appendChild(conceptoField);
    movRow.appendChild(conceptoWrap);
    var montoWrap = el('div', { style: 'width:130px' });
    var montoField = inputField({ type: 'number', min: 0, placeholder: 'Monto', value: ui.mov.monto });
    montoWrap.appendChild(montoField);
    movRow.appendChild(montoWrap);
    var addMovBtn = btn('Agregar', {
      leftIcon: ic('Plus', 16), disabled: !ui.mov.concepto.trim() || !ui.mov.monto,
      onClick: function () {
        state.caja.movimientos = state.caja.movimientos.concat([{ tipo: ui.mov.tipo, concepto: ui.mov.concepto.trim(), monto: Number(ui.mov.monto), hora: hora() }]);
        ui.mov = { tipo: 'egreso', concepto: '', monto: '' };
        refresh();
      },
    });
    movRow.appendChild(addMovBtn);
    movBody.appendChild(movRow);

    conceptoField._input.addEventListener('input', function (e) { ui.mov.concepto = e.target.value; addMovBtn.disabled = !ui.mov.concepto.trim() || !ui.mov.monto; });
    montoField._input.addEventListener('input', function (e) { ui.mov.monto = e.target.value; addMovBtn.disabled = !ui.mov.concepto.trim() || !ui.mov.monto; });

    if (state.caja.movimientos.length === 0) {
      movBody.appendChild(el('p', { class: 'muted-note' }, ['Sin movimientos por ahora. Registrá acá retiros de efectivo o ingresos fuera de ventas.']));
    } else {
      state.caja.movimientos.forEach(function (m) {
        var row = el('div', { class: 'mov-row' });
        var left = el('span', { class: 'mov-row-left' });
        left.appendChild(el('span', { class: 'mov-row-hora' }, [m.hora]));
        left.appendChild(document.createTextNode(' · ' + m.concepto));
        row.appendChild(left);
        row.appendChild(el('span', { class: 'mov-row-value', style: 'color:' + (m.tipo === 'egreso' ? 'var(--danger-500)' : 'var(--success-500)') }, [(m.tipo === 'egreso' ? '−' : '+') + money(m.monto)]));
        movBody.appendChild(row);
      });
    }
    movPanel.appendChild(movBody);
    grid2.appendChild(movPanel);

    var cerrarPanel = panelShell('Cerrar caja', null);
    var cerrarBody = el('div', { class: 'panel-body' });
    var lineaEsperado = el('div', { class: 'caja-linea' });
    lineaEsperado.appendChild(el('span', { class: 'caja-linea-k' }, ['Esperado en caja']));
    lineaEsperado.appendChild(el('span', { class: 'caja-linea-v strong' }, [money(esp)]));
    cerrarBody.appendChild(lineaEsperado);

    var contadoField = inputField({ label: 'Efectivo contado al cierre', type: 'number', min: 0, value: ui.contado, leadingIcon: ic('DollarSign', 16), placeholder: 'Contá el efectivo físico' });
    cerrarBody.appendChild(contadoField);

    var resultWrap = el('div', {});
    cerrarBody.appendChild(resultWrap);

    function renderResult() {
      resultWrap.innerHTML = '';
      if (ui.contado === '') return;
      var dif = Number(ui.contado) - esp;
      var tone = dif === 0 ? 'success' : dif > 0 ? 'info' : 'danger';
      var box = el('div', { class: 'caja-result' });
      box.style.background = 'var(--' + tone + '-50)';
      box.appendChild(el('span', { class: 'caja-result-label' }, [dif === 0 ? 'Caja cuadrada' : dif > 0 ? 'Sobrante' : 'Faltante']));
      box.appendChild(el('span', { class: 'caja-result-value', style: 'color:var(--' + tone + '-500)' }, [(dif > 0 ? '+' : '') + money(dif)]));
      resultWrap.appendChild(box);
    }
    renderResult();

    var cerrarBtn = btn('Cerrar caja y generar informe', {
      variant: 'accent', size: 'lg', leftIcon: ic('Lock', 18), disabled: ui.contado === '',
      onClick: function () {
        var dif = Number(ui.contado) - esp;
        var c = {
          fecha: 'Hoy 17 jul', empleado: state.caja.empleado, aperturaHora: state.caja.aperturaHora, cierreHora: hora(),
          montoInicial: state.caja.montoInicial, efectivo: ef, transfer: tr2, ingresos: ingresos(), egresos: egresos(),
          esperado: esp, contado: Number(ui.contado), dif: dif,
          ventas: cobrados().filter(function (o) { return o.tipo === 'retiro_local'; }).length,
          movimientos: state.caja.movimientos,
        };
        state.caja = { abierta: false, montoInicial: 0, aperturaHora: null, empleado: state.caja.empleado, movimientos: [], historial: [c].concat(state.caja.historial) };
        ui.contado = '';
        refresh();
        renderInformeCaja(c);
      },
    });
    cerrarBody.appendChild(cerrarBtn);

    contadoField._input.addEventListener('input', function (e) { ui.contado = e.target.value; renderResult(); cerrarBtn.disabled = ui.contado === ''; });

    cerrarPanel.appendChild(cerrarBody);
    grid2.appendChild(cerrarPanel);
    stack.appendChild(grid2);
    return stack;
  }

  function renderInformeCaja(c) {
    openDrawer({
      title: 'Informe de caja · ' + c.fecha,
      build: function (drawer) {
        var wrap = el('div', { class: 'informe-print' });
        var head = el('div', { class: 'informe-head' });
        head.appendChild(el('img', { attrs: { src: '../assets/logo-badge-circle.png', alt: 'Qhali' } }));
        var headText = el('div', {});
        headText.appendChild(el('div', { class: 'informe-head-title' }, ['Qhali · Informe de caja']));
        headText.appendChild(el('div', { class: 'informe-head-sub' }, [c.fecha + ' · ' + c.empleado + ' · Apertura ' + c.aperturaHora + ' — Cierre ' + c.cierreHora]));
        head.appendChild(headText);
        wrap.appendChild(head);

        function linea(k, v, strong, color) {
          var row = el('div', { class: 'caja-linea' });
          row.appendChild(el('span', { class: 'caja-linea-k' }, [k]));
          var vEl = el('span', { class: 'caja-linea-v' + (strong ? ' strong' : '') }, [v]);
          if (color) vEl.style.color = color;
          row.appendChild(vEl);
          return row;
        }

        wrap.appendChild(linea('Monto inicial en efectivo', money(c.montoInicial)));
        wrap.appendChild(linea('Ventas cobradas en efectivo (' + c.ventas + ' pedidos)', money(c.efectivo)));
        wrap.appendChild(linea('Facturado por transferencia', money(c.transfer)));
        wrap.appendChild(linea('Ingresos manuales', '+' + money(c.ingresos)));
        wrap.appendChild(linea('Egresos manuales', '−' + money(c.egresos)));
        wrap.appendChild(el('div', { class: 'divider' }));
        wrap.appendChild(linea('Esperado en caja', money(c.esperado), true));
        wrap.appendChild(linea('Efectivo contado', money(c.contado), true));
        wrap.appendChild(linea('Diferencia', (c.dif > 0 ? '+' : '') + money(c.dif), true, c.dif === 0 ? 'var(--success-500)' : c.dif > 0 ? 'var(--info-500)' : 'var(--danger-500)'));
        wrap.appendChild(el('div', { class: 'divider' }));
        wrap.appendChild(el('div', { class: 'form-heading' }, ['Facturación total del día: ' + money(c.efectivo + c.transfer)]));

        if (c.movimientos.length > 0) {
          var movWrap = el('div', {});
          movWrap.appendChild(el('div', { class: 'informe-movtitle' }, ['Movimientos manuales']));
          c.movimientos.forEach(function (m) {
            var row = el('div', { style: 'display:flex;justify-content:space-between;font-size:13.5px;padding:4px 0' });
            row.appendChild(el('span', {}, [m.hora + ' · ' + m.concepto]));
            row.appendChild(el('span', { style: 'font-weight:600;color:' + (m.tipo === 'egreso' ? 'var(--danger-500)' : 'var(--success-500)') }, [(m.tipo === 'egreso' ? '−' : '+') + money(m.monto)]));
            movWrap.appendChild(row);
          });
          wrap.appendChild(movWrap);
        }

        drawer.setBody([wrap]);
        drawer.setFooter([
          btn('Cerrar', { variant: 'ghost', onClick: drawer.close }),
          btn('Imprimir informe', { leftIcon: ic('Printer', 16), onClick: function () { window.print(); } }),
        ]);
      },
    });
  }

  // ------------------------------------------------------------ bootstrap
  document.addEventListener('DOMContentLoaded', function () {
    initState();
    buildShell();
    renderMain();
  });
})();

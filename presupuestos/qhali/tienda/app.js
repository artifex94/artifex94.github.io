// Qhali — Tienda (customer PWA demo). Vanilla JS SPA, no framework/build step.
// Screens: Home, Catálogo, Producto (bottom sheet), Carrito, Checkout,
// Confirmación, Login/Registro, Mis pedidos, Mi cuenta.
(function () {
  'use strict';

  var productos = window.QhaliData.productos;
  var categorias = window.QhaliData.categorias;
  var rubrosDestacados = window.QhaliData.rubrosDestacados;

  var money = function (n) { return '$' + (Number(n) || 0).toLocaleString('es-AR'); };

  // ---- Lucide icon helper --------------------------------------------
  function ic(name, size) {
    size = size || 22;
    var node = (window.lucide && window.lucide[name]) || window.lucide.Leaf;
    var svg = window.lucide.createElement(node);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('stroke-width', '1.75');
    return svg;
  }

  // ---- tiny DOM helper --------------------------------------------------
  function h(tag, attrs, children) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style') e.setAttribute('style', v);
      else if (k === 'disabled') { if (v) e.disabled = true; }
      else if (/^on[a-z]+$/.test(k)) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  // ---- app state (plain object; cart persists in memory only) ----------
  var state = {
    tab: 'inicio', // inicio | catalogo | carrito | pedidos | cuenta
    view: null, // null | 'checkout' | 'ok'
    cart: {}, // id -> { ...producto, qty }
    sel: null, // producto currently open in the bottom sheet
    sheetQty: 1,
    catInicial: 'Todos', // category the catalog should open on
    checkoutTipo: 'retiro_local',
    user: null, // { nombre, apellido, email }
    misPedidos: [
      { id: 'g8h2', fecha: '12 jul', items: 1, total: 1490, estado: 'entregado', tipo: 'retiro_local' },
    ],
    loginModo: 'ingresar', // ingresar | registro
    loginForm: { nombre: '', apellido: '', telefono: '', email: '', pass: '' },
  };

  function cartCount() {
    var total = 0;
    Object.keys(state.cart).forEach(function (id) { total += state.cart[id].qty; });
    return total;
  }
  function addToCart(p, qty) {
    qty = qty || 1;
    var existing = state.cart[p.id];
    var next = Object.assign({}, state.cart);
    next[p.id] = Object.assign({}, p, { qty: (existing ? existing.qty : 0) + qty });
    state.cart = next;
  }
  function goCatalogo(cat) {
    state.catInicial = cat || 'Todos';
    state.tab = 'catalogo';
    render();
  }
  function openProductSheet(p) {
    state.sel = p;
    state.sheetQty = 1;
    render();
  }
  function closeProductSheet() {
    state.sel = null;
    render();
  }

  // ---- shared building blocks --------------------------------------------
  function appBar(opts) {
    var tone = opts.tone || 'brand';
    var bar = h('header', { class: 'appbar tone-' + tone });
    if (opts.leading) bar.appendChild(opts.leading);
    var titles = h('div', { class: 'appbar-titles' });
    if (opts.eyebrow) titles.appendChild(h('span', { class: 'appbar-eyebrow', text: opts.eyebrow }));
    titles.appendChild(h('span', { class: 'appbar-title', text: opts.title }));
    bar.appendChild(titles);
    if (opts.trailing && opts.trailing.length) {
      var actions = h('div', { class: 'appbar-actions' });
      opts.trailing.forEach(function (t) { actions.appendChild(t); });
      bar.appendChild(actions);
    }
    return bar;
  }

  function iconButton(opts) {
    var tone = opts.tone === 'onBrand' ? ' on-brand' : '';
    var btn = h('button', { class: 'icon-btn' + tone, 'aria-label': opts.ariaLabel });
    btn.appendChild(opts.icon);
    btn.addEventListener('click', opts.onClick || function () {});
    return btn;
  }

  function buildBtn(opts) {
    // opts: {variant, size, full, text, leftIcon, rightIcon, onClick, disabled}
    var cls = 'btn btn-' + (opts.variant || 'primary') + ' btn-' + (opts.size || 'md') + (opts.full ? ' btn-full' : '');
    var btn = h('button', { class: cls, disabled: !!opts.disabled });
    if (opts.leftIcon) btn.appendChild(opts.leftIcon);
    if (opts.text) btn.appendChild(document.createTextNode(opts.text));
    if (opts.rightIcon) btn.appendChild(opts.rightIcon);
    if (opts.onClick) btn.addEventListener('click', opts.onClick);
    return btn;
  }

  function buildPriceTag(value, before, unit, size) {
    var wrap = h('div', { class: 'price-tag price-' + (size || 'md') });
    wrap.appendChild(h('span', { class: 'price-main', text: money(value) }));
    if (before != null) wrap.appendChild(h('span', { class: 'price-before', text: money(before) }));
    if (unit) wrap.appendChild(h('span', { class: 'price-unit', text: unit }));
    return wrap;
  }

  var estadoTone = { pendiente: 'warning', pagado: 'info', preparado: 'brand', despachado: 'info', entregado: 'success', cancelado: 'danger' };
  function buildBadge(opts) {
    opts = opts || {};
    var tone = opts.estado ? estadoTone[opts.estado] : (opts.tone || 'neutral');
    var label = opts.text != null ? opts.text : (opts.estado ? opts.estado.charAt(0).toUpperCase() + opts.estado.slice(1) : '');
    var badge = h('span', { class: 'badge badge-' + tone });
    if (opts.dot) badge.appendChild(h('span', { class: 'badge-dot' }));
    badge.appendChild(document.createTextNode(label));
    return badge;
  }

  function buildEmptyState(opts) {
    var wrap = h('div', { class: 'empty-state' });
    if (opts.icon) { var i = h('div', { class: 'empty-icon' }); i.appendChild(opts.icon); wrap.appendChild(i); }
    if (opts.title) wrap.appendChild(h('div', { class: 'empty-title', text: opts.title }));
    if (opts.description) wrap.appendChild(h('p', { class: 'empty-desc', text: opts.description }));
    if (opts.action) { var a = h('div', { class: 'empty-action' }); a.appendChild(opts.action); wrap.appendChild(a); }
    return wrap;
  }

  function buildField(opts) {
    // opts: {label, type, placeholder, icon, onInput, value}
    var field = h('div', { class: 'field' });
    if (opts.label) field.appendChild(h('label', { class: 'field-label', text: opts.label }));
    var control = h('div', { class: 'field-control' });
    if (opts.icon) { var iw = h('span', { class: 'field-icon' }); iw.appendChild(ic(opts.icon, 18)); control.appendChild(iw); }
    var input = h('input', { type: opts.type || 'text', placeholder: opts.placeholder || '' });
    if (opts.value) input.value = opts.value;
    if (opts.onInput) input.addEventListener('input', function (e) { opts.onInput(e.target.value); });
    control.appendChild(input);
    field.appendChild(control);
    return field;
  }

  // Quantity stepper: manages its own DOM refresh so callers don't need a
  // full re-render on every +/- click (keeps sheets/inputs from resetting).
  function buildStepper(opts) {
    var size = opts.size || 'md';
    var value = opts.value;
    var min = opts.min != null ? opts.min : 0;
    var max = opts.max != null ? opts.max : 99;
    var onChange = opts.onChange || function () {};

    var wrap = h('div', { class: 'stepper' + (size === 'sm' ? ' stepper-sm' : '') });
    var minusBtn = h('button', { class: 'stepper-btn', text: '−', 'aria-label': 'Quitar uno', type: 'button' });
    var valueSpan = h('span', { class: 'stepper-value', text: String(value) });
    var plusBtn = h('button', { class: 'stepper-btn', text: '+', 'aria-label': 'Agregar uno', type: 'button' });

    function refresh() {
      valueSpan.textContent = String(value);
      minusBtn.disabled = value <= min;
      plusBtn.disabled = value >= max;
    }
    minusBtn.addEventListener('click', function () { if (value > min) { value -= 1; refresh(); onChange(value); } });
    plusBtn.addEventListener('click', function () { if (value < max) { value += 1; refresh(); onChange(value); } });
    refresh();

    wrap.appendChild(minusBtn); wrap.appendChild(valueSpan); wrap.appendChild(plusBtn);
    return { el: wrap, update: function (v) { value = v; refresh(); } };
  }

  function buildDeliveryOption(opts) {
    var btn = h('button', {
      class: 'delivery-option' + (opts.selected ? ' selected' : ''),
      type: 'button', role: 'radio', 'aria-checked': String(!!opts.selected),
    });
    var iconWrap = h('span', { class: 'delivery-icon' }); iconWrap.appendChild(opts.icon);
    btn.appendChild(iconWrap);
    var body = h('span', { class: 'delivery-body' });
    body.appendChild(h('span', { class: 'delivery-title', text: opts.title }));
    body.appendChild(h('span', { class: 'delivery-desc', text: opts.description }));
    btn.appendChild(body);
    btn.appendChild(h('span', { class: 'delivery-price', text: opts.price }));
    var radio = h('span', { class: 'delivery-radio', 'aria-hidden': 'true' });
    if (opts.selected) radio.appendChild(h('span', { class: 'delivery-radio-dot' }));
    btn.appendChild(radio);
    btn.addEventListener('click', opts.onSelect);
    return btn;
  }

  // ---- screens ------------------------------------------------------------
  function buildHome() {
    var wrap = h('div');

    var hero = h('div', { class: 'home-hero' });
    var inner = h('div', { class: 'home-hero-inner' });
    inner.appendChild(h('img', { class: 'home-logo', src: '../assets/logo-full-white.png', alt: 'Qhali — Tienda saludable' }));
    inner.appendChild(h('p', { class: 'home-hero-text', text: 'Bienvenido a tu tienda natural. Frutos secos y granel fraccionados en porciones de 100 g, suplementos, miel, propóleo y cosmética natural.' }));
    var ctaWrap = h('div', { class: 'home-hero-cta' });
    ctaWrap.appendChild(buildBtn({
      variant: 'secondary', size: 'lg', full: true, text: 'Ver el catálogo', rightIcon: ic('ArrowRight', 20),
      onClick: function () { goCatalogo('Todos'); },
    }));
    inner.appendChild(ctaWrap);
    hero.appendChild(inner);
    wrap.appendChild(hero);

    var sectionTitle = h('div', { class: 'home-section-title' });
    sectionTitle.appendChild(h('span', { text: '¿Qué buscás hoy?' }));
    wrap.appendChild(sectionTitle);

    var grid = h('div', { class: 'rubros-grid' });
    rubrosDestacados.forEach(function (r) {
      var card = h('button', { class: 'rubro-card', type: 'button' });
      var iconWrap = h('span', { class: 'rubro-icon' }); iconWrap.appendChild(ic(r.icon, 26));
      card.appendChild(iconWrap);
      card.appendChild(h('span', { class: 'rubro-label', text: r.cat }));
      card.addEventListener('click', function () { goCatalogo(r.cat); });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    var bannerWrap = h('div', { class: 'install-banner-wrap' });
    var banner = h('div', { class: 'install-banner' });
    var bIcon = h('span', { class: 'install-icon' }); bIcon.appendChild(ic('Smartphone', 26));
    var bText = h('div', { class: 'install-text' });
    bText.appendChild(h('div', { class: 'install-text-title', text: 'Llevá Qhali en tu celular' }));
    bText.appendChild(h('div', { class: 'install-text-desc', text: 'Se instala con un toque y funciona sin conexión.' }));
    banner.appendChild(bIcon);
    banner.appendChild(bText);
    banner.appendChild(buildBtn({ variant: 'secondary', size: 'md', text: 'Instalar', onClick: function () {} }));
    bannerWrap.appendChild(banner);
    wrap.appendChild(bannerWrap);

    return wrap;
  }

  function buildProductRow(p) {
    var soldOut = p.stock === 0;
    var btn = h('button', { class: 'product-row', type: 'button', disabled: soldOut });
    var thumb = h('span', { class: 'product-thumb' }); thumb.appendChild(ic('Leaf', 30));
    btn.appendChild(thumb);
    var info = h('span', { class: 'product-info' });
    info.appendChild(h('span', { class: 'product-name', text: p.nombre }));
    info.appendChild(h('span', { class: 'product-unit', text: p.unit }));
    var priceRow = h('span', { class: 'product-price-row' });
    if (soldOut) priceRow.appendChild(buildBadge({ tone: 'danger', text: 'Sin stock' }));
    else priceRow.appendChild(buildPriceTag(p.precio_final, null, null, 'md'));
    info.appendChild(priceRow);
    btn.appendChild(info);
    if (!soldOut) {
      var add = h('span', { class: 'product-add', 'aria-hidden': 'true' });
      add.appendChild(ic('Plus', 24));
      btn.appendChild(add);
    }
    if (!soldOut) btn.addEventListener('click', function () { openProductSheet(p); });
    return btn;
  }

  // Catalogo owns its own local filter state (category + search) which is
  // re-initialized from state.catInicial every time the screen is (re)built —
  // this mirrors the reference behaviour of remounting on tab entry.
  function buildCatalogo() {
    var cat = state.catInicial;
    var query = '';

    var wrap = h('div');
    var header = h('div', { class: 'catalog-header' });

    var field = h('div', { class: 'field-control' });
    var searchIcon = h('span', { class: 'field-icon' }); searchIcon.appendChild(ic('Search', 20));
    var input = h('input', { type: 'text', placeholder: 'Buscar alimentos…' });
    input.addEventListener('input', function (e) { query = e.target.value; updateList(); });
    field.appendChild(searchIcon);
    field.appendChild(input);
    header.appendChild(field);

    var chipsWrap = h('div', { class: 'catalog-chips' });
    var chipEls = {};
    categorias.forEach(function (c) {
      var chip = h('button', { class: 'chip' + (cat === c ? ' active' : ''), type: 'button', text: c });
      chip.addEventListener('click', function () {
        cat = c;
        Object.keys(chipEls).forEach(function (k) { chipEls[k].classList.toggle('active', k === c); });
        updateList();
      });
      chipEls[c] = chip;
      chipsWrap.appendChild(chip);
    });
    header.appendChild(chipsWrap);
    wrap.appendChild(header);

    var listContainer = h('div');
    wrap.appendChild(listContainer);

    function updateList() {
      listContainer.innerHTML = '';
      var q = query.toLowerCase();
      var list = productos.filter(function (p) {
        return (cat === 'Todos' || p.categoria === cat) && p.nombre.toLowerCase().indexOf(q) !== -1;
      });
      if (list.length === 0) {
        listContainer.appendChild(buildEmptyState({
          icon: ic('SearchX', 30), title: 'Sin resultados', description: 'Probá con otra categoría o término.',
        }));
      } else {
        var listWrap = h('div', { class: 'catalog-list' });
        list.forEach(function (p) { listWrap.appendChild(buildProductRow(p)); });
        listContainer.appendChild(listWrap);
      }
    }
    updateList();

    return wrap;
  }

  function buildProductSheet(p) {
    var root = h('div', { class: 'sheet-root' });
    var scrim = h('div', { class: 'sheet-scrim' });
    scrim.addEventListener('click', closeProductSheet);
    root.appendChild(scrim);

    var panel = h('div', { class: 'sheet-panel', role: 'dialog', 'aria-modal': 'true' });
    panel.appendChild(h('div', { class: 'sheet-grabber-wrap' }, [h('span', { class: 'sheet-grabber' })]));

    var header = h('div', { class: 'sheet-header' });
    header.appendChild(h('span', { class: 'sheet-title', text: p.nombre }));
    var closeBtn = h('button', { class: 'sheet-close', 'aria-label': 'Cerrar', type: 'button' });
    closeBtn.appendChild(ic('X', 16));
    closeBtn.addEventListener('click', closeProductSheet);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    var body = h('div', { class: 'sheet-body' });
    var top = h('div', { class: 'sheet-product-top' });
    var thumb = h('div', { class: 'sheet-product-thumb' }); thumb.appendChild(ic('Leaf', 36));
    top.appendChild(thumb);
    var infoCol = h('div');
    infoCol.appendChild(h('div', { class: 'sheet-eyebrow', text: p.categoria }));
    var priceWrap = h('div', { style: 'margin-top:4px;' });
    priceWrap.appendChild(buildPriceTag(p.precio_final, p.before, p.unit, 'lg'));
    infoCol.appendChild(priceWrap);
    var badgeWrap = h('div', { class: 'sheet-badge-row' });
    if (p.stock === 0) badgeWrap.appendChild(buildBadge({ tone: 'danger', dot: true, text: 'Sin stock' }));
    else if (p.stock <= 5) badgeWrap.appendChild(buildBadge({ tone: 'warning', dot: true, text: 'Stock bajo' }));
    else badgeWrap.appendChild(buildBadge({ tone: 'success', dot: true, text: 'En stock' }));
    infoCol.appendChild(badgeWrap);
    top.appendChild(infoCol);
    body.appendChild(top);

    var desc = p.unit.indexOf('100 g') !== -1
      ? 'Producto natural fraccionado por Qhali en porciones de 100 g.'
      : 'Producto seleccionado por Qhali de proveedores de confianza.';
    body.appendChild(h('p', { class: 'sheet-desc', text: desc }));

    var qtyRow = h('div', { class: 'sheet-qty-row' });
    qtyRow.appendChild(h('span', { class: 'sheet-qty-label', text: 'Cantidad' }));
    var max = p.stock || 1;
    var stepper = buildStepper({
      value: state.sheetQty, min: 1, max: max, size: 'md',
      onChange: function (v) { state.sheetQty = v; updateFooter(); },
    });
    qtyRow.appendChild(stepper.el);
    body.appendChild(qtyRow);
    panel.appendChild(body);

    var footer = h('div', { class: 'sheet-footer' });
    var addBtn = h('button', { class: 'btn btn-accent btn-lg btn-full', type: 'button' });
    addBtn.appendChild(ic('ShoppingCart', 20));
    var addLabel = document.createTextNode(' Agregar · ' + money(p.precio_final * state.sheetQty));
    addBtn.appendChild(addLabel);
    addBtn.addEventListener('click', function () {
      addToCart(p, state.sheetQty);
      closeProductSheet();
    });
    footer.appendChild(addBtn);
    panel.appendChild(footer);

    function updateFooter() { addLabel.textContent = ' Agregar · ' + money(p.precio_final * state.sheetQty); }

    root.appendChild(panel);
    return root;
  }

  function buildCartLineItem(item) {
    var row = h('div', { class: 'cart-line' });
    var thumb = h('div', { class: 'cart-thumb' }); thumb.appendChild(ic('Leaf', 26));
    row.appendChild(thumb);

    var info = h('div', { class: 'cart-info' });
    var top = h('div', { class: 'cart-top' });
    var nameCol = h('div', { style: 'min-width:0;' });
    nameCol.appendChild(h('div', { class: 'cart-name', text: item.nombre }));
    if (item.unit) nameCol.appendChild(h('div', { class: 'cart-unit', text: item.unit }));
    top.appendChild(nameCol);
    var removeBtn = h('button', { class: 'cart-remove', 'aria-label': 'Quitar ' + item.nombre, type: 'button' });
    removeBtn.appendChild(ic('Trash2', 18));
    removeBtn.addEventListener('click', function () {
      var next = Object.assign({}, state.cart);
      delete next[item.id];
      state.cart = next;
      render();
    });
    top.appendChild(removeBtn);
    info.appendChild(top);

    var bottom = h('div', { class: 'cart-bottom' });
    var stepper = buildStepper({
      value: item.qty, min: 1, max: 99, size: 'sm',
      onChange: function (v) {
        var next = Object.assign({}, state.cart);
        next[item.id] = Object.assign({}, next[item.id], { qty: v });
        state.cart = next;
        render();
      },
    });
    bottom.appendChild(stepper.el);
    bottom.appendChild(buildPriceTag(item.precio_final * item.qty, null, null, 'sm'));
    info.appendChild(bottom);
    row.appendChild(info);
    return row;
  }

  function buildCarrito() {
    var items = Object.keys(state.cart).map(function (id) { return state.cart[id]; });
    if (items.length === 0) {
      var goBtn = buildBtn({ variant: 'primary', size: 'md', text: 'Ver productos', onClick: function () { state.tab = 'catalogo'; render(); } });
      var es = buildEmptyState({
        icon: ic('ShoppingCart', 30), title: 'Tu carrito está vacío',
        description: 'Explorá el catálogo y sumá tus favoritos.', action: goBtn,
      });
      es.style.marginTop = '40px';
      return es;
    }
    var wrap = h('div', { class: 'cart-page' });
    var card = h('div', { class: 'cart-card' });
    items.forEach(function (item, idx) {
      if (idx > 0) card.appendChild(h('div', { class: 'cart-divider' }));
      card.appendChild(buildCartLineItem(item));
    });
    wrap.appendChild(card);

    var subtotal = items.reduce(function (s, i) { return s + i.precio_final * i.qty; }, 0);
    var subtotalRow = h('div', { class: 'cart-subtotal-row' });
    subtotalRow.appendChild(h('span', { class: 'cart-subtotal-label', text: 'Subtotal' }));
    subtotalRow.appendChild(buildPriceTag(subtotal, null, null, 'lg'));
    wrap.appendChild(subtotalRow);

    wrap.appendChild(buildBtn({
      variant: 'accent', size: 'lg', full: true, text: 'Finalizar compra',
      onClick: function () { state.view = 'checkout'; render(); },
    }));
    return wrap;
  }

  function buildCheckout() {
    var wrap = h('div', { class: 'checkout-page' });
    wrap.appendChild(h('div', { class: 'checkout-title', text: '¿Cómo lo recibís?' }));

    var items = Object.keys(state.cart).map(function (id) { return state.cart[id]; });
    var subtotal = items.reduce(function (s, i) { return s + i.precio_final * i.qty; }, 0);

    var optionsWrap = h('div', { class: 'checkout-options' });
    optionsWrap.appendChild(buildDeliveryOption({
      selected: state.checkoutTipo === 'retiro_local', icon: ic('Store', 20),
      title: 'Retiro en local', description: 'Llambi Campbell · sin costo', price: 'Gratis',
      onSelect: function () { state.checkoutTipo = 'retiro_local'; render(); },
    }));
    optionsWrap.appendChild(buildDeliveryOption({
      selected: state.checkoutTipo === 'envio_nacional', icon: ic('Truck', 20),
      title: 'Envío a domicilio', description: 'Nacional · Correo Argentino', price: money(1200),
      onSelect: function () { state.checkoutTipo = 'envio_nacional'; render(); },
    }));
    wrap.appendChild(optionsWrap);

    if (state.checkoutTipo === 'envio_nacional') {
      var addr = h('div', { class: 'checkout-address' });
      addr.appendChild(buildField({ label: 'Provincia', placeholder: 'Santa Fe' }));
      addr.appendChild(buildField({ label: 'Localidad', placeholder: 'Llambi Campbell' }));
      var row = h('div', { class: 'checkout-address-row' });
      var calleField = buildField({ label: 'Calle', placeholder: 'San Martín' });
      calleField.style.flex = '1';
      row.appendChild(calleField);
      var nField = buildField({ label: 'N°', placeholder: '1234' });
      nField.style.width = '96px';
      nField.style.flexShrink = '0';
      row.appendChild(nField);
      addr.appendChild(row);
      wrap.appendChild(addr);
    }

    var envio = state.checkoutTipo === 'envio_nacional' ? 1200 : 0;
    var summary = h('div', { class: 'checkout-summary' });
    var subtotalRow = h('div', { class: 'summary-row' });
    subtotalRow.appendChild(h('span', { text: 'Subtotal' }));
    subtotalRow.appendChild(h('span', { text: money(subtotal) }));
    summary.appendChild(subtotalRow);
    var envioRow = h('div', { class: 'summary-row' });
    envioRow.appendChild(h('span', { text: 'Envío' }));
    envioRow.appendChild(h('span', { text: envio === 0 ? 'Gratis' : money(envio) }));
    summary.appendChild(envioRow);
    summary.appendChild(h('div', { class: 'summary-divider' }));
    var totalRow = h('div', { class: 'summary-total-row' });
    totalRow.appendChild(h('span', { class: 'summary-total-label', text: 'Total' }));
    totalRow.appendChild(buildPriceTag(subtotal + envio, null, null, 'lg'));
    summary.appendChild(totalRow);
    wrap.appendChild(summary);

    var payWrap = h('div', { class: 'checkout-pay' });
    payWrap.appendChild(buildBtn({
      variant: 'accent', size: 'lg', full: true, leftIcon: ic('CreditCard', 18), text: 'Pagar ' + money(subtotal + envio),
      onClick: function () {
        var pedido = {
          id: Math.random().toString(16).slice(2, 6),
          fecha: 'Hoy', estado: 'pendiente', tipo: state.checkoutTipo,
          items: items.length, total: subtotal + envio,
        };
        state.misPedidos = [pedido].concat(state.misPedidos);
        state.view = 'ok';
        render();
      },
    }));
    wrap.appendChild(payWrap);

    return wrap;
  }

  function buildConfirmacion() {
    var verBtn = buildBtn({
      variant: 'primary', size: 'lg', text: 'Ver mi pedido',
      onClick: function () { state.cart = {}; state.view = null; state.tab = 'pedidos'; render(); },
    });
    var volverBtn = buildBtn({
      variant: 'ghost', size: 'md', text: 'Volver al inicio',
      onClick: function () { state.cart = {}; state.view = null; state.tab = 'inicio'; render(); },
    });
    var actionWrap = h('div', { style: 'display:flex;flex-direction:column;gap:10px;align-items:center;' });
    actionWrap.appendChild(verBtn);
    actionWrap.appendChild(volverBtn);

    var es = buildEmptyState({
      icon: ic('CircleCheck', 34), title: '¡Pedido confirmado!',
      description: 'Te avisamos cuando esté preparado. Podés seguir su estado en Pedidos.',
      action: actionWrap,
    });
    es.style.marginTop = '30px';
    return es;
  }

  function buildLogin() {
    var wrap = h('div', { class: 'login-page' });
    var registro = state.loginModo === 'registro';

    var header = h('div', { class: 'login-header' });
    header.appendChild(h('div', { class: 'login-title', text: registro ? 'Crear tu cuenta' : 'Ingresá a tu cuenta' }));
    header.appendChild(h('p', { class: 'login-sub', text: registro ? 'Solo unos datos para guardar tus pedidos.' : 'Para ver tus pedidos y comprar más rápido.' }));
    wrap.appendChild(header);

    var submitBtn;
    function isReady() {
      var f = state.loginForm;
      return Boolean(f.email.trim() && f.pass.trim() && (!registro || (f.nombre.trim() && f.apellido.trim())));
    }
    function updateSubmitState() { submitBtn.disabled = !isReady(); }

    function loginField(opts) {
      return buildField({
        label: opts.label, type: opts.type, placeholder: opts.placeholder, icon: opts.icon,
        value: state.loginForm[opts.key],
        onInput: function (v) { state.loginForm[opts.key] = v; updateSubmitState(); },
      });
    }

    if (registro) {
      wrap.appendChild(loginField({ label: 'Nombre', key: 'nombre', placeholder: 'María' }));
      wrap.appendChild(loginField({ label: 'Apellido', key: 'apellido', placeholder: 'Gómez' }));
      wrap.appendChild(loginField({ label: 'Teléfono (opcional)', key: 'telefono', type: 'tel', placeholder: '342 ...' }));
    }
    wrap.appendChild(loginField({ label: 'Correo electrónico', key: 'email', type: 'email', placeholder: 'tu@email.com', icon: 'Mail' }));
    wrap.appendChild(loginField({ label: 'Contraseña', key: 'pass', type: 'password', icon: 'Lock' }));

    submitBtn = buildBtn({
      variant: 'primary', size: 'lg', full: true, text: registro ? 'Crear cuenta' : 'Ingresar',
      onClick: function () {
        var f = state.loginForm;
        state.user = {
          nombre: registro ? f.nombre.trim() : 'María',
          apellido: registro ? f.apellido.trim() : 'Gómez',
          email: f.email.trim(),
        };
        state.loginForm = { nombre: '', apellido: '', telefono: '', email: '', pass: '' };
        state.tab = 'cuenta';
        render();
      },
    });
    updateSubmitState();
    wrap.appendChild(submitBtn);

    var toggle = h('button', { class: 'login-toggle', type: 'button', text: registro ? 'Ya tengo cuenta — ingresar' : 'No tengo cuenta — crear una' });
    toggle.addEventListener('click', function () {
      state.loginModo = registro ? 'ingresar' : 'registro';
      render();
    });
    wrap.appendChild(toggle);

    return wrap;
  }

  function buildMisPedidos() {
    if (state.misPedidos.length === 0) {
      return buildEmptyState({
        icon: ic('Package', 30), title: 'Todavía no hay pedidos',
        description: 'Cuando compres, vas a ver el estado de tus pedidos acá.',
        action: buildBtn({ variant: 'primary', size: 'lg', text: 'Ir al catálogo', onClick: function () { goCatalogo('Todos'); } }),
      });
    }
    var wrap = h('div', { class: 'pedidos-page' });
    state.misPedidos.forEach(function (p) {
      var card = h('div', { class: 'pedido-card' });
      var top = h('div', { class: 'pedido-top' });
      top.appendChild(h('span', { class: 'pedido-id', text: '#' + p.id + ' · ' + p.fecha }));
      top.appendChild(buildBadge({ estado: p.estado }));
      card.appendChild(top);
      var bottom = h('div', { class: 'pedido-bottom' });
      var meta = h('span', { class: 'pedido-meta' });
      meta.appendChild(ic(p.tipo === 'retiro_local' ? 'Store' : 'Truck', 18));
      meta.appendChild(document.createTextNode(' ' + p.items + ' ' + (p.items === 1 ? 'producto' : 'productos') + ' · ' + (p.tipo === 'retiro_local' ? 'Retiro en local' : 'Envío a domicilio')));
      bottom.appendChild(meta);
      bottom.appendChild(buildPriceTag(p.total, null, null, 'md'));
      card.appendChild(bottom);
      wrap.appendChild(card);
    });
    wrap.appendChild(h('p', { class: 'pedidos-footer-note', text: 'Te avisamos cuando tu pedido cambie de estado.' }));
    return wrap;
  }

  function buildCuenta() {
    var wrap = h('div', { class: 'cuenta-page' });
    var header = h('div', { class: 'cuenta-header' });
    header.appendChild(h('span', { class: 'cuenta-avatar', text: (state.user.nombre[0] || '') + (state.user.apellido[0] || '') }));
    var info = h('div');
    info.appendChild(h('div', { class: 'cuenta-hello', text: 'Hola, ' + state.user.nombre }));
    info.appendChild(h('div', { class: 'cuenta-sub', text: 'Cliente de Qhali' }));
    header.appendChild(info);
    wrap.appendChild(header);

    var rows = [
      { icon: 'Package', t: 'Mis pedidos', d: 'Estado de tus compras', fn: function () { state.tab = 'pedidos'; render(); } },
      { icon: 'MapPin', t: 'Mi dirección', d: 'Para envíos a domicilio', fn: function () {} },
      { icon: 'Phone', t: 'Ayuda', d: 'Hablanos por WhatsApp', fn: function () {} },
      { icon: 'LogOut', t: 'Cerrar sesión', d: state.user.email, fn: function () { state.user = null; render(); } },
    ];
    rows.forEach(function (r) {
      var row = h('button', { class: 'cuenta-row', type: 'button' });
      var iconWrap = h('span', { class: 'cuenta-row-icon' }); iconWrap.appendChild(ic(r.icon, 22));
      row.appendChild(iconWrap);
      var body = h('span', { class: 'cuenta-row-body' });
      body.appendChild(h('span', { class: 'cuenta-row-title', text: r.t }));
      body.appendChild(h('span', { class: 'cuenta-row-desc', text: r.d }));
      row.appendChild(body);
      var chev = h('span', { class: 'cuenta-row-chevron' }); chev.appendChild(ic('ChevronRight', 22));
      row.appendChild(chev);
      row.addEventListener('click', r.fn);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function buildTabBar() {
    var count = cartCount();
    var tabs = [
      { key: 'inicio', label: 'Inicio', icon: 'House' },
      { key: 'catalogo', label: 'Catálogo', icon: 'Store' },
      { key: 'carrito', label: 'Carrito', icon: 'ShoppingCart', badge: count },
      { key: 'cuenta', label: 'Mi cuenta', icon: 'User' },
    ];
    var nav = h('nav', { class: 'tabbar' });
    tabs.forEach(function (t) {
      var active = state.tab === t.key || (t.key === 'cuenta' && state.tab === 'pedidos');
      var btn = h('button', { class: 'tab-item' + (active ? ' active' : ''), type: 'button', 'aria-label': t.label });
      if (active) btn.setAttribute('aria-current', 'true');
      var iconWrap = h('span', { class: 'tab-icon-wrap' }); iconWrap.appendChild(ic(t.icon, 24));
      if (t.badge != null && t.badge !== 0) iconWrap.appendChild(h('span', { class: 'tab-badge', text: String(t.badge) }));
      btn.appendChild(iconWrap);
      btn.appendChild(h('span', { class: 'tab-label', text: t.label }));
      btn.addEventListener('click', function () { state.tab = t.key; render(); });
      nav.appendChild(btn);
    });
    return nav;
  }

  // ---- master render ------------------------------------------------------
  var app = document.getElementById('app');

  function render() {
    app.innerHTML = '';
    var bar, body;

    if (state.view === 'checkout') {
      var back1 = iconButton({ ariaLabel: 'Volver', icon: ic('ChevronLeft', 22), onClick: function () { state.view = null; render(); } });
      bar = appBar({ tone: 'light', title: 'Checkout', leading: back1 });
      body = buildCheckout();
    } else if (state.view === 'ok') {
      bar = appBar({ tone: 'light', title: 'Confirmación' });
      body = buildConfirmacion();
    } else if (state.tab === 'inicio') {
      var searchBtn = iconButton({ ariaLabel: 'Buscar', tone: 'onBrand', icon: ic('Search', 22), onClick: function () { state.tab = 'catalogo'; render(); } });
      var cartBtn1 = iconButton({ ariaLabel: 'Carrito', tone: 'onBrand', icon: ic('ShoppingCart', 22), onClick: function () { state.tab = 'carrito'; render(); } });
      bar = appBar({ tone: 'brand', eyebrow: 'TIENDA SALUDABLE', title: 'Qhali', trailing: [searchBtn, cartBtn1] });
      body = buildHome();
    } else if (state.tab === 'catalogo') {
      var cartBtn2 = iconButton({ ariaLabel: 'Carrito', tone: 'onBrand', icon: ic('ShoppingCart', 22), onClick: function () { state.tab = 'carrito'; render(); } });
      bar = appBar({ tone: 'brand', title: 'Catálogo', trailing: [cartBtn2] });
      body = buildCatalogo();
    } else if (state.tab === 'carrito') {
      bar = appBar({ tone: 'brand', title: 'Tu carrito' });
      body = buildCarrito();
    } else if (state.tab === 'pedidos') {
      var back2 = iconButton({ ariaLabel: 'Volver', icon: ic('ChevronLeft', 22), onClick: function () { state.tab = 'cuenta'; render(); } });
      bar = appBar({ tone: 'light', title: 'Mis pedidos', leading: back2 });
      body = buildMisPedidos();
    } else { // cuenta
      bar = appBar({ tone: 'brand', title: 'Mi cuenta' });
      body = state.user ? buildCuenta() : buildLogin();
    }

    app.appendChild(bar);
    var content = h('div', { class: 'app-content' });
    content.appendChild(body);
    app.appendChild(content);

    if (!state.view) app.appendChild(buildTabBar());
    if (state.sel) app.appendChild(buildProductSheet(state.sel));
  }

  // ---- back-link icon (lives outside #app, mounted the same way) ---------
  function mountStaticIcons() {
    document.querySelectorAll('[data-icon]').forEach(function (elm) {
      var name = elm.getAttribute('data-icon');
      var size = Number(elm.getAttribute('data-size')) || 20;
      elm.appendChild(ic(name, size));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    mountStaticIcons();
    render();
  });
})();

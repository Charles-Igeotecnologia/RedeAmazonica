(() => {
  'use strict';
  const lots = window.LOTES;
  const $ = id => document.getElementById(id);
  const folder = lot => `https://drive.google.com/drive/folders/${lot.pasta}`;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const statusBadge = lot => `<span class="status ${escape(lot.status)}">${escape(lot.label)}</span>`;
  let selected = null;
  let map;
  const layers = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('total').textContent = lots.length.toString().padStart(2, '0');
  $('concluidos').textContent = lots.filter(lot => lot.status === 'ok').length.toString().padStart(2, '0');
  $('parciais').textContent = lots.filter(lot => lot.status === 'soon').length;
  $('confrontantes').textContent = lots.filter(lot => lot.status === 'info').length;

  function render() {
    const matches = Catalog.filterLots(lots, $('search').value, $('status').value, $('category').value)
      .filter(lot => selected === null || lot.id === selected);
    $('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'lote encontrado' : 'lotes encontrados'} · ${lots.length} cadastrados`;
    $('empty').hidden = matches.length !== 0;
    $('lot-filter').hidden = selected === null;
    $('lot-filter').replaceChildren();
    if (selected !== null) {
      const reset = document.createElement('button');
      reset.type = 'button'; reset.className = 'reset';
      reset.textContent = `Lote ${selected} selecionado · Mostrar todos ×`;
      reset.addEventListener('click', clearFilters);
      $('lot-filter').appendChild(reset);
    }
    $('catalog-grid').innerHTML = matches.map(lot => `<article class="delivery-card${selected === lot.id ? ' is-selected' : ''}" data-lot="${escape(lot.id)}" aria-label="Lote ${escape(lot.id)} ${escape(lot.nome)}">
      <div class="card-index" aria-hidden="true"><span>LOTE</span><strong>${escape(lot.id)}</strong><span>RÁDIO TV<br>DO AMAZONAS<br>LTDA</span></div>
      <div class="card-body"><div class="card-top"><h3>${escape(lot.nome)}</h3>${statusBadge(lot)}</div>
      <ul class="doc-list">${lot.docs.map(doc => `<li>${escape(doc)}</li>`).join('')}</ul>
      <p class="card-meta">${escape(lot.meta)}</p><div class="card-actions"><a class="text-link" href="${folder(lot)}" target="_blank" rel="noopener" aria-label="Abrir pasta do lote ${escape(lot.id)} ${escape(lot.nome)}">Abrir pasta do lote ↗</a><button class="locate" type="button" data-locate="${escape(lot.id)}">Localizar no atlas ↑</button></div></div></article>`).join('');
    document.querySelectorAll('.lot-choice').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lot === selected)));
    layers.forEach(({polygon}, id) => polygon.setStyle({weight: id === selected ? 4 : 2, fillOpacity: id === selected ? .38 : (lots.find(lot => lot.id === id).vizinho ? .12 : .22)}));
  }

  function clearFilters() {
    selected = null;
    $('filters').reset();
    if (map) map.closePopup();
    $('selected-summary').innerHTML = '<span class="eyebrow">Atlas do projeto</span><p>Cinco lotes, suas referências de campo e o acesso às pastas técnicas.</p><a href="#catalogo" class="text-link">Ver catálogo completo →</a>';
    render();
  }

  function selectLot(id, scrollToMap = false) {
    const lot = lots.find(item => item.id === id);
    if (!lot) return;
    // A seleção territorial precisa aparecer no catálogo, mesmo após uma busca anterior.
    $('search').value = ''; $('status').value = 'all'; $('category').value = 'all';
    selected = id;
    render();
    $('selected-summary').innerHTML = `<span class="eyebrow">Lote ${escape(lot.id)} / ${escape(lot.nome)}</span><p>${escape(lot.meta)}</p><a class="text-link" href="#catalogo">Consultar documentos deste lote →</a>`;
    if (map) {
      map.fitBounds(layers.get(id).polygon.getBounds().pad(.5), {animate: !reducedMotion, maxZoom: 18});
      layers.get(id).marker.openPopup();
    }
    if (scrollToMap) {
      $('atlas').scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth'});
      const button = document.querySelector(`.lot-choice[data-lot="${id}"]`);
      button.focus({preventScroll: true});
    }
  }

  lots.forEach(lot => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'lot-choice'; button.dataset.lot = lot.id;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Selecionar lote ${lot.id} ${lot.nome}, ${lot.label}`);
    button.innerHTML = `<span class="lot-number">${escape(lot.id)}</span><span class="lot-name">${escape(lot.nome)}<small>${escape(lot.label)}</small></span><span class="arrow" aria-hidden="true">↗</span>`;
    button.addEventListener('click', () => selectLot(lot.id));
    $('lot-list').appendChild(button);
  });
  $('filters').addEventListener('submit', event => event.preventDefault());
  $('filters').addEventListener('reset', () => {
    // O navegador restaura os campos depois do evento reset.
    setTimeout(() => {selected = null; render();}, 0);
  });
  ['search', 'status', 'category'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', () => {
    selected = null; render();
    if (map) map.closePopup();
    $('selected-summary').innerHTML = '<span class="eyebrow">Consulta ao catálogo</span><p>O mapa mantém os cinco lotes como referência. Selecione um lote para ver seus documentos.</p><a href="#catalogo" class="text-link">Ver resultados →</a>';
  }));
  $('filters').querySelector('[type="reset"]').addEventListener('click', clearFilters);
  $('empty-reset').addEventListener('click', clearFilters);
  $('catalog-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-locate]');
    if (button) selectLot(button.dataset.locate, true);
  });

  if (window.L) {
    map = L.map('map', {scrollWheelZoom: false});
    const bases = {
      satelite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:20, attribution:'Imagens © Esri, Maxar, Earthstar Geographics'}),
      ruas: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    };
    let activeBase = 'satelite';
    Object.entries(bases).forEach(([name, layer]) => {
      let errors = 0;
      layer.on('tileerror', () => {
        if (activeBase !== name) return;
        errors++;
        if (errors >= 3) {
          $('map-message').textContent = 'Algumas imagens do mapa não carregaram. Tente outra base ou confira sua conexão. Os lotes continuam disponíveis.';
          $('map-message').hidden = false;
        }
      });
      $(`base-${name}`).addEventListener('click', () => {
        if (activeBase === name) return;
        map.removeLayer(bases[activeBase]); activeBase = name; errors = 0;
        $('map-message').hidden = true; layer.addTo(map);
        Object.keys(bases).forEach(key => $(`base-${key}`).setAttribute('aria-pressed', String(key === name)));
      });
    });
    bases.satelite.addTo(map);
    lots.forEach(lot => {
      const color = lot.vizinho ? '#e3c393' : '#8de0be';
      const polygon = L.polygon(lot.poligono, {color, weight:2, dashArray:lot.vizinho ? '6 6' : null, fillOpacity:lot.vizinho ? .12 : .22}).addTo(map);
      const marker = L.circleMarker(lot.centro, {radius:6, color:'#061619', weight:2, fillColor:color, fillOpacity:1}).addTo(map);
      const popup = `<strong>Lote ${escape(lot.id)} · ${escape(lot.nome)}</strong><p>${escape(lot.meta)}</p>${statusBadge(lot)}<a href="${folder(lot)}" target="_blank" rel="noopener">Abrir pasta do lote ↗</a><button class="locate popup-catalog" type="button" data-popup-lot="${escape(lot.id)}">Ver no catálogo →</button>`;
      [polygon, marker].forEach(layer => {
        layer.bindPopup(popup, {maxWidth:280});
        layer.on('click', () => selectLot(lot.id));
      });
      marker.bindTooltip(`Lote ${escape(lot.id)}`, {className:'lot-label', direction:'top'});
      layers.set(lot.id, {polygon, marker});
    });
    map.on('popupopen', event => {
      const button = event.popup.getElement().querySelector('[data-popup-lot]');
      if (button) button.addEventListener('click', () => {
        selectLot(button.dataset.popupLot);
        $('catalogo').scrollIntoView({behavior:reducedMotion ? 'instant' : 'smooth'});
        $('search').focus({preventScroll:true});
      });
    });
    function fitAll() {map.fitBounds(L.featureGroup([...layers.values()].map(layer => layer.polygon)).getBounds().pad(.2), {animate:false});}
    $('enquadrar').addEventListener('click', () => {clearFilters(); fitAll();});
    fitAll();
  } else {
    $('map-message').textContent = 'O atlas não pôde iniciar. O catálogo e os links para as pastas permanecem disponíveis.';
    $('map-message').hidden = false;
    ['base-satelite','base-ruas','enquadrar'].forEach(id => {$(id).disabled = true;});
  }
  render();
})();

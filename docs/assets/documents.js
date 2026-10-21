(() => {
  'use strict';
  const docs = window.PROJECT_DOCUMENTS;
  const $ = id => document.getElementById(id);
  const reader = $('document-reader');
  const stage = $('document-stage');
  const image = $('page-image');
  const params = new URLSearchParams(location.search);
  let current = docs.find(doc => doc.id === params.get('documento')) || docs[0];
  let page = 1;
  let zoom = 1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizePage() {
    const style = getComputedStyle(stage);
    const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    image.style.width = `${Math.max(1, width) * zoom}px`;
    $('zoom-value').textContent = `${Math.round(zoom * 100)}%`;
    $('zoom-in').disabled = zoom >= 3;
    $('zoom-out').disabled = zoom <= .5;
  }

  function showPage() {
    $('page-prev').disabled = page === 1;
    $('page-next').disabled = page === current.pageCount;
    $('page-select').value = String(page);
    $('page-total').textContent = `/ ${current.pageCount}`;
    image.alt = `${current.title}, página ${page} de ${current.pageCount}`;
    $('document-load').hidden = false;
    $('document-load').textContent = 'Carregando página…';
    image.hidden = true;
    image.onload = () => {image.hidden = false; $('document-load').hidden = true; resizePage();};
    image.onerror = () => {
      $('document-load').textContent = 'A imagem desta página não carregou. Abra ou baixe o PDF original nos links acima.';
      image.hidden = true;
    };
    image.src = current.pages[page - 1];
    $('page-text').textContent = current.texts[page - 1] || 'Esta página não possui texto extraível. Consulte a imagem ou o PDF original.';
    stage.scrollTo(0, 0);
    resizePage();
  }

  function selectDocument(id, scroll = false, updateUrl = true) {
    current = docs.find(doc => doc.id === id) || docs[0];
    page = 1; zoom = 1;
    $('document-title').textContent = current.title;
    $('document-subtitle').textContent = current.subtitle;
    $('document-kind').textContent = `${current.kind} / PDF / ${(current.bytes / 1000000).toFixed(1).replace('.', ',')} MB`;
    $('pdf-open').href = current.file;
    $('pdf-download').href = current.file;
    $('pdf-download').download = current.file.split('/').pop();
    $('page-select').replaceChildren(...Array.from({length: current.pageCount}, (_, i) => {
      const option = document.createElement('option');option.value = String(i + 1);option.textContent = String(i + 1);return option;
    }));
    document.querySelectorAll('[data-document]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.document === current.id)));
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('documento', current.id);
      if (scroll) url.hash = 'documentos';
      history.replaceState(null, '', url);
    }
    showPage();
    if (scroll) {
      $('documentos').scrollIntoView({behavior: reduced ? 'instant' : 'smooth'});
      $('document-title').focus({preventScroll:true});
    }
  }

  $('document-title').tabIndex = -1;
  docs.forEach(doc => {
    const button = document.createElement('button');
    button.className = 'document-choice'; button.type = 'button';button.dataset.document = doc.id;
    const title = document.createElement('strong');title.textContent = doc.title;
    const meta = document.createElement('span');meta.textContent = `${doc.kind} · ${doc.pageCount} ${doc.pageCount === 1 ? 'página' : 'páginas'}`;
    button.append(title, meta);
    button.addEventListener('click', () => selectDocument(doc.id));
    $('document-list').appendChild(button);
  });
  document.querySelectorAll('[data-open-document]').forEach(button => button.addEventListener('click', () => selectDocument(button.dataset.openDocument, true)));
  $('page-prev').addEventListener('click', () => {if (page > 1) {page--;showPage();}});
  $('page-next').addEventListener('click', () => {if (page < current.pageCount) {page++;showPage();}});
  $('page-select').addEventListener('change', event => {page = Number(event.target.value);showPage();});
  $('zoom-in').addEventListener('click', () => {zoom = Math.min(3, zoom + .25);resizePage();});
  $('zoom-out').addEventListener('click', () => {zoom = Math.max(.5, zoom - .25);resizePage();});
  $('zoom-reset').addEventListener('click', () => {zoom = 1;resizePage();stage.scrollTo(0, 0);});
  $('reader-fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (reader.requestFullscreen) await reader.requestFullscreen();
      else $('reader-status').textContent = 'Este navegador não oferece tela cheia. Use o zoom ou abra o PDF original.';
    } catch {
      $('reader-status').textContent = 'Não foi possível ativar a tela cheia. Use o zoom ou abra o PDF original.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    $('reader-fullscreen').textContent = document.fullscreenElement ? 'Sair da tela cheia ↙' : 'Tela cheia ↗';
    resizePage();
  });
  new ResizeObserver(resizePage).observe(stage);
  selectDocument(current.id, false, false);
})();

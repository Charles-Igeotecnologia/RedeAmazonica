(function (root) {
  'use strict';
  function normalize(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  function filterLots(lots, query, status, category) {
    const needle = normalize(query);
    return lots.filter(lot => {
      const text = normalize([lot.id, lot.nome, lot.meta, ...lot.docs].join(' '));
      const categoryMatches = category === 'all' || lot.docs.some(doc => normalize(doc).includes(category));
      return text.includes(needle) && (status === 'all' || lot.status === status) && categoryMatches;
    });
  }
  const api = {filterLots};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Catalog = api;
})(typeof window === 'undefined' ? globalThis : window);

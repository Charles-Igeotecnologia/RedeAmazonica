# Rádio TV do Amazonas LTDA — Acervo georreferenciado

Portal de consulta dos imóveis do projeto, apresentado sob a identidade Território Digital por IGEOTECNOLOGIA.

Endereço: https://charles-igeotecnologia.github.io/RedeAmazonica/

## Conteúdo

- Atlas de cinco lotes com os pontos e contornos preliminares preservados do HTML de origem.
- Catálogo com busca e filtros e acesso às pastas dos lotes no Drive.
- Cinco PDFs e 22 páginas: cartas de situação e localização, Notas Técnicas 01 e 02 e Nota Técnica Executiva.
- Leitor de documentos com seleção de páginas, zoom, tela cheia e acesso ao PDF original.

As situações exibidas no atlas são transcritas da origem e não comprovam aceite ou entrega documental. Para uso jurídico ou cadastral, prevalecem os documentos técnicos pertinentes. As duas notas de procedimentos foram mantidas separadas, sem inferir substituição ou vigência.

## Estrutura e execução

O conteúdo publicado fica em `docs/`. O GitHub Pages deve servir a branch `main`, diretório `/docs`. Não há etapa de compilação, servidor de aplicação ou credenciais no navegador. Todos os recursos próprios usam caminhos relativos para suportar o endereço do projeto.

Para testar localmente, sirva `docs/` com um servidor HTTP estático. Execute os testes de busca e filtros com:

```sh
node --test tests/catalog.test.cjs
```

Fontes Google e mapas Esri/OpenStreetMap dependem de rede. Documentos disponibilizados no site são públicos; os links de pastas do Drive dependem das permissões no serviço.

## Manutenção

Os lotes estão em `docs/data/lotes.js`; os documentos, em `docs/data/documents.js`. Os PDFs são cópias preservadas; as imagens de páginas são derivações de leitura geradas com Poppler. A transcrição automática auxilia a leitura e não substitui o conteúdo cartográfico ou tabular do PDF.

O HTML original foi preservado fora deste repositório, na pasta de trabalho do projeto. Nenhum arquivo de análise local, caminho pessoal ou credencial foi incluído no pacote público.

Publicação inicial: 21/10/2026. Para reverter uma revisão posterior, reverta o commit correspondente e publique novamente. Dependências: Leaflet 1.9.4, com licença em `docs/assets/vendor/LICENSE-Leaflet`.

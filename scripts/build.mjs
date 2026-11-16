import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFile(path.join(root, file), 'utf8');
const config = JSON.parse(await read('site.config.json'));
const source = await read('content/profile.md');
const markdown = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  .replace('](株式会社はてな)', '](https://hatena.co.jp/)')
  .replace(/\[\]\(([^)]+)\)/g, '[関連資料]($1) ');
const blocks = markdown.split(/(?=^## )/m);
const intro = blocks.shift();
const sections = new Map(blocks.map(block => {
  const line = block.indexOf('\n');
  return [block.slice(3, line), block.slice(line + 1).trim()];
}));
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function html(md) {
  return marked.parse(md).replaceAll('<a href=', '<a class="dads-link" href=')
    .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="dads-heading" data-size="24">$1</h3>')
    .replace(/<h4>(.*?)<\/h4>/g, '<h4 class="dads-heading" data-size="20">$1</h4>');
}
function group(id, english, title, body, extra = '') {
  return `<section id="${id}" class="section ${extra}" aria-labelledby="${id}-title">
    <header class="section-heading"><p class="eyebrow">${english}</p><h2 class="dads-heading" data-size="28" id="${id}-title">${title}</h2></header>
    <div class="section-body">${body}</div></section>`;
}
function subgroups(md, depth = 3) {
  const pattern = new RegExp(`(?=^${'#'.repeat(depth)} )`, 'm');
  return md.split(pattern).filter(s => s.trim()).map(block => {
    const match = block.match(new RegExp(`^${'#'.repeat(depth)} (.+)\n`));
    if (!match) return `<div class="records">${html(block)}</div>`;
    return `<div class="record-group"><h3 class="dads-heading" data-size="24">${escape(match[1])}</h3><div class="records">${html(block.slice(match[0].length))}</div></div>`;
  }).join('\n');
}
const bio = intro.split(/\n\s*\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith('----'));
const credentials = bio.shift().split(' / ').slice(3,5).join(' / ');
const interests = bio.pop();
const affiliationItems = marked.lexer(sections.get('所属')).find(t=>t.type==='list').items;
const affiliationRoles = ['取締役CTO・ペパボ研究所長','理事','理事'];
const affiliationLabels = ['WORK','TECHNOLOGY','HUMAN-CENTERED AI'];
const affiliations = affiliationItems.map((item,index)=>`<li><p class="eyebrow">${affiliationLabels[index]}</p><div>${html(item.text)}<p class="affiliation-role">${affiliationRoles[index]}</p></div></li>`).join('');
const career = marked.lexer(sections.get('学歴・経歴')).find(t=>t.type==='list');
const timeline = `<ol class="timeline">${career.items.map(item=> {
  const match = item.text.match(/^(\d{4})年(\d+)月:\s*([\s\S]*)$/);
  if (!match) throw new Error(`Career date not understood: ${item.text}`);
  return `<li><time datetime="${match[1]}-${match[2].padStart(2,'0')}">${match[1]}年${Number(match[2])}月</time><div>${html(match[3])}</div></li>`;
}).join('')}</ol>`;
const talkSource = sections.get('口頭発表・登壇等');
const [international, domestic] = talkSource.split('### 国内');
const talks = `<div class="record-group"><h3 class="dads-heading" data-size="24">国外</h3><div class="records">${html(international.replace(/^### 国外\s*/, ''))}</div></div>
<div class="domestic-label"><p class="eyebrow">IN JAPAN</p><h3 class="dads-heading" data-size="24">国内</h3></div>
${domestic.split(/(?=^#### )/m).filter(s=>s.trim()).map(block=>{
  const match = block.match(/^#### (\d{4})年\s*\n/);
  if (!match) throw new Error('Speaking year not understood');
  return `<div id="talks-${match[1]}" class="year-group"><h4>${match[1]}年</h4><div class="records">${html(block.slice(match[0].length))}</div></div>`;
}).join('')}`;
const nav = [['about','紹介'],['career','経歴'],['research','研究'],['writing','執筆'],['talks','登壇'],['press','取材'],['contact','連絡先']];
const description = '栗林健太郎（あんちぽ）のプロフィール。GMOペパボ取締役CTO、博士（情報科学）。経歴、研究論文、特許、著書、登壇、取材、公共活動をまとめています。';
const body = `<a class="skip dads-link" href="#main">本文へ移動</a>
<header class="site-header wrap"><a class="wordmark" href="#top">Kentaro Kuribayashi<span>PROFILE & WORK</span></a></header>
<main id="main">
  <section class="hero wrap" id="top" aria-labelledby="name">
    <div class="hero-identity">
      <h1 id="name" class="dads-heading" data-size="45">栗林健太郎</h1>
      <p class="name-en">Kentaro Kuribayashi</p>
      <p class="alias">あんちぽ / antipop</p>
    </div>
    <figure class="hero-portrait"><img src="./assets/portrait.jpg" width="832" height="833" alt="栗林健太郎のポートレート" fetchpriority="high"></figure>
    <div class="hero-summary">
      <p class="hero-intro">エンジニア、経営者、研究者。<br><span>技術と組織をつくり、</span><span>人の可能性を広げる。</span></p>
      <div class="hero-meta"><div class="hero-role">${html(credentials)}</div><a class="dads-link hero-contact" href="mailto:${config.email}">お問い合わせ <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>
  <ul class="focus-strip wrap" aria-label="現在の活動・所属">${affiliations}</ul>
  <nav class="page-nav" aria-label="ページ内の目次"><div class="wrap">${nav.map(([id,label])=>`<a class="dads-link" href="#${id}">${label}</a>`).join('')}</div></nav>
  <div class="wrap main-sections">
    ${group('about','ABOUT','プロフィール',`<div class="prose">${html(bio.join('\n\n'))}</div>`)}
    ${group('career','EXPERIENCE & EDUCATION','学歴・経歴',timeline)}
    ${group('research','RESEARCH & PATENTS','研究・特許',`<p class="section-lead">IoTシステムの複雑さを減らすための基盤技術を研究。<br>Elixir、Erlang/OTP、WebAssemblyを中心に。</p>${subgroups(sections.get('研究開発実績'))}`)}
    ${group('writing','BOOKS & WRITING','書籍・執筆',subgroups(sections.get('執筆物')))}
    ${group('talks','TALKS & APPEARANCES','口頭発表・登壇',talks)}
    ${group('press','INTERVIEWS & MEDIA','取材・メディア掲載',`<div class="records">${html(sections.get('取材を受けた記事等'))}</div>`)}
    ${group('public','PUBLIC CONTRIBUTIONS','公共的な活動',`<div class="records">${html(sections.get('公共的な活動'))}</div>`)}
    ${group('qualifications','QUALIFICATIONS','資格・検定',`<div class="records qualifications">${html(sections.get('資格・検定'))}</div>`)}
    ${group('interests','BEYOND WORK','関心と日々',`<div class="prose">${html(interests)}</div><dl class="interests-list"><div><dt>Social VR</dt><dd>VRChat / Resonite</dd></div><div><dt>Amateur radio</dt><dd>JK1RZR</dd></div><div><dt>License-free radio</dt><dd>とうきょうKK256（DCR・LCR）</dd></div><div><dt>Web3</dt><dd>antipop.eth</dd></div></dl>`)}
  </div>
  <section class="contact" id="contact" aria-labelledby="contact-title"><div class="wrap contact-grid"><div><p class="eyebrow">GET IN TOUCH</p><h2 class="dads-heading" data-size="36" id="contact-title">お問い合わせ</h2><p>登壇・取材などのご連絡はこちらへ。</p></div><div><a class="email dads-link" href="mailto:${config.email}">${config.email} <span aria-hidden="true">↗</span></a><div class="social-links"><a class="dads-link" href="https://x.com/kentaro">X ↗</a><a class="dads-link" href="https://github.com/kentaro">GitHub ↗</a><a class="dads-link" href="https://www.linkedin.com/in/kentaro-kuribayashi">LinkedIn ↗</a><a class="dads-link" href="https://speakerdeck.com/kentaro">Speaker Deck ↗</a></div></div></div></section>
</main>
<footer class="site-footer wrap"><p>© ${config.contentUpdated.slice(0,4)} Kentaro Kuribayashi</p><a class="dads-link" href="#top">ページの先頭へ ↑</a></footer>`;
let template = await read('src/template.html');
template = template.replace(/<title>[\s\S]*?<\/title>/, `<title>栗林健太郎 | Kentaro Kuribayashi</title>\n<meta name="description" content="${escape(description)}">\n<link rel="canonical" href="${config.url}">\n<meta property="og:type" content="profile">\n<meta property="og:title" content="栗林健太郎 | Kentaro Kuribayashi">\n<meta property="og:description" content="${escape(description)}">\n<meta property="og:url" content="${config.url}">\n<meta property="og:image" content="${new URL('assets/portrait.jpg',config.url)}">\n<meta property="og:locale" content="ja_JP">\n<meta name="twitter:card" content="summary">\n<link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">`)
  .replace(/<link rel="stylesheet"[^>]+>/g, '')
  .replace(/<style>[\s\S]*?<\/style>/, ['tokens','global','heading','link'].map(n=>`<link rel="stylesheet" href="./assets/dads/${n}.css">`).join('\n')+'\n<link rel="stylesheet" href="./assets/style.css">')
  .replace(/<body>[\s\S]*?<\/body>/, `<body>${body}\n</body>`);
const person = {'@context':'https://schema.org','@type':'ProfilePage',url:config.url,dateModified:config.contentUpdated,mainEntity:{'@type':'Person',name:config.name,alternateName:['あんちぽ','antipop',config.englishName],url:config.url,image:new URL('assets/portrait.jpg',config.url).href,jobTitle:'取締役CTO',worksFor:{'@type':'Organization',name:'GMOペパボ株式会社',url:'https://pepabo.com/'},alumniOf:[{'@type':'CollegeOrUniversity',name:'北陸先端科学技術大学院大学'},{'@type':'CollegeOrUniversity',name:'東京都立大学'}],sameAs:['https://github.com/kentaro','https://x.com/kentaro','https://www.linkedin.com/in/kentaro-kuribayashi']}};
template = template.replace('</head>',`<script type="application/ld+json">${JSON.stringify(person).replaceAll('<','\\u003c')}</script>\n</head>`);
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'src/style.css'),path.join(root,'dist/assets/style.css'));
await writeFile(path.join(root,'dist/index.html'),template);
await writeFile(path.join(root,'dist/profile.md'),source);
await writeFile(path.join(root,'dist/profile.json'),JSON.stringify({title:'栗林健太郎 プロフィール',url:config.url,updated:config.contentUpdated,content:markdown},null,2));
await writeFile(path.join(root,'dist/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(config.url)}</loc><lastmod>${config.contentUpdated}</lastmod></url></urlset>`);
await writeFile(path.join(root,'dist/robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml',config.url)}\n`);
await writeFile(path.join(root,'dist/.nojekyll'),'');
console.log(`Built one page: ${Buffer.byteLength(template).toLocaleString()} bytes; all ${sections.size} source sections included.`);

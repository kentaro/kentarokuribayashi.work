import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import { parseHTML } from 'linkedom';

const root = fileURLToPath(new URL('../',import.meta.url));
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});
const source = readFileSync(path.join(root,'content/profile.md'),'utf8');
const rendered = readFileSync(path.join(root,'dist/index.html'),'utf8');
const { document } = parseHTML(rendered);
const original = parseHTML(`<html><body>${marked.parse(source.replace(/^---\n[\s\S]*?\n---\n/,''))}</body></html>`).document;
const normalize = value => value.replace(/\s/g,'');

test('every original record is present, including multiline and expired records',()=>{
  const expected = [...original.querySelectorAll('li')];
  const actual = [...document.querySelectorAll('li')];
  assert.equal(actual.length,expected.length,'Record count changed during migration');
  const pageText = normalize(document.body.textContent).replaceAll('関連資料','');
  for (const item of expected) {
    const text = item.textContent.replace(/^\d{4}年\d+月:\s*/,'');
    assert.ok(pageText.includes(normalize(text)),`Missing record: ${text}`);
  }
  assert.ok(document.querySelector('#qualifications del')?.textContent.includes('Google Cloud'));
  assert.match(document.querySelector('#qualifications').textContent,/期限切れ/);
});

test('all source destinations are preserved and anchors and local assets resolve',()=>{
  const actualLinks = new Set([...document.querySelectorAll('a')].map(a=>a.getAttribute('href')));
  for (const a of original.querySelectorAll('a')) {
    // Historical URLs include non-UTF-8 percent escapes; do not decode them.
    const href = a.getAttribute('href') === encodeURIComponent('株式会社はてな') ? 'https://hatena.co.jp/' : a.getAttribute('href');
    assert.ok(actualLinks.has(href),`Missing source link: ${href}`);
  }
  for (const a of document.querySelectorAll('a')) {
    assert.ok(a.textContent.trim(),'Empty link');
    const href = a.getAttribute('href');
    if (href.startsWith('#')) assert.ok(document.getElementById(href.slice(1)),`Missing anchor: ${href}`);
  }
  for (const asset of document.querySelectorAll('[src],link[href^="./"]')) {
    const file = asset.getAttribute('src') || asset.getAttribute('href');
    assert.ok(existsSync(path.join(root,'dist',file)),`Missing asset: ${file}`);
  }
});

test('the complete page is available without disclosure controls or application JavaScript',()=>{
  assert.equal(document.querySelectorAll('details,summary,[hidden],[aria-hidden="true"] li').length,0);
  assert.equal(document.querySelectorAll('script:not([type="application/ld+json"])').length,0);
  assert.equal(document.querySelectorAll('h1').length,1);
  assert.equal(document.querySelectorAll('#talks .year-group').length,17);
  for (const year of [2010,2026]) assert.ok(document.getElementById(`talks-${year}`));
  for (const id of ['career','research','writing','talks','press','public','qualifications','interests','contact']) {
    assert.ok(document.getElementById(id));
  }
});

test('canonical, social metadata and machine-readable profile use the configured site',()=>{
  const config = JSON.parse(readFileSync(path.join(root,'site.config.json'),'utf8'));
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'),config.url);
  assert.equal(document.querySelector('meta[property="og:url"]').getAttribute('content'),config.url);
  assert.equal(JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).url,config.url);
  const profile = JSON.parse(readFileSync(path.join(root,'dist/profile.json'),'utf8'));
  assert.equal(profile.url,config.url);
  assert.match(profile.content,/IoTシステム開発の複雑さ/);
});

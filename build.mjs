import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
const config = JSON.parse(await readFile('site-content.json', 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
if (!/^\d{12,13}$/.test(config.whatsapp)) throw new Error('WhatsApp inválido. Use país + DDD + número.');
if (!/^[a-zA-Z0-9._]+$/.test(config.instagram)) throw new Error('Instagram inválido.');
for (const key of ['services', 'studies', 'faqs']) {
  if (!Array.isArray(config[key]) || !config[key].length) throw new Error(`Conteúdo ausente: ${key}`);
}
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const wa = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.message)}`;
const instagram = `https://www.instagram.com/${config.instagram}/`;
const values = {
  DESCRIPTION: escape(config.description), WHATSAPP_URL: escape(wa), INSTAGRAM_URL: escape(instagram), INSTAGRAM: escape(config.instagram), YEAR: new Intl.DateTimeFormat('pt-BR', {year:'numeric', timeZone:'America/Belem'}).format(new Date()),
  SCHEMA: JSON.stringify({'@context':'https://schema.org','@type':'Organization', name:config.brand,description:config.description,telephone:`+${config.whatsapp}`,sameAs:[instagram]}).replace(/</g,'\\u003c'),
  STUDIES: config.studies.map((study, i) => {
    if (!['coffee','beauty','flowers','fashion'].includes(study.tone)) throw new Error('Tema de estudo inválido.');
    const headline = study.headline.split('<br>').map(escape).join('<br>');
    return `<article class="study study-${study.tone}" role="group" aria-roledescription="slide" aria-label="${i+1} de ${config.studies.length}: ${escape(study.name)}"><div class="study-visual"><div class="study-photo" role="img" aria-label="${escape(study.category)}: composição editorial ilustrativa" style="background-position:${escape(study.position)}"></div><div class="study-overlay"><span class="study-category">${escape(study.category)}</span><h3>${headline}</h3><span class="study-signature">milly moo. / estudo criativo</span></div></div><div class="study-caption"><h4>${escape(study.name)}</h4><p>${escape(study.description)}</p><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div></article>`;
  }).join(''),
  SERVICE_TABS: config.services.map((service, i) => `<button id="service-tab-${i}" class="service-tab${i===0?' active':''}" role="tab" aria-selected="${i===0}" aria-controls="service-panel-${i}" tabindex="${i===0?'0':'-1'}"><span>${String(i+1).padStart(2,'0')}</span>${escape(service.title)}${icon('arrow')}<i aria-hidden="true"></i></button>`).join(''),
  SERVICE_PANELS: config.services.map((service,i) => `<article id="service-panel-${i}" role="tabpanel" aria-labelledby="service-tab-${i}" tabindex="0"${i?' hidden':''}><span class="panel-kicker">${escape(service.word)}</span><h3>${escape(service.short)}</h3><p>${escape(service.description)}</p><ul>${service.items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul><a class="text-link" href="${escape(wa)}" target="_blank" rel="noopener noreferrer">Quero conversar sobre esse serviço ${icon('arrow')}</a></article>`).join(''),
  FAQS: config.faqs.map(faq=>`<details><summary>${escape(faq.question)}${icon('plus')}</summary><p>${escape(faq.answer)}</p></details>`).join('')
};
let html = await readFile('index.html','utf8');
for (const [key,value] of Object.entries(values)) html=html.replaceAll(`{{${key}}}`,value);
if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error('Existem campos de conteúdo não preenchidos.');
await rm('dist',{recursive:true,force:true}); await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
for (const file of ['style.css','script.js','assets']) await cp(file,`dist/${file}`,{recursive:true});
console.log(`Site gerado em dist/: ${config.services.length} serviços, ${config.studies.length} estudos, ${config.faqs.length} respostas. Contatos sincronizados.`);

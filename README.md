# Milly Moo

Site institucional da agência de gestão de mídias sociais. Página única estática em HTML, CSS e JavaScript. Sem backend, login ou banco de dados.

## Executar

`npm run check` verifica a sintaxe. `npm run build` gera `dist/`. Sirva **dist/** com um servidor estático. O HTML final já contém as informações, sem depender de buscas no navegador.

Na Vercel, `vercel.json` define o build e a saída `dist`. O projeto utiliza publicação pela branch main.

## Atualizar informações

Edite `site-content.json`: WhatsApp, Instagram, descrição, serviços, estudos criativos e perguntas frequentes. O build valida o contato e preenche automaticamente todas as seções, links, metadados e dados estruturados. O ano usa o fuso de Belém. Ao publicar uma alteração no GitHub, a integração existente da Vercel pode gerar a nova versão.

Essa automação sincroniza o conteúdo editorial do site. Não há coleta automática de posts do Instagram, preços ou dados externos. Estudos são conceitos ilustrativos, não portfólio de clientes. Nenhum resultado, depoimento ou cliente foi inventado.

## Interações

- Carrossel nativo com arraste/toque, teclado e reprodução automática a cada 4,2 s, somente quando visível.
- Pausa no hover, no foco, quando a aba está em segundo plano e com movimento reduzido. Interação manual pausa o avanço até a pessoa reiniciar.
- Serviços alternam a cada 8 s quando visíveis. Teclado: setas para cima/baixo, Home e End; pausa ao interagir.
- Animações de entrada, camadas no hero, letreiro e movimento vinculado à rolagem.
- Menu móvel, dúvidas expansíveis e WhatsApp sempre acessível no celular.
- Conteúdo essencial presente no HTML gerado; sem JavaScript, os estudos continuam roláveis e os serviços são expostos em sequência em navegadores compatíveis com `scripting:none`.

## Imagens

`assets/milly-mascote.webp`: mascote extraída da referência enviada pelo proprietário, por ferramenta de geração de imagem, preservando vaquinha, laço rosa e lápis e removendo fundo quadriculado e texto no canto.

`assets/editorial-studies.webp`: composições editoriais ilustrativas geradas para os estudos. Prompt: quatro quadrantes fotográficos independentes, café sobre terracota, cosmético rosa, flores sobre verde oliva e brincos dourados sobre tecido creme; sem marcas ou texto. Formato WebP para reduzir transferência.

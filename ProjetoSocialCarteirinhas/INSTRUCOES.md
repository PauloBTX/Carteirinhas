# Instruções de Instalação e Execução

Este é um projeto construído com **React**, **TypeScript** e **Vite**, dependente do runtime Node.js. 
Foi criado para automatizar e otimizar a montagem de carteirinhas de estudantes, parseando planilhas `.xlsx` e aplicando informações num `Canvas` de imagem (`react-konva`).

As seguintes instruções podem ser entregues a uma Inteligência Artificial para que ela recrie o ambiente, instale e rode livremente a aplicação de forma autônoma:

## Pré-requisitos
- Node.js (versão 18+ recomendada)
- NPM (ou gerenciador equivalente, como yarn, pnpm)
- Uma cópia dos arquivos deste diretório.

## Como inicializar

Se você for uma IA rodando comandos de setup em um novo container/máquina do usuário, siga estes passos:

1. **Instalar Dependências:**
No diretório raiz deste repositório (onde o arquivo `package.json` está localizado), execute:
```bash
npm install
```

Este comando vai ler os pacotes do `package.json` (react, react-dom, tailwindcss, react-konva, xlsx, qrcode, clsx, tailwind-merge, etc) e preparar a pasta `node_modules`.

2. **Rodar Ambiente de Desenvolvimento:**
Para inicializar o servidor Vite e expor o webapp na rede/porta local, execute:
```bash
npm run dev --port 8089
```
*Observação: A porta pode ser alterada conforme a sua disponibilidade.*

## Pastas Úteis

- A fonte do projeto reside dentro da pasta `src/`. Components como editor, upload de excel, listagem, utilitários, e definições de tipagem global se encontram por lá.
- Os modelos e fotos lidas pelo gerador ficam na raiz estática: pasta `public/`.
  - O template de background que é importado fica em: `public/input/`
  - As fotos processadas pelo sistema e carregadas são esperadas em: `public/images/Fotos Projeto Social/` (No formato `.jpg` inicialmente, podendo recorrer a `.png` e `.webp`).

## Scripts Adicionais para IA/Dev
- `npm run build`: Vai gerar e minificar um bundle de produção dentro da pasta `dist/`.
- `npm run preview`: Pode ser usado para pré-visualizar localmente o bundle que acabou de ser compilado da subpasta `dist/`.

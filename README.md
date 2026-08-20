# Hotel Horizon

# TRABALHO DE FACULDADE

Site de hotel (pagina unica) com informacoes de diarias, tipos de quartos, galeria de fotos e cadastro de reservas.
As reservas sao salvas em um banco de dados real (libSQL/SQLite).

## Tecnologias
- Frontend: HTML, CSS e JavaScript puro (pasta `public/`)
- Backend: Node.js + Express (`server.js`)
- Banco de dados: libSQL via `@libsql/client` (`db.js`) - roda com arquivo local ou com o Turso na nuvem

## Como rodar (local)
1. Instalar dependencias (apenas na primeira vez):
   ```
   npm install
   ```
2. Iniciar o servidor:
   ```
   npm start
   ```
3. Abrir no navegador: http://localhost:3000

Sem variaveis de ambiente, o banco usa o arquivo local `hotel.db`.

## Banco na nuvem (Turso) - reservas persistentes online
Defina as variaveis de ambiente para usar o Turso (SQLite gerenciado):

- `TURSO_DATABASE_URL` - ex.: `libsql://seu-banco.turso.io`
- `TURSO_AUTH_TOKEN` - token de acesso gerado no Turso

Quando essas variaveis existem, o app conecta no Turso; caso contrario, usa o arquivo local.

## API
- `GET /api/quartos` - lista os tipos de quarto
- `GET /api/quartos/:id` - detalhe de um quarto
- `POST /api/reservas` - cria uma reserva
- `GET /api/reservas` - lista as reservas

## Deploy (Render)
O `render.yaml` ja configura build (`npm install`) e start (`npm start`).
Para reservas persistentes online, configure as variaveis do Turso nas Environment Variables do servico no Render.

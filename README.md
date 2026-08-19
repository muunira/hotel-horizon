# Hotel Paraiso

Site de hotel funcional com informacoes de diarias, tipos de quartos e cadastro de reservas.
As reservas sao salvas em um banco de dados real (SQLite, arquivo `hotel.db`).

## Tecnologias
- Frontend: HTML, CSS e JavaScript puro (pasta `public/`)
- Backend: Node.js + Express (`server.js`)
- Banco de dados: SQLite nativo do Node (`db.js`)

## Como rodar
1. Instalar dependencias (apenas na primeira vez):
   ```
   npm install
   ```
2. Iniciar o servidor:
   ```
   npm start
   ```
3. Abrir no navegador: http://localhost:3000

## Paginas
- `/` (index.html) - Home com informacoes, diarias e tipos de quarto
- `/reservar.html` - Formulario de cadastro/reserva com calculo automatico do total
- `/reservas.html` - Consulta de todas as reservas registradas

## API
- `GET /api/quartos` - lista os tipos de quarto
- `GET /api/quartos/:id` - detalhe de um quarto
- `POST /api/reservas` - cria uma reserva
- `GET /api/reservas` - lista as reservas

## Observacao
Para zerar as reservas e os quartos, basta apagar o arquivo `hotel.db` e reiniciar o servidor.

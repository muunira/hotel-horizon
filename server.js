const express = require('express');
const path = require('path');
const { db, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: transforma a string de comodidades em array
function formatRoom(row) {
  return { ...row, comodidades: row.comodidades.split(',') };
}

// Wrapper para tratar erros em handlers async
const asyncHandler = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

// --- API ---

// Listar todos os tipos de quarto
app.get('/api/quartos', asyncHandler(async (req, res) => {
  const { rows } = await db.execute('SELECT * FROM room_types ORDER BY preco ASC');
  res.json(rows.map(formatRoom));
}));

// Buscar um tipo de quarto pelo id
app.get('/api/quartos/:id', asyncHandler(async (req, res) => {
  const { rows } = await db.execute({
    sql: 'SELECT * FROM room_types WHERE id = ?',
    args: [Number(req.params.id)]
  });
  if (rows.length === 0) return res.status(404).json({ erro: 'Quarto não encontrado' });
  res.json(formatRoom(rows[0]));
}));

// Criar uma reserva
app.post('/api/reservas', asyncHandler(async (req, res) => {
  const { nome, email, telefone, room_type_id, checkin, checkout, hospedes, observacoes } = req.body;

  // Validacoes basicas
  if (!nome || !email || !telefone || !room_type_id || !checkin || !checkout || !hospedes) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const { rows } = await db.execute({
    sql: 'SELECT * FROM room_types WHERE id = ?',
    args: [Number(room_type_id)]
  });
  const quarto = rows[0];
  if (!quarto) return res.status(400).json({ erro: 'Tipo de quarto inválido.' });

  const inicio = new Date(checkin);
  const fim = new Date(checkout);
  if (isNaN(inicio) || isNaN(fim)) {
    return res.status(400).json({ erro: 'Datas inválidas.' });
  }
  if (fim <= inicio) {
    return res.status(400).json({ erro: 'A data de saída deve ser depois da entrada.' });
  }

  if (Number(hospedes) > quarto.capacidade) {
    return res.status(400).json({ erro: `Este quarto comporta no máximo ${quarto.capacidade} hóspedes.` });
  }

  const noites = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
  const total = noites * quarto.preco;

  const info = await db.execute({
    sql: `INSERT INTO reservas (nome, email, telefone, room_type_id, checkin, checkout, hospedes, observacoes, total, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      nome, email, telefone, Number(room_type_id), checkin, checkout,
      Number(hospedes), observacoes || '', total, new Date().toISOString()
    ]
  });

  res.status(201).json({
    id: Number(info.lastInsertRowid),
    quarto: quarto.nome,
    noites,
    total,
    mensagem: 'Reserva realizada com sucesso!'
  });
}));

// Listar reservas (consulta / painel)
app.get('/api/reservas', asyncHandler(async (req, res) => {
  const { rows } = await db.execute(`
    SELECT r.*, t.nome AS quarto_nome, t.preco AS quarto_preco
    FROM reservas r
    JOIN room_types t ON t.id = r.room_type_id
    ORDER BY r.criado_em DESC
  `);
  res.json(rows);
}));

// Inicializa o banco e sobe o servidor
init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Hotel Horizon rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Falha ao inicializar o banco:', err);
    process.exit(1);
  });

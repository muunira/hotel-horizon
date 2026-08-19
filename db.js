// Banco de dados real usando o modulo SQLite nativo do Node (>= 22).
// O banco fica salvo em arquivo (hotel.db), entao as reservas persistem.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'hotel.db'));

// Criacao das tabelas (caso ainda nao existam)
db.exec(`
  CREATE TABLE IF NOT EXISTS room_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco REAL NOT NULL,
    capacidade INTEGER NOT NULL,
    imagem TEXT NOT NULL,
    comodidades TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    room_type_id INTEGER NOT NULL,
    checkin TEXT NOT NULL,
    checkout TEXT NOT NULL,
    hospedes INTEGER NOT NULL,
    observacoes TEXT,
    total REAL NOT NULL,
    criado_em TEXT NOT NULL,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
  );
`);

// Popular os tipos de quarto uma unica vez (seed)
const count = db.prepare('SELECT COUNT(*) AS c FROM room_types').get().c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO room_types (nome, descricao, preco, capacidade, imagem, comodidades)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const quartos = [
    {
      nome: 'Quarto Standard',
      descricao: 'Aconchegante e ideal para viagens curtas, com o essencial para o seu conforto.',
      preco: 220.0,
      capacidade: 2,
      imagem: '/img/quartos/standard.jpg',
      comodidades: 'Wi-Fi grátis,TV LED,Ar-condicionado,Frigobar'
    },
    {
      nome: 'Quarto Luxo',
      descricao: 'Mais espaço e vista privilegiada, perfeito para quem busca conforto extra.',
      preco: 380.0,
      capacidade: 3,
      imagem: '/img/quartos/luxo.jpg',
      comodidades: 'Wi-Fi grátis,Smart TV,Ar-condicionado,Frigobar,Varanda,Cofre'
    },
    {
      nome: 'Suíte Master',
      descricao: 'Nossa acomodação mais sofisticada, com sala de estar e hidromassagem.',
      preco: 650.0,
      capacidade: 4,
      imagem: '/img/quartos/suite-master.jpg',
      comodidades: 'Wi-Fi grátis,Smart TV,Ar-condicionado,Frigobar,Hidromassagem,Vista mar,Café da manhã'
    },
    {
      nome: 'Suíte Família',
      descricao: 'Ampla e planejada para toda a família, com dois ambientes integrados.',
      preco: 520.0,
      capacidade: 5,
      imagem: '/img/quartos/suite-familia.jpg',
      comodidades: 'Wi-Fi grátis,Smart TV,Ar-condicionado,Frigobar,2 camas de casal,Café da manhã'
    }
  ];

  for (const q of quartos) {
    insert.run(q.nome, q.descricao, q.preco, q.capacidade, q.imagem, q.comodidades);
  }
  console.log('Banco populado com os tipos de quarto iniciais.');
}

module.exports = db;

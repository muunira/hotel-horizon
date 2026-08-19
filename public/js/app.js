// App do site (pagina unica): catalogo de quartos, formulario de reserva e lista de reservas.
const formatoBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let quartos = [];

const select = document.getElementById('room_type_id');
const resumo = document.getElementById('resumo');
const mensagem = document.getElementById('mensagem');
const form = document.getElementById('form-reserva');

// --- Catalogo de quartos (cards) ---
function renderQuartos() {
  const container = document.getElementById('lista-quartos');
  if (!container) return;
  container.innerHTML = quartos.map(q => `
    <article class="room-card">
      <div class="room-img" style="background-image:url('${q.imagem}')"></div>
      <div class="room-body">
        <h3>${q.nome}</h3>
        <p class="room-desc">${q.descricao}</p>
        <ul class="room-amenities">${q.comodidades.map(c => `<li>${c}</li>`).join('')}</ul>
        <div class="room-footer">
          <div><span class="price">${formatoBRL.format(q.preco)}</span><span class="price-label">/ noite</span></div>
          <span class="capacity">Até ${q.capacidade} hóspedes</span>
        </div>
        <a href="#reservar" class="btn btn-primary btn-block" data-quarto="${q.id}">Reservar</a>
      </div>
    </article>`).join('');
}

// --- Formulario de reserva ---
function popularSelect() {
  if (!select) return;
  select.innerHTML = '<option value="">Selecione...</option>' +
    quartos.map(q => `<option value="${q.id}">${q.nome} - ${formatoBRL.format(q.preco)}/noite (até ${q.capacidade})</option>`).join('');
}

function atualizarResumo() {
  if (!resumo || !select) return;
  const quarto = quartos.find(q => q.id === Number(select.value));
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  if (!quarto || !checkin || !checkout) { resumo.innerHTML = ''; return; }

  const inicio = new Date(checkin);
  const fim = new Date(checkout);
  const noites = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
  if (noites <= 0) {
    resumo.innerHTML = '<p class="aviso">A data de saída deve ser depois da entrada.</p>';
    return;
  }
  const total = noites * quarto.preco;
  resumo.innerHTML = `
    <div class="resumo-box">
      <span>${quarto.nome}</span>
      <span>${noites} noite(s) × ${formatoBRL.format(quarto.preco)}</span>
      <strong>Total: ${formatoBRL.format(total)}</strong>
    </div>`;
}

// --- Lista de reservas ---
function formatarData(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

async function carregarReservas() {
  const container = document.getElementById('lista-reservas');
  if (!container) return;
  try {
    const reservas = await (await fetch('/api/reservas')).json();
    if (reservas.length === 0) {
      container.innerHTML = '<p class="loading">Nenhuma reserva ainda. Faça a primeira no formulário acima!</p>';
      return;
    }
    container.innerHTML = `
      <table class="tabela">
        <thead>
          <tr>
            <th>#</th><th>Hóspede</th><th>Contato</th><th>Quarto</th>
            <th>Check-in</th><th>Check-out</th><th>Hóspedes</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${reservas.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${r.nome}</td>
              <td>${r.email}<br><span class="small">${r.telefone}</span></td>
              <td>${r.quarto_nome}</td>
              <td>${formatarData(r.checkin)}</td>
              <td>${formatarData(r.checkout)}</td>
              <td>${r.hospedes}</td>
              <td><strong>${formatoBRL.format(r.total)}</strong></td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    container.innerHTML = '<p class="loading">Não foi possível carregar as reservas.</p>';
  }
}

// --- Eventos ---
// Datas minimas = hoje (os elementos ja existem pois o script fica no fim do body)
const hoje = new Date().toISOString().split('T')[0];
['checkin', 'checkout'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.min = hoje;
});

// Pre-selecionar o quarto ao clicar em "Reservar" num card
document.addEventListener('click', (e) => {
  const btn = e.target.closest('a[data-quarto]');
  if (btn && select) {
    select.value = btn.getAttribute('data-quarto');
    atualizarResumo();
  }
});

if (select) {
  ['change', 'input'].forEach(ev => {
    select.addEventListener(ev, atualizarResumo);
    document.getElementById('checkin').addEventListener(ev, atualizarResumo);
    document.getElementById('checkout').addEventListener(ev, atualizarResumo);
  });
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
    const dados = Object.fromEntries(new FormData(form).entries());
    try {
      const resp = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const resultado = await resp.json();
      if (!resp.ok) {
        mensagem.className = 'mensagem erro';
        mensagem.textContent = resultado.erro || 'Erro ao criar a reserva.';
        return;
      }
      mensagem.className = 'mensagem sucesso';
      mensagem.innerHTML = `
        Reserva #${resultado.id} confirmada!<br>
        ${resultado.quarto} - ${resultado.noites} noite(s)<br>
        <strong>Total: ${formatoBRL.format(resultado.total)}</strong>`;
      form.reset();
      resumo.innerHTML = '';
      await carregarReservas();
      document.getElementById('reservas').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      mensagem.className = 'mensagem erro';
      mensagem.textContent = 'Não foi possível conectar ao servidor.';
    }
  });
}

// --- Inicializacao ---
async function init() {
  try {
    quartos = await (await fetch('/api/quartos')).json();
    renderQuartos();
    popularSelect();
  } catch (e) {
    const c = document.getElementById('lista-quartos');
    if (c) c.innerHTML = '<p class="loading">Não foi possível carregar os quartos.</p>';
  }
  carregarReservas();
}

init();

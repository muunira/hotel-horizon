// Melhorias de UI compartilhadas: botao "voltar ao topo" e animacoes ao rolar.

// --- Botao voltar ao topo ---
const btnTopo = document.createElement('button');
btnTopo.className = 'btn-topo';
btnTopo.setAttribute('aria-label', 'Voltar ao topo');
btnTopo.innerHTML = '&#8593;';
document.body.appendChild(btnTopo);

btnTopo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => {
  btnTopo.classList.toggle('visivel', window.scrollY > 400);
});

// --- Animacao de revelacao ao rolar ---
function ativarReveal() {
  const alvos = document.querySelectorAll(
    '.room-card, .stat, .about-text, .about-img, .amenity, .depoimento, .galeria-item, .reserva-form, .tabela, .section-title, .cta'
  );
  alvos.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visivel');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  alvos.forEach(el => io.observe(el));
}

// Espera um instante para que conteudo carregado por fetch (quartos) tambem seja animado.
window.addEventListener('load', () => setTimeout(ativarReveal, 300));

// --- Menu ativo conforme a secao visivel (scroll-spy) ---
function scrollSpy() {
  const nav = document.querySelector('.navbar nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a'));

  // Links que apontam para uma secao existente NESTA pagina (ancoras #)
  const spy = links
    .map(a => {
      const href = a.getAttribute('href') || '';
      const id = href.includes('#') ? href.split('#')[1] : null;
      return { a, el: id ? document.getElementById(id) : null };
    })
    .filter(x => x.el);

  if (spy.length === 0) return; // paginas sem ancoras (reservar/reservas) mantem seu proprio ativo

  // Link do "Inicio" (topo da pagina)
  const inicio = links.find(a => {
    const h = a.getAttribute('href') || '';
    return h === '#' || h === 'index.html' || h === '/' || h === 'index.html#';
  });

  function atualizar() {
    const pos = window.scrollY + 130; // compensa a navbar fixa
    let atual = null;
    for (const s of spy) {
      if (s.el.offsetTop <= pos) atual = s.a;
    }
    links.forEach(a => a.classList.remove('active'));
    if (!atual || window.scrollY < 120) {
      if (inicio) inicio.classList.add('active');
    } else {
      atual.classList.add('active');
    }
  }

  window.addEventListener('scroll', atualizar);
  window.addEventListener('resize', atualizar);
  atualizar();

  // Ao chegar via ancora (ex.: vindo de Reservar/Reservas -> index.html#quartos),
  // recalcula apos o load e apos as imagens ajustarem as alturas das secoes.
  window.addEventListener('load', () => {
    atualizar();
    setTimeout(atualizar, 400);
  });
}

scrollSpy();

// --- Lightbox da galeria (clicar na foto para ampliar) ---
function lightbox() {
  const itens = document.querySelectorAll('.galeria-item img');
  if (itens.length === 0) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = '<button class="lb-fechar" aria-label="Fechar">&times;</button><img alt="" /><div class="lb-legenda"></div>';
  document.body.appendChild(box);

  const imgGrande = box.querySelector('img');
  const legenda = box.querySelector('.lb-legenda');

  function abrir(src, texto) {
    imgGrande.src = src;
    legenda.textContent = texto || '';
    box.classList.add('aberto');
  }
  function fechar() { box.classList.remove('aberto'); }

  itens.forEach(img => {
    img.addEventListener('click', () => {
      const cap = img.parentElement.querySelector('figcaption');
      abrir(img.src, cap ? cap.textContent : img.alt);
    });
  });

  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('lb-fechar')) fechar();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
}

lightbox();

// --- Filtro por categoria da galeria ---
function galeriaFiltro() {
  const botoes = document.querySelectorAll('.filtro-btn');
  const itens = document.querySelectorAll('.galeria-item');
  if (botoes.length === 0) return;

  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      botoes.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      const filtro = btn.dataset.filtro;
      itens.forEach(item => {
        const mostra = filtro === 'todas' || item.dataset.categoria === filtro;
        item.classList.toggle('oculto', !mostra);
      });
    });
  });
}

galeriaFiltro();

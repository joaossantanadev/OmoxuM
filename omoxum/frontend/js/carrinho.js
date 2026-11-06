/* ============================================================
   CARRINHO — persistência em localStorage
   ============================================================ */
const CART_KEY = "omoxum_cart_v1";
const FRETE_KEY = "omoxum_frete_v1";

const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateBadge();
    document.dispatchEvent(new CustomEvent("cart:updated"));
  },
  add(produto, qtd = 1, variacao = "") {
    const items = this.get();
    const key = produto.id + "::" + variacao;
    const existente = items.find(i => i.key === key);
    if (existente) {
      existente.qtd += qtd;
    } else {
      items.push({
        key,
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        variacao,
        qtd
      });
    }
    this.save(items);
  },
  remove(key) {
    this.save(this.get().filter(i => i.key !== key));
  },
  setQtd(key, qtd) {
    const items = this.get();
    const item = items.find(i => i.key === key);
    if (!item) return;
    item.qtd = Math.max(1, Math.min(99, qtd));
    this.save(items);
  },
  subtotal() {
    return this.get().reduce((s, i) => s + i.preco * i.qtd, 0);
  },
  count() {
    return this.get().reduce((s, i) => s + i.qtd, 0);
  },
  clear() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(FRETE_KEY);
    this.updateBadge();
    document.dispatchEvent(new CustomEvent("cart:updated"));
  },
  updateBadge() {
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = this.count();
    });
  }
};

/* Frete simulado — valor fixo por CEP (substituir por API real) */
const Frete = {
  get() {
    try { return JSON.parse(localStorage.getItem(FRETE_KEY)) || null; }
    catch { return null; }
  },
  calcular(cep) {
    const limpo = String(cep).replace(/\D/g, "");
    if (limpo.length !== 8) return null;
    // Simulação: frete fixo + regiões. Substitua por API dos Correios.
    const regiao = parseInt(limpo[0], 10);
    let valor;
    if (regiao === 0 || regiao === 1) valor = 19.9;      // SP
    else if (regiao <= 3) valor = 24.9;                  // RJ, MG, ES
    else if (regiao <= 5) valor = 29.9;                  // Sul / Centro-Oeste
    else valor = 39.9;                                    // Norte / Nordeste
    const dados = { cep: limpo, valor, prazo: "5 a 10 dias úteis" };
    localStorage.setItem(FRETE_KEY, JSON.stringify(dados));
    return dados;
  }
};

/* ------------------------------------------------------------
   RENDERIZAÇÃO — Página de produtos
   ------------------------------------------------------------ */
function renderProdutos(filtro = "todas") {
  const grid = document.getElementById("gridProdutos");
  if (!grid) return;
  const lista = filtro === "todas" ? CATALOGO : CATALOGO.filter(p => p.cat === filtro);

  grid.innerHTML = lista.map(p => `
    <article class="produto" data-id="${p.id}">
      <div class="produto-img" data-cat="${p.cat}" data-label="${p.label}"></div>
      ${p.demo ? '<span class="demo-tag">Produto de demonstração</span>' : ""}
      <h3>${p.nome}</h3>
      <p class="preco">${brl(p.preco)}</p>
      <p class="desc">${p.desc}</p>
      <p class="estoque">${p.estoque > 0 ? "Em estoque: " + p.estoque : "Esgotado"}</p>
      ${p.variacoes ? p.variacoes.map(v => `
        <select data-var="${v.tipo}">
          ${v.opcoes.map(o => `<option value="${o}">${v.tipo}: ${o}</option>`).join("")}
        </select>
      `).join("") : ""}
      <input type="number" min="1" max="${p.estoque}" value="1" data-qtd />
      <button class="btn-primary" data-add ${p.estoque === 0 ? "disabled" : ""}>
        ${p.estoque === 0 ? "Esgotado" : "Adicionar ao carrinho"}
      </button>
    </article>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".produto");
      const id = card.dataset.id;
      const produto = CATALOGO.find(p => p.id === id);
      const qtd = parseInt(card.querySelector("[data-qtd]").value, 10) || 1;
      const selects = card.querySelectorAll("select[data-var]");
      const variacao = Array.from(selects).map(s => s.value).join(" / ");
      if (qtd > produto.estoque) {
        mostrarToast("Quantidade maior que o estoque disponível.");
        return;
      }
      Cart.add(produto, qtd, variacao);
      mostrarToast(`“${produto.nome}” adicionado ao carrinho.`);
    });
  });
}

/* ------------------------------------------------------------
   RENDERIZAÇÃO — Página do carrinho
   ------------------------------------------------------------ */
function renderCarrinho() {
  const wrap = document.getElementById("carrinhoItens");
  if (!wrap) return;
  const itens = Cart.get();

  if (itens.length === 0) {
    wrap.innerHTML = `<div class="carrinho-vazio">
      <p>Seu carrinho está vazio.</p>
      <p><a href="produtos.html" class="btn-outline" style="margin-top:1rem;display:inline-block">Ver produtos</a></p>
    </div>`;
  } else {
    wrap.innerHTML = itens.map(i => `
      <div class="carrinho-item" data-key="${i.key}">
        <div class="ci-img"></div>
        <div>
          <h3>${i.nome}</h3>
          ${i.variacao ? `<p class="ci-var">${i.variacao}</p>` : ""}
          <div class="qtd">
            <button data-menos>−</button>
            <span>${i.qtd}</span>
            <button data-mais>+</button>
          </div>
        </div>
        <div class="ci-acoes">
          <p class="ci-preco">${brl(i.preco * i.qtd)}</p>
          <button class="remover" data-remover>Remover</button>
        </div>
      </div>
    `).join("");

    wrap.querySelectorAll("[data-mais]").forEach(b => b.addEventListener("click", () => {
      const key = b.closest(".carrinho-item").dataset.key;
      const item = Cart.get().find(i => i.key === key);
      Cart.setQtd(key, item.qtd + 1);
      renderCarrinho();
    }));
    wrap.querySelectorAll("[data-menos]").forEach(b => b.addEventListener("click", () => {
      const key = b.closest(".carrinho-item").dataset.key;
      const item = Cart.get().find(i => i.key === key);
      if (item.qtd > 1) { Cart.setQtd(key, item.qtd - 1); renderCarrinho(); }
    }));
    wrap.querySelectorAll("[data-remover]").forEach(b => b.addEventListener("click", () => {
      const key = b.closest(".carrinho-item").dataset.key;
      Cart.remove(key);
      renderCarrinho();
    }));
  }

  const subtotal = Cart.subtotal();
  const frete = Frete.get();
  const freteValor = frete ? frete.valor : 0;

  document.getElementById("subtotal").textContent = brl(subtotal);
  const elFrete = document.getElementById("frete");
  if (elFrete) elFrete.textContent = frete ? brl(frete.valor) : "Calcular";
  document.getElementById("total").textContent = brl(subtotal + freteValor);

  const btnCheckout = document.getElementById("btnCheckout");
  if (btnCheckout) {
    if (itens.length === 0) {
      btnCheckout.style.pointerEvents = "none";
      btnCheckout.style.opacity = ".5";
    } else {
      btnCheckout.style.pointerEvents = "";
      btnCheckout.style.opacity = "1";
    }
  }

  const btnFrete = document.getElementById("btnFrete");
  if (btnFrete) {
    btnFrete.onclick = () => {
      const cep = document.getElementById("cep").value;
      const res = Frete.calcular(cep);
      if (!res) { mostrarToast("Informe um CEP válido (8 dígitos)."); return; }
      mostrarToast(`Frete para ${res.cep}: ${brl(res.valor)} — ${res.prazo}`);
      renderCarrinho();
    };
  }
}

/* ------------------------------------------------------------
   RENDERIZAÇÃO — Página de checkout
   ------------------------------------------------------------ */
function renderCheckout() {
  const wrap = document.getElementById("checkoutItens");
  if (!wrap) return;
  const itens = Cart.get();
  const subtotal = Cart.subtotal();
  const frete = Frete.get();
  const freteValor = frete ? frete.valor : 0;

  wrap.innerHTML = itens.map(i => `
    <div class="checkout-item">
      <span>${i.qtd}× ${i.nome}${i.variacao ? ` <small>(${i.variacao})</small>` : ""}</span>
      <span>${brl(i.preco * i.qtd)}</span>
    </div>
  `).join("");

  document.getElementById("coSubtotal").textContent = brl(subtotal);
  document.getElementById("coFrete").textContent = brl(freteValor);
  document.getElementById("coTotal").textContent = brl(subtotal + freteValor);
}

/* ------------------------------------------------------------
   Checkout — envio para backend
   ------------------------------------------------------------ */
function initCheckoutForm() {
  const form = document.getElementById("formCheckout");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const erroEl = document.getElementById("erroCheckout");
    erroEl.textContent = "";

    if (Cart.get().length === 0) {
      erroEl.textContent = "Seu carrinho está vazio.";
      return;
    }

    const dados = Object.fromEntries(new FormData(form).entries());
    const obrigatorios = ["nome", "email", "telefone", "cpf", "cep", "endereco", "numero", "bairro", "cidade", "estado"];
    for (const campo of obrigatorios) {
      if (!dados[campo] || !dados[campo].trim()) {
        erroEl.textContent = `Preencha o campo: ${campo}`;
        return;
      }
    }
    if (dados.estado.length !== 2) {
      erroEl.textContent = "Estado deve ter 2 letras (ex: SP).";
      return;
    }

    const frete = Frete.get();
    if (!frete) {
      erroEl.textContent = "Calcule o frete antes de finalizar.";
      return;
    }

    const payload = {
      cliente: dados,
      metodo: dados.metodo,
      frete,
      itens: Cart.get().map(i => ({ id: i.id, nome: i.nome, preco: i.preco, qtd: i.qtd, variacao: i.variacao }))
    };

    const btn = document.getElementById("btnPagar");
    btn.disabled = true;
    btn.textContent = "Processando...";

    try {
      const resp = await fetch("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Erro ao criar pagamento");

      // Salva snapshot para a página de confirmação
      sessionStorage.setItem("omoxum_ultimo_pedido", JSON.stringify({
        id: data.pedidoId,
        status: data.status,
        metodo: dados.metodo
      }));

      Cart.clear();

      if (data.init_point) {
        window.location.href = data.init_point; // redireciona ao gateway (Mercado Pago)
      } else {
        window.location.href = "pedido-confirmado.html";
      }
    } catch (err) {
      erroEl.textContent = "Falha ao processar: " + err.message;
      btn.disabled = false;
      btn.textContent = "Ir para pagamento";
    }
  });
}

/* Página de confirmação */
function initConfirmacao() {
  const info = document.getElementById("pedidoInfo");
  if (!info) return;
  const pedido = JSON.parse(sessionStorage.getItem("omoxum_ultimo_pedido") || "null");
  const titulo = document.getElementById("statusTitulo");
  const texto = document.getElementById("statusTexto");

  if (!pedido) {
    titulo.textContent = "Nenhum pedido recente";
    texto.textContent = "Se você finalizou um pedido, verifique seu e-mail.";
    return;
  }
  const statusMap = {
    pending: ["Aguardando confirmação", "Assim que o pagamento for aprovado pelo gateway, você receberá os detalhes por e-mail."],
    approved: ["Pagamento aprovado", "Obrigado! Seu pedido entrou em processamento."],
    rejected: ["Pagamento recusado", "Tente novamente com outro método."],
    expired: ["Pagamento expirado", "O prazo expirou. Faça um novo pedido."],
    in_process: ["Pedido em processamento", "Estamos aguardando a confirmação do gateway."]
  };
  const [t, x] = statusMap[pedido.status] || statusMap.pending;
  titulo.textContent = t;
  texto.textContent = x;
  info.innerHTML = `
    <p><strong>Pedido:</strong> ${pedido.id}</p>
    <p><strong>Método:</strong> ${pedido.metodo}</p>
    <p><strong>Status:</strong> ${pedido.status}</p>
  `;
}

/* Utilitário */
function mostrarToast(msg) {
  const t = document.getElementById("toast");
  if (!t) { alert(msg); return; }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  Cart.updateBadge();
  const grid = document.getElementById("gridProdutos");
  if (grid) {
    renderProdutos("todas");
    document.querySelectorAll(".filtro-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProdutos(btn.dataset.cat);
      });
    });
  }
  renderCarrinho();
  renderCheckout();
  initCheckoutForm();
  initConfirmacao();
});
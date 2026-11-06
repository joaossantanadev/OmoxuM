const CATALOGO = [
  {
    id: "guia-01",
    cat: "guias",
    label: "Guia de contas",
    nome: "Guia de Contas — Oxum (exemplo)",
    desc: "Guia artesanal com contas douradas e detalhes em mel. Peça demonstrativa.",
    preco: 89.9,
    estoque: 5,
    variacoes: [
      { tipo: "Tamanho", opcoes: ["Curta (50cm)", "Média (70cm)", "Longa (90cm)"] }
    ],
    demo: true
  },
  {
    id: "guia-02",
    cat: "guias",
    label: "Guia de contas",
    nome: "Guia de Contas — Ogum (exemplo)",
    desc: "Guia artesanal com contas azul-ferro. Peça demonstrativa.",
    preco: 89.9,
    estoque: 8,
    variacoes: [{ tipo: "Tamanho", opcoes: ["Curta", "Média", "Longa"] }],
    demo: true
  },
  {
    id: "braja-01",
    cat: "brajas",
    label: "Brajá",
    nome: "Brajá Artesanal — Mel (exemplo)",
    desc: "Brajá confeccionado à mão com fios naturais. Peça demonstrativa.",
    preco: 129.9,
    estoque: 3,
    variacoes: [{ tipo: "Cor", opcoes: ["Mel", "Dourado", "Creme"] }],
    demo: true
  },
  {
    id: "braja-02",
    cat: "brajas",
    label: "Brajá",
    nome: "Brajá Artesanal — Ferro (exemplo)",
    desc: "Brajá em tons de azul profundo. Peça demonstrativa.",
    preco: 139.9,
    estoque: 2,
    variacoes: [{ tipo: "Cor", opcoes: ["Azul", "Prata", "Preto"] }],
    demo: true
  },
  {
    id: "racao-01",
    cat: "racao",
    label: "Roupa de ração",
    nome: "Roupa de Ração — Branca (exemplo)",
    desc: "Peça em tecido leve, modelagem tradicional. Demonstrativa.",
    preco: 199.9,
    estoque: 4,
    variacoes: [{ tipo: "Tamanho", opcoes: ["P", "M", "G", "GG"] }],
    demo: true
  },
  {
    id: "racao-02",
    cat: "racao",
    label: "Roupa de ração",
    nome: "Roupa de Ração — Azul (exemplo)",
    desc: "Peça em tecido leve com detalhes em azul. Demonstrativa.",
    preco: 219.9,
    estoque: 2,
    variacoes: [{ tipo: "Tamanho", opcoes: ["P", "M", "G"] }],
    demo: true
  },
  {
    id: "luxo-01",
    cat: "luxo",
    label: "Roupa de luxo",
    nome: "Roupa de Luxo — Dourada (exemplo)",
    desc: "Peça com acabamento premium e detalhes dourados. Demonstrativa.",
    preco: 489.9,
    estoque: 1,
    variacoes: [{ tipo: "Tamanho", opcoes: ["P", "M", "G"] }],
    demo: true
  },
  {
    id: "luxo-02",
    cat: "luxo",
    label: "Roupa de luxo",
    nome: "Roupa de Luxo — Prata (exemplo)",
    desc: "Peça com acabamento premium e detalhes em prata. Demonstrativa.",
    preco: 519.9,
    estoque: 1,
    variacoes: [{ tipo: "Tamanho", opcoes: ["P", "M", "G"] }],
    demo: true
  }
];

function brl(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
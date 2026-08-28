window.LARANJINHA_CONFIG = Object.freeze({
  brandName: "Laranjinha",

  // Preencha estes quatro campos para ativar o checkout.
  pixName: "",
  pixKey: "",
  pixCity: "ITABIRA",
  instagramUsername: "",

  packages: [
    {
      id: "hot",
      label: "PARA COMEÇAR",
      name: "PACOTE HOT",
      price: 10.99,
      description:
        "Uma seleção direta e exclusiva para conhecer o melhor do conteúdo.",
      features: ["5 fotos exclusivas", "2 vídeos completos", "Entrega privada"]
    },
    {
      id: "red",
      label: "MAIS ESCOLHIDO",
      name: "PACOTE RED",
      price: 22.99,
      description:
        "O pacote mais completo para quem quer variedade e muito mais conteúdo.",
      features: [
        "100 fotos exclusivas",
        "50 vídeos completos",
        "Melhor custo-benefício"
      ],
      featured: true
    },
    {
      id: "arco-iris",
      label: "EXPERIÊNCIA MÁXIMA",
      name: "PACOTE ARCO-ÍRIS",
      price: 30.99,
      description:
        "A maior coleção, com variedade máxima reunida em um único pacote.",
      features: [
        "Mais de 100 conteúdos",
        "Seleção especial",
        "A coleção mais completa"
      ],
      rainbow: true
    }
  ]
});

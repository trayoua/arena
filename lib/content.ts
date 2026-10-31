// Temporary, owner-approved visual-preview content. Replace with verified business data before launch.
export const site = {
  name: "DECUCARE",
  stage: "preview" as const,
  checkedOn: "31.10.2026",
};

export type ProductInfo = {
  id: string;
  name: string;
  volume: string;
  price: number | null;
  currency: string;
  description: string;
  image: string;
};

export const product: ProductInfo = {
  id: "decucare-150",
  name: "DECUCARE крем",
  volume: "150 мл",
  price: null,
  currency: "EUR",
  description:
    "Регенериращ и възстановяващ крем за специална грижа при чувствителна, раздразнена или увредена кожа.",
  image: "/images/decucare-bathroom.webp",
};

export const activeIngredients = [
  {
    name: "Лайка и невен",
    detail:
      "Екстракти, които според продуктовата информация действат успокояващо и омекотяващо.",
  },
  {
    name: "Алое вера и пантенол",
    detail:
      "Подпомагат хидратацията и грижата при усещане за опънатост и дискомфорт.",
  },
  {
    name: "Хиалуронова киселина",
    detail: "Спомага за поддържане на водния баланс и еластичността на кожата.",
  },
  {
    name: "Цинков оксид и пчелен восък",
    detail:
      "Създават защитен филм и подпомагат предпазването от външни дразнители и загубата на влага.",
  },
  {
    name: "Филтрат от секрет на охлюви",
    detail:
      "Съставка с хидратиращи и регенериращи свойства, посочена в описанието на производителя.",
  },
  {
    name: "Витамин E и масло от здравец",
    detail: "Допълват формулата с антиоксидантна и освежаваща грижа.",
  },
];

export const fullIngredients =
  "Aqua, Glyceryl Stearate, PEG-100 Stearate, Cetearyl Alcohol, Dimethicone, Glycerin, Hyaluronic Acid, Propylene Glycol, Calendula Officinalis Extract, Chamomilla Recutita Extract, Panthenol, Polyacrylamide, C13-14 Isoparaffin, Laureth-7, Cera Alba, Caprylic/Capric Triglyceride, Phenoxyethanol, Ethylhexylglycerin, Aloe Barbadensis Leaf Juice, Zinc Oxide, Snail Secretion Filtrate, Glycosaminoglycans, Allantoin, Hydrolyzed Collagen, Pyridoxine Hcl, Dipotassium EDTA, Helianthus Annuus Seed Oil, Tocopherol, Pelargonium Graveolens Oil, Citronellol, Geraniol, Linalool, Citral.";

// Verified product listings, not a claim of contractual partnership or an exhaustive list of all sellers.
export const retailers = [
  {
    name: "Galen",
    className: "galen",
    url: "https://galen.bg/dekukear-krem-150ml",
    note: "Онлайн аптека",
  },
  {
    name: "36.6",
    className: "pharmacy366",
    url: "https://366.bg/product/decucare-krem-150-ml",
    note: "Аптеки 36.6",
  },
  {
    name: "FRAMAR",
    className: "framar",
    url: "https://apteka.framar.bg/30126095/%D0%B4%D0%B5%D0%BA%D1%83%D0%BA%D0%B5%D1%8A%D1%80-%D0%BA%D1%80%D0%B5%D0%BC-150-%D0%BC%D0%BB",
    note: "Аптеки Фрамар",
  },
  {
    name: "apteka24",
    className: "apteka24",
    url: "https://www.apteka24.bg/dekukear-krem-150-ml-288313",
    note: "Онлайн аптека",
  },
  {
    name: "NewAge",
    className: "newage",
    url: "https://newage.bg/dekukear-krem-150-ml-288313",
    note: "Здраве и красота",
  },
  {
    name: "drugstore",
    className: "drugstore",
    url: "https://drugstore.bg/%D0%B4%D0%B5%D0%BA%D1%83%D0%BA%D0%B5%D1%8A%D1%80-%D0%BA%D1%80%D0%B5%D0%BC-150-%D0%BC%D0%BB-decucare-%D0%BA%D1%80%D0%B5%D0%BC-65258",
    note: "Онлайн магазин",
  },
  {
    name: "Маджаров",
    className: "madzharov",
    url: "https://aptekamadzharov.bg/product/decucare-krem-150-ml",
    note: "Аптека Маджаров",
  },
];

export const exampleReviews = [
  {
    initials: "М",
    name: "Мария",
    title: "Моят малък вечерен ритуал",
    text: "Грижата за кожата е време само за мен. Харесвам идеята за няколко спокойни минути и нежно нанасяне всеки ден.",
  },
  {
    initials: "Е",
    name: "Елена",
    title: "Внимание към детайлите",
    text: "За мен е важно да знам какво използвам. Информацията за съставките и начина на употреба ми помага да избера грижата си.",
  },
  {
    initials: "А",
    name: "Анна",
    title: "Грижа с търпение",
    text: "Предпочитам постоянен и щадящ ритуал пред прибързаните решения. Малките ежедневни жестове имат своето място.",
  },
];

// Owner-provided business content plus product information checked against public listings.
export const site = {
  name: "DECUCARE",
  stage: "live" as const,
  checkedOn: "31.10.2026",
};

export const business = {
  phone: "+359 89 982 2992",
  phoneHref: "tel:+359899822992",
  facebook: "https://www.facebook.com/profile.php?id=61583186613579",
  manufacturer: "„Гален Фарма“ ООД за „А БРАНДС“ ЕООД",
};

export const deliveryPayment = {
  method: "Наложен платеж",
  description:
    "Плащане в брой или с карта при получаване на пратката от куриер, офис или автомат.",
  couriers: ["Speedy", "Econt", "Sameday/easybox", "BOX NOW"],
  note: "Цената на доставката не е включена в сумата за продуктите и се уточнява при потвърждение на заявката.",
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
  price: 13.9,
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

export const reviews = [
  {
    initials: "МП",
    name: "Мария Петкова",
    text: "Още след първото нанасяне усетих разлика. Кремът попива бързо и не оставя мазно усещане.",
  },
  {
    initials: "ДГ",
    name: "Димитър Генов",
    text: "Много съм доволен. Използвам го всеки ден и кожата ми се чувства много по-добре. Адмирации!",
  },
  {
    initials: "ЕГ",
    name: "Елена Георгиева",
    text: "Харесва ми, че е лек, приятен и удобен за ежедневна употреба. Бих поръчала отново. Препоръчвам го на всеки!",
  },
];

export type MenuItem = {
  name: string;
  note?: string;
  price: number;
  sizePrice?: string; // for 8inch / 11inch pizzas
  veg?: boolean;
  spicy?: boolean;
  pick?: boolean;
  famous?: boolean;
};

export type MenuCategory = {
  id: string;
  label: string;
  hindi: string;
  image: string;
  imageLabel: string;
  blurb: string;
  items: MenuItem[];
};

export const MENU: MenuCategory[] = [
  {
    id: "mocktails",
    label: "Mocktails",
    hindi: "ठंडा ठंडा",
    image: "/images/margarita.jpg",
    imageLabel: "refreshing coolers & mocktails",
    blurb: "Handcrafted, ice-cold mocktails served with fresh garnishes. From the popular Blue Lagoon to Romantic Sunrise.",
    items: [
      { name: "Mojito", note: "mint, lime & soda fizz", price: 148, veg: true, pick: true },
      { name: "Blue Lagoon", note: "curacao citrus splash", price: 160, veg: true, famous: true, pick: true },
      { name: "Water Melon", note: "fresh summer cooler", price: 171, veg: true },
      { name: "Green Apple", note: "crisp green apple zest", price: 171, veg: true },
      { name: "Cranberry", note: "sweet-tart ruby delight", price: 171, veg: true },
      { name: "Romantic Sunrise", note: "layered sunrise gradient", price: 194, veg: true, famous: true },
      { name: "Sparkling Grenadine", note: "pomegranate berry sparkle", price: 183, veg: true },
      { name: "Ice Tea", note: "chilled lemon infused tea", price: 137, veg: true },
    ],
  },
  {
    id: "twisty-fries",
    label: "Twisters & Fries",
    hindi: "चटखारा",
    image: "/images/twister.jpg",
    imageLabel: "spiral potato twisters & fries",
    blurb: "Our signature crispy spirals & golden fries dusted in secret seasonings and molten cheese.",
    items: [
      { name: "Peri Peri Twisty", note: "the iconic spiral potato", price: 160, veg: true, famous: true, pick: true },
      { name: "Peri Peri with Cheese", note: "spiral with cheese drizzle", price: 183, veg: true, pick: true },
      { name: "Peri Peri with Melted Cheese", note: "molten cheese blanket", price: 194, veg: true, famous: true },
      { name: "Tandoori Twisty", note: "smoky tandoori seasoning", price: 171, veg: true, spicy: true },
      { name: "Pudina Tadka Twisty", note: "minty zesty crunch", price: 183, veg: true },
      { name: "Cheese Fries", note: "loaded cheddar drizzle", price: 171, veg: true, pick: true },
      { name: "Peri Peri Fries", note: "double tossed in peri-peri", price: 171, veg: true, spicy: true },
      { name: "Tandoori Fries", note: "spicy tandoori dusting", price: 171, veg: true, spicy: true },
      { name: "Potato Cheese Balls", note: "gooey molten cheese center", price: 194, veg: true, famous: true },
      { name: "Chilli Garlic Pops", note: "bite-sized fiery pops", price: 183, veg: true, spicy: true },
      { name: "Tandoori Nuggets", note: "crispy herb crust", price: 137, veg: true },
      { name: "Salty Fries", note: "crisp classic salted", price: 148, veg: true },
      { name: "Mayo Fries", note: "creamy mayo drizzle", price: 160, veg: true },
    ],
  },
  {
    id: "pizza-pasta",
    label: "Pizzas & Pastas",
    hindi: "गर्म-गरम",
    image: "/images/pasta.jpg",
    imageLabel: "fresh blistered pizza & pasta",
    blurb: "Hand-stretched pizzas with rich mozzarella and freshly boiled pastas tossed in authentic gourmet sauces.",
    items: [
      { name: "Hidden Café Special Pizza", note: "chef's signature secret toppings", price: 321, sizePrice: "8″ ₹321 • 11″ ₹482", veg: true, famous: true, pick: true },
      { name: "Paneer Tikka Pizza", note: "smoky tikka chunks, onion, capsicum", price: 263, sizePrice: "8″ ₹263 • 11″ ₹436", veg: true, spicy: true, pick: true },
      { name: "Peri Peri Paneer Pizza", note: "spicy paneer & peri peri glaze", price: 286, sizePrice: "8″ ₹286 • 11″ ₹447", veg: true, spicy: true },
      { name: "Classic Margherita Pizza", note: "pure mozzarella & basil", price: 194, sizePrice: "8″ ₹194 • 11″ ₹367", veg: true },
      { name: "Cheesy Corn Pizza", note: "sweet corn & double cheese", price: 217, sizePrice: "8″ ₹217 • 11″ ₹390", veg: true },
      { name: "Veggie Delight Pizza", note: "bell peppers, olives, onion", price: 240, sizePrice: "8″ ₹240 • 11″ ₹413", veg: true },
      { name: "Mac & Cheese Pizza", note: "creamy macaroni on crust", price: 252, sizePrice: "8″ ₹252 • 11″ ₹424", veg: true },
      { name: "Pink Sauce Pasta", note: "creamy tomato-herb velvet", price: 321, veg: true, famous: true, pick: true },
      { name: "Alfredo Pasta", note: "rich white cream & butter", price: 298, veg: true, pick: true },
      { name: "Arabiata Pasta", note: "spicy garlic tomato sauce", price: 298, veg: true, spicy: true },
      { name: "Italian Pasta", note: "herbed bell peppers & olives", price: 309, veg: true },
      { name: "White Sauce Pasta", note: "mild herbed alfredo", price: 275, veg: true },
      { name: "Mac n Cheese", note: "cheesy comfort classic", price: 240, veg: true },
    ],
  },
  {
    id: "burgers-sandwiches",
    label: "Burgers & Sandwiches",
    hindi: "बर्गर और सैंडविच",
    image: "/images/platter.jpg",
    imageLabel: "grilled gourmet burgers & sandwiches",
    blurb: "Triple-decker sandwiches and towering grilled burgers loaded with fresh patties, cheese, and crunchy veggies.",
    items: [
      { name: "Maharaja Burger", note: "huge double patty with cheese", price: 229, veg: true, famous: true, pick: true },
      { name: "Smoky Tandoori Paneer Burger", note: "marinated paneer steak", price: 217, veg: true, spicy: true },
      { name: "Cheesy Grilled Veg Burger", note: "toasted bun with melted cheese", price: 183, veg: true, pick: true },
      { name: "Classic Veg Burger", note: "crisp vegetable patty & mayo", price: 137, veg: true },
      { name: "Peri Peri Spiced Burger", note: "fiery peri peri glaze", price: 171, veg: true, spicy: true },
      { name: "Paneer Tikka Sandwich", note: "char-grilled paneer & mint mayo", price: 229, veg: true, famous: true, pick: true },
      { name: "Spicy Veggie with Cheese Sandwich", note: "sliced veggies & melted cheese", price: 206, veg: true, spicy: true },
      { name: "Bombay Sandwich with Cheese", note: "street style spiced potato & cheese", price: 194, veg: true, pick: true },
      { name: "Tawa Paneer Sandwich", note: "deshi spiced paneer filling", price: 217, veg: true },
      { name: "Veg Club Sandwich", note: "triple-layered club feast", price: 252, veg: true },
      { name: "Sweet Corn Sandwich", note: "sweet corn & creamy spread", price: 183, veg: true },
      { name: "Veg Sandwich", note: "fresh vegetables & green chutney", price: 125, veg: true },
    ],
  },
  {
    id: "chinese-appetizers",
    label: "Chinese & Platters",
    hindi: "चाइनीज स्पेशल",
    image: "/images/twister.jpg",
    imageLabel: "sizzling chinese appetizers",
    blurb: "Wok-tossed starters, spicy paneer delights, noodles, and grand sharing platters.",
    items: [
      { name: "Paneer Lovers Platter", note: "paneer chilly + coriander + dragon + schezwan", price: 1034, veg: true, famous: true, pick: true },
      { name: "Chinese Combo Platter", note: "manchurian + spring roll + fried rice + paneer chilly", price: 804, veg: true, famous: true, pick: true },
      { name: "Paneer Sizzler Platter", note: "steaming sizzler with sauce", price: 332, veg: true, famous: true },
      { name: "Dragon-Style Paneer", note: "fiery sweet & spicy glaze", price: 298, veg: true, spicy: true, pick: true },
      { name: "Hot Pan Paneer", note: "sizzling paneer cubes", price: 332, veg: true, spicy: true },
      { name: "Garlic Pan Paneer", note: "roasted garlic toss", price: 344, veg: true },
      { name: "Tangy Paneer 65", note: "hyderabadi style tangy spices", price: 286, veg: true, spicy: true },
      { name: "Crispy Veg Manchurian", note: "crispy veg balls in dry sauce", price: 263, veg: true, pick: true },
      { name: "Cheesy Veg Lollipops", note: "crispy lollipops with cheese", price: 298, veg: true, famous: true },
      { name: "Crispy Spring Rolls", note: "stuffed with shredded vegetables", price: 275, veg: true },
      { name: "Street-Style Hakka Noodles", note: "classic wok tossed noodles", price: 194, veg: true, pick: true },
      { name: "Triple Schezwan Mix", note: "noodles + rice + schezwan gravy", price: 275, veg: true, spicy: true },
      { name: "Spicy Schezwan Rice", note: "aromatic rice in fiery chili oil", price: 229, veg: true, spicy: true },
      { name: "Golden Fried Rice", note: "garlic herbed fried rice", price: 194, veg: true },
    ],
  },
  {
    id: "maggie-momos-wraps",
    label: "Momos, Maggie & Wraps",
    hindi: "मोमोज़ और मैगी",
    image: "/images/coffee.jpg",
    imageLabel: "steaming momos & comfort maggie",
    blurb: "College favorites and late-night cravings: steaming momos, loaded cheese Maggie, and stuffed wraps.",
    items: [
      { name: "Tandoori Momos", note: "charred in tandoori masala", price: 206, veg: true, famous: true, pick: true },
      { name: "Chilly Momos", note: "tossed in spicy schezwan gravy", price: 275, veg: true, spicy: true },
      { name: "Veg Fried Momos", note: "golden crispy dumplings", price: 160, veg: true, pick: true },
      { name: "Veg Steam Momos", note: "soft steamed dumplings", price: 137, veg: true },
      { name: "Schezwan Cheese Maggie", note: "spicy kick with melted cheese", price: 171, veg: true, famous: true, pick: true },
      { name: "Tandoori Maggie", note: "smoky tandoor flavor", price: 160, veg: true, spicy: true },
      { name: "Plain Cheese Maggie", note: "classic maggie with cheese", price: 114, veg: true },
      { name: "Paneer Shorma Wrap", note: "middle eastern herbed paneer", price: 217, veg: true, famous: true },
      { name: "Chilli Cheese Wrap", note: "molten cheese and green chillies", price: 206, veg: true, spicy: true },
      { name: "Paneer Schezwan Roll", note: "spiced paneer rolled in paratha", price: 183, veg: true },
      { name: "Bombay Masala Wrap", note: "potato masala & mint chutney", price: 194, veg: true },
    ],
  },
  {
    id: "coffee-shakes",
    label: "Cold Coffee & Shakes",
    hindi: "कॉफ़ी और शेक्स",
    image: "/images/coffee.jpg",
    imageLabel: "thick cold coffee & milkshakes",
    blurb: "Jalgaon's favourite cold coffee, thick gourmet shakes, and decadent Ferrero creations.",
    items: [
      { name: "Classic Cold Coffee", note: "the iconic cold coffee of Adarsh Nagar", price: 137, veg: true, famous: true, pick: true },
      { name: "Thick Cold Coffee with Ice Cream", note: "vanilla scoop on thick cold coffee", price: 229, veg: true, famous: true, pick: true },
      { name: "Thick Kit Kat Chocolate Coffee", note: "crushed kit kat wafer blend", price: 206, veg: true, famous: true },
      { name: "Caramel Cold Coffee", note: "rich buttery caramel swirl", price: 194, veg: true },
      { name: "Thick Choco Coffee", note: "double chocolate mocha", price: 229, veg: true },
      { name: "Triple Chocolate Volcano Shake", note: "ferraro series chocolate blast", price: 367, veg: true, famous: true, pick: true },
      { name: "Kit Kat Masti Shake", note: "topped with wafer fingers", price: 344, veg: true },
      { name: "Sneaker Burst Shake", note: "caramel peanut nougat shake", price: 344, veg: true },
      { name: "Oreo Blast Shake", note: "thick crushed oreo shake", price: 321, veg: true, pick: true },
      { name: "Belgium Chocolate Shake", note: "gourmet dark belgium cocoa", price: 217, veg: true, pick: true },
      { name: "Rajwadi Shake", note: "royal saffron dry fruit shake", price: 229, veg: true },
      { name: "Keshar Pista Shake", note: "rich saffron pistachio blend", price: 217, veg: true },
    ],
  },
  {
    id: "desserts-hot",
    label: "Brownies & Hot Drinks",
    hindi: "ब्राउनी और हॉट कॉफ़ी",
    image: "/images/coffee.jpg",
    imageLabel: "sizzling brownie & warm drinks",
    blurb: "Hot espresso, chocolate sandwiches, and sizzling walnut brownies with cold ice cream.",
    items: [
      { name: "Sizzling Brownie with Ice Cream", note: "hot chocolate sauce over vanilla scoop", price: 252, veg: true, famous: true, pick: true },
      { name: "Sizzling Boat", note: "grand sizzling dessert boat", price: 401, veg: true, famous: true },
      { name: "Triple Truppel", note: "three-tier chocolate dessert", price: 298, veg: true },
      { name: "Choco Brownie", note: "warm fudge brownie", price: 171, veg: true },
      { name: "Chocolate Cheese Sandwich", note: "molten chocolate & melted cheese", price: 160, veg: true, famous: true },
      { name: "Chocolate Oreo Sandwich", note: "crispy oreos inside toasted bread", price: 183, veg: true },
      { name: "Hot Coffee", note: "freshly brewed hot cappuccino", price: 79, veg: true, pick: true },
      { name: "Hot Chocolate", note: "rich melted cocoa milk", price: 171, veg: true },
      { name: "Ginger Tea", note: "fresh adrak chai", price: 68, veg: true },
      { name: "Regular Tea", note: "comfort masala tea", price: 56, veg: true },
      { name: "Black Coffee", note: "strong double espresso shot", price: 56, veg: true },
    ],
  },
];

export type Package = {
  id: string;
  name: string;
  price: number;
  tag?: string;
  desc: string;
  includes: string[];
};

export const PACKAGES: Package[] = [
  {
    id: "bloom",
    name: "Balloon Bloom",
    price: 1499,
    desc: "The sweet-and-simple setup for intimate birthdays and surprise entries.",
    includes: [
      "60 balloon cluster in your colours",
      "Neon 'Happy Birthday' sign",
      "Name letter foils",
      "Table runner & cake setting",
      "2-hour décor, done before you arrive",
    ],
  },
  {
    id: "glow",
    name: "The Glow-Up",
    price: 2999,
    tag: "most booked",
    desc: "Our signature corner — the setup you have definitely seen on Jalgaon's stories.",
    includes: [
      "Everything in Balloon Bloom",
      "Fairy-light canopy backdrop",
      "Themed photo corner",
      "Floral accents & candle table",
      "Custom neon name sign",
      "20 polaroids of the birthday star",
    ],
  },
  {
    id: "takeover",
    name: "Full Hidden Takeover",
    price: 5999,
    desc: "Book the café corner (or the whole café) and make the evening yours.",
    includes: [
      "Everything in The Glow-Up",
      "Reserved private section",
      "Entrance & pathway décor",
      "Cake + snacks add-on menu",
      "Dedicated host for the evening",
      "Music playlist of your choice",
    ],
  },
];

export const ADDONS = [
  "Ring balloons",
  "Number foils",
  "LED light curtain",
  "Theme backdrops",
  "Confetti poppers",
  "Custom neon name",
  "Photo props",
  "Cake toppers",
];

export type Review = {
  quote: string;
  name: string;
  stars: number;
  detail: string;
};

export const REVIEWS: Review[] = [
  {
    quote:
      "Ambience and food was really good. For my birthday, the owner arranged a sitting right in front of the happy-birthday sign with balloons. Great hospitality.",
    name: "Muskan R.",
    stars: 5,
    detail: "birthday glow-up",
  },
  {
    quote:
      "Best place for youngsters & couples to chill and hang out in town. White pasta, pizzas and cold coffee were nice — and the service was super quick.",
    name: "Manoj P.",
    stars: 4,
    detail: "regular since day one",
  },
  {
    quote:
      "They have a real sense for decorating food. Good ambience, good music — a nice place for parties and for couples.",
    name: "Google reviewer",
    stars: 5,
    detail: "date-night verdict",
  },
  {
    quote: "Decent ambience, quick service, and proper birthday décor options. Worth the visit with friends.",
    name: "Google reviewer",
    stars: 4,
    detail: "squad lunch",
  },
  {
    quote: "Superb food, awesome taste, very good staff. One of the best cafés in the city — must visit.",
    name: "Google reviewer",
    stars: 5,
    detail: "first-timer",
  },
  {
    quote: "The veg platter and paneer platter are awesome. Best hangout place in Jalgaon city, hands down.",
    name: "Google reviewer",
    stars: 5,
    detail: "platter believer",
  },
  {
    quote: "Coffee was good, ambience is quite good. Perfect for every age group… worth visiting!",
    name: "Google reviewer",
    stars: 5,
    detail: "coffee o'clock",
  },
];

export const TICKER_ITEMS = [
  "Cold Coffee",
  "Twisty Potato",
  "Pink Sauce Pasta",
  "Blue Lagoon",
  "Maharaja Burger",
  "Neon Birthdays",
  "Pizza & Tacos",
  "Sizzling Brownie",
  "Paneer Platter",
  "Couple Party",
  "Open 10–10",
];

export type GalleryItem = {
  src: string;
  fallback?: string;
  caption: string;
  span?: string;
};

export const GALLERY: GalleryItem[] = [
  {
    src: "/images/birthday-setup.jpg",
    caption: "the glow wall, mid-magic",
    span: "md:col-span-2 md:row-span-2",
  },
  { src: "/images/twister.jpg", caption: "twister o'clock", span: "" },
  { src: "/images/coffee.jpg", caption: "fuel for two", span: "" },
  { src: "/images/baby-shower.jpg", caption: "baby shower dreams", span: "md:col-span-2" },
  { src: "/images/pasta.jpg", caption: "pasta", span: "" },
  { src: "/images/together-forever.jpg", caption: "together forever", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/margarita.jpg", caption: "blue hour, blue margarita", span: "" },
  { src: "/images/interior.jpg", caption: "a corner of calm", span: "md:col-span-2" },
  { src: "/images/pizza.jpg", caption: "sunday pizza ritual", span: "" },
];

export const HOURS = [
  { day: "Monday", time: "10:00 AM – 10:00 PM" },
  { day: "Tuesday", time: "10:00 AM – 10:00 PM" },
  { day: "Wednesday", time: "10:00 AM – 10:00 PM" },
  { day: "Thursday", time: "10:00 AM – 10:00 PM" },
  { day: "Friday", time: "10:00 AM – 10:00 PM" },
  { day: "Saturday", time: "10:00 AM – 10:00 PM" },
  { day: "Sunday", time: "10:00 AM – 10:00 PM" },
];

export const ADDRESS = "Plot no-9, Hidden Café near Kotak Mahindra Bank, Adarsh Nagar, RTO road Jalgaon (M.S)";
export const PHONE_DISPLAY = "+91 86058 75107";
export const PHONE_TEL = "+918605875107";
export const WHATSAPP = "918605875107";
export const MAPS_QUERY =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Hidden Café And Restro, Adarsh Nagar Rd, Jalgaon, Maharashtra 425002");
export const MAP_EMBED =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Hidden Café And Restro, Adarsh Nagar Rd, Jalgaon, Maharashtra") +
  "&output=embed";

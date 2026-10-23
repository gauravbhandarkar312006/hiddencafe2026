-- ====================================================================
-- Migration: 20261023000002_create_menu_items.sql
-- Description: Create menu_items table with category indexes & seed 100% faithful menu items
-- Reversible: DROP TABLE IF EXISTS public.menu_items CASCADE;
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    note TEXT,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    size_price TEXT,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_spicy BOOLEAN NOT NULL DEFAULT false,
    is_famous BOOLEAN NOT NULL DEFAULT false,
    is_pick BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_menu_name_len CHECK (char_length(trim(name)) >= 1 AND char_length(name) <= 150),
    CONSTRAINT chk_menu_category_len CHECK (char_length(trim(category)) >= 1 AND char_length(category) <= 80),
    CONSTRAINT chk_menu_price_positive CHECK (price >= 0),
    CONSTRAINT chk_menu_size_price_len CHECK (size_price IS NULL OR char_length(size_price) <= 120),
    CONSTRAINT chk_menu_note_len CHECK (note IS NULL OR char_length(note) <= 300),
    CONSTRAINT uq_menu_item_name_category UNIQUE (name, category)
);

-- Query and sorting indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items (is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON public.menu_items (category, sort_order);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.menu_items IS 'Real café menu items with price, availability and category';

-- Seed existing menu items safely if table is empty (never overwrites existing data)
INSERT INTO public.menu_items (name, note, category, price, size_price, is_veg, is_spicy, is_famous, is_pick, sort_order)
SELECT * FROM (VALUES
  -- 1. Mocktails
  ('Mojito', 'mint, lime & soda fizz', 'mocktails', 148.00, NULL, true, false, false, true, 1),
  ('Blue Lagoon', 'curacao citrus splash', 'mocktails', 160.00, NULL, true, false, true, true, 2),
  ('Water Melon', 'fresh summer cooler', 'mocktails', 171.00, NULL, true, false, false, false, 3),
  ('Green Apple', 'crisp green apple zest', 'mocktails', 171.00, NULL, true, false, false, false, 4),
  ('Cranberry', 'sweet-tart ruby delight', 'mocktails', 171.00, NULL, true, false, false, false, 5),
  ('Romantic Sunrise', 'layered sunrise gradient', 'mocktails', 194.00, NULL, true, false, true, false, 6),
  ('Sparkling Grenadine', 'pomegranate berry sparkle', 'mocktails', 183.00, NULL, true, false, false, false, 7),
  ('Ice Tea', 'chilled lemon infused tea', 'mocktails', 137.00, NULL, true, false, false, false, 8),

  -- 2. Twisters & Fries
  ('Peri Peri Twisty', 'the iconic spiral potato', 'twisty-fries', 160.00, NULL, true, false, true, true, 1),
  ('Peri Peri with Cheese', 'spiral with cheese drizzle', 'twisty-fries', 183.00, NULL, true, false, false, true, 2),
  ('Peri Peri with Melted Cheese', 'molten cheese blanket', 'twisty-fries', 194.00, NULL, true, false, true, false, 3),
  ('Tandoori Twisty', 'smoky tandoori seasoning', 'twisty-fries', 171.00, NULL, true, true, false, false, 4),
  ('Pudina Tadka Twisty', 'minty zesty crunch', 'twisty-fries', 183.00, NULL, true, false, false, false, 5),
  ('Cheese Fries', 'loaded cheddar drizzle', 'twisty-fries', 171.00, NULL, true, false, false, true, 6),
  ('Peri Peri Fries', 'double tossed in peri-peri', 'twisty-fries', 171.00, NULL, true, true, false, false, 7),
  ('Tandoori Fries', 'spicy tandoori dusting', 'twisty-fries', 171.00, NULL, true, true, false, false, 8),
  ('Potato Cheese Balls', 'gooey molten cheese center', 'twisty-fries', 194.00, NULL, true, false, true, false, 9),
  ('Chilli Garlic Pops', 'bite-sized fiery pops', 'twisty-fries', 183.00, NULL, true, true, false, false, 10),
  ('Tandoori Nuggets', 'crispy herb crust', 'twisty-fries', 137.00, NULL, true, false, false, false, 11),
  ('Salty Fries', 'crisp classic salted', 'twisty-fries', 148.00, NULL, true, false, false, false, 12),
  ('Mayo Fries', 'creamy mayo drizzle', 'twisty-fries', 160.00, NULL, true, false, false, false, 13),

  -- 3. Pizzas & Pastas
  ('Hidden Café Special Pizza', 'chef''s signature secret toppings', 'pizza-pasta', 321.00, '8″ ₹321 • 11″ ₹482', true, false, true, true, 1),
  ('Paneer Tikka Pizza', 'smoky tikka chunks, onion, capsicum', 'pizza-pasta', 263.00, '8″ ₹263 • 11″ ₹436', true, true, false, true, 2),
  ('Peri Peri Paneer Pizza', 'spicy paneer & peri peri glaze', 'pizza-pasta', 286.00, '8″ ₹286 • 11″ ₹447', true, true, false, false, 3),
  ('Classic Margherita Pizza', 'pure mozzarella & basil', 'pizza-pasta', 194.00, '8″ ₹194 • 11″ ₹367', true, false, false, false, 4),
  ('Cheesy Corn Pizza', 'sweet corn & double cheese', 'pizza-pasta', 217.00, '8″ ₹217 • 11″ ₹390', true, false, false, false, 5),
  ('Veggie Delight Pizza', 'bell peppers, olives, onion', 'pizza-pasta', 240.00, '8″ ₹240 • 11″ ₹413', true, false, false, false, 6),
  ('Mac & Cheese Pizza', 'creamy macaroni on crust', 'pizza-pasta', 252.00, '8″ ₹252 • 11″ ₹424', true, false, false, false, 7),
  ('Pink Sauce Pasta', 'creamy tomato-herb velvet', 'pizza-pasta', 321.00, NULL, true, false, true, true, 8),
  ('Alfredo Pasta', 'rich white cream & butter', 'pizza-pasta', 298.00, NULL, true, false, false, true, 9),
  ('Arabiata Pasta', 'spicy garlic tomato sauce', 'pizza-pasta', 298.00, NULL, true, true, false, false, 10),
  ('Italian Pasta', 'herbed bell peppers & olives', 'pizza-pasta', 309.00, NULL, true, false, false, false, 11),
  ('White Sauce Pasta', 'mild herbed alfredo', 'pizza-pasta', 275.00, NULL, true, false, false, false, 12),
  ('Mac n Cheese', 'cheesy comfort classic', 'pizza-pasta', 240.00, NULL, true, false, false, false, 13),

  -- 4. Burgers & Sandwiches
  ('Maharaja Burger', 'huge double patty with cheese', 'burgers-sandwiches', 229.00, NULL, true, false, true, true, 1),
  ('Smoky Tandoori Paneer Burger', 'marinated paneer steak', 'burgers-sandwiches', 217.00, NULL, true, true, false, false, 2),
  ('Cheesy Grilled Veg Burger', 'toasted bun with melted cheese', 'burgers-sandwiches', 183.00, NULL, true, false, false, true, 3),
  ('Classic Veg Burger', 'crisp vegetable patty & mayo', 'burgers-sandwiches', 137.00, NULL, true, false, false, false, 4),
  ('Peri Peri Spiced Burger', 'fiery peri peri glaze', 'burgers-sandwiches', 171.00, NULL, true, true, false, false, 5),
  ('Paneer Tikka Sandwich', 'char-grilled paneer & mint mayo', 'burgers-sandwiches', 229.00, NULL, true, false, true, true, 6),
  ('Spicy Veggie with Cheese Sandwich', 'sliced veggies & melted cheese', 'burgers-sandwiches', 206.00, NULL, true, true, false, false, 7),
  ('Bombay Sandwich with Cheese', 'street style spiced potato & cheese', 'burgers-sandwiches', 194.00, NULL, true, false, false, true, 8),
  ('Tawa Paneer Sandwich', 'deshi spiced paneer filling', 'burgers-sandwiches', 217.00, NULL, true, false, false, false, 9),
  ('Veg Club Sandwich', 'triple-layered club feast', 'burgers-sandwiches', 252.00, NULL, true, false, false, false, 10),
  ('Sweet Corn Sandwich', 'sweet corn & creamy spread', 'burgers-sandwiches', 183.00, NULL, true, false, false, false, 11),
  ('Veg Sandwich', 'fresh vegetables & green chutney', 'burgers-sandwiches', 125.00, NULL, true, false, false, false, 12),

  -- 5. Chinese & Platters
  ('Paneer Lovers Platter', 'paneer chilly + coriander + dragon + schezwan', 'chinese-appetizers', 1034.00, NULL, true, false, true, true, 1),
  ('Chinese Combo Platter', 'manchurian + spring roll + fried rice + paneer chilly', 'chinese-appetizers', 804.00, NULL, true, false, true, true, 2),
  ('Paneer Sizzler Platter', 'steaming sizzler with sauce', 'chinese-appetizers', 332.00, NULL, true, false, true, false, 3),
  ('Dragon-Style Paneer', 'fiery sweet & spicy glaze', 'chinese-appetizers', 298.00, NULL, true, true, false, true, 4),
  ('Hot Pan Paneer', 'sizzling paneer cubes', 'chinese-appetizers', 332.00, NULL, true, true, false, false, 5),
  ('Garlic Pan Paneer', 'roasted garlic toss', 'chinese-appetizers', 344.00, NULL, true, false, false, false, 6),
  ('Tangy Paneer 65', 'hyderabadi style tangy spices', 'chinese-appetizers', 286.00, NULL, true, true, false, false, 7),
  ('Crispy Veg Manchurian', 'crispy veg balls in dry sauce', 'chinese-appetizers', 263.00, NULL, true, false, false, true, 8),
  ('Cheesy Veg Lollipops', 'crispy lollipops with cheese', 'chinese-appetizers', 298.00, NULL, true, false, true, false, 9),
  ('Crispy Spring Rolls', 'stuffed with shredded vegetables', 'chinese-appetizers', 275.00, NULL, true, false, false, false, 10),
  ('Street-Style Hakka Noodles', 'classic wok tossed noodles', 'chinese-appetizers', 194.00, NULL, true, false, false, true, 11),
  ('Triple Schezwan Mix', 'noodles + rice + schezwan gravy', 'chinese-appetizers', 275.00, NULL, true, true, false, false, 12),
  ('Spicy Schezwan Rice', 'aromatic rice in fiery chili oil', 'chinese-appetizers', 229.00, NULL, true, true, false, false, 13),
  ('Golden Fried Rice', 'garlic herbed fried rice', 'chinese-appetizers', 194.00, NULL, true, false, false, false, 14),

  -- 6. Momos, Maggie & Wraps
  ('Tandoori Momos', 'charred in tandoori masala', 'maggie-momos-wraps', 206.00, NULL, true, false, true, true, 1),
  ('Chilly Momos', 'tossed in spicy schezwan gravy', 'maggie-momos-wraps', 275.00, NULL, true, true, false, false, 2),
  ('Veg Fried Momos', 'golden crispy dumplings', 'maggie-momos-wraps', 160.00, NULL, true, false, false, true, 3),
  ('Veg Steam Momos', 'soft steamed dumplings', 'maggie-momos-wraps', 137.00, NULL, true, false, false, false, 4),
  ('Schezwan Cheese Maggie', 'spicy kick with melted cheese', 'maggie-momos-wraps', 171.00, NULL, true, false, true, true, 5),
  ('Tandoori Maggie', 'smoky tandoor flavor', 'maggie-momos-wraps', 160.00, NULL, true, true, false, false, 6),
  ('Plain Cheese Maggie', 'classic maggie with cheese', 'maggie-momos-wraps', 114.00, NULL, true, false, false, false, 7),
  ('Paneer Shorma Wrap', 'middle eastern herbed paneer', 'maggie-momos-wraps', 217.00, NULL, true, false, true, false, 8),
  ('Chilli Cheese Wrap', 'molten cheese and green chillies', 'maggie-momos-wraps', 206.00, NULL, true, true, false, false, 9),
  ('Paneer Schezwan Roll', 'spiced paneer rolled in paratha', 'maggie-momos-wraps', 183.00, NULL, true, false, false, false, 10),
  ('Bombay Masala Wrap', 'potato masala & mint chutney', 'maggie-momos-wraps', 194.00, NULL, true, false, false, false, 11),

  -- 7. Cold Coffee & Shakes (Matching coffee-shakes category in src/data.ts)
  ('Classic Cold Coffee', 'the iconic cold coffee of Adarsh Nagar', 'coffee-shakes', 137.00, NULL, true, false, true, true, 1),
  ('Thick Cold Coffee with Ice Cream', 'vanilla scoop on thick cold coffee', 'coffee-shakes', 229.00, NULL, true, false, true, true, 2),
  ('Thick Kit Kat Chocolate Coffee', 'crushed kit kat wafer blend', 'coffee-shakes', 206.00, NULL, true, false, true, false, 3),
  ('Caramel Cold Coffee', 'rich buttery caramel swirl', 'coffee-shakes', 194.00, NULL, true, false, false, false, 4),
  ('Thick Choco Coffee', 'double chocolate mocha', 'coffee-shakes', 229.00, NULL, true, false, false, false, 5),
  ('Triple Chocolate Volcano Shake', 'ferraro series chocolate blast', 'coffee-shakes', 367.00, NULL, true, false, true, true, 6),
  ('Kit Kat Masti Shake', 'topped with wafer fingers', 'coffee-shakes', 344.00, NULL, true, false, false, false, 7),
  ('Sneaker Burst Shake', 'caramel peanut nougat shake', 'coffee-shakes', 344.00, NULL, true, false, false, false, 8),
  ('Oreo Blast Shake', 'thick crushed oreo shake', 'coffee-shakes', 321.00, NULL, true, false, false, true, 9),
  ('Belgium Chocolate Shake', 'gourmet dark belgium cocoa', 'coffee-shakes', 217.00, NULL, true, false, false, true, 10),
  ('Rajwadi Shake', 'royal saffron dry fruit shake', 'coffee-shakes', 229.00, NULL, true, false, false, false, 11),
  ('Keshar Pista Shake', 'rich saffron pistachio blend', 'coffee-shakes', 217.00, NULL, true, false, false, false, 12),

  -- 8. Brownies & Hot Drinks (Matching desserts-hot category in src/data.ts)
  ('Sizzling Brownie with Ice Cream', 'hot chocolate sauce over vanilla scoop', 'desserts-hot', 252.00, NULL, true, false, true, true, 1),
  ('Sizzling Boat', 'grand sizzling dessert boat', 'desserts-hot', 401.00, NULL, true, false, true, false, 2),
  ('Triple Truppel', 'three-tier chocolate dessert', 'desserts-hot', 298.00, NULL, true, false, false, false, 3),
  ('Choco Brownie', 'warm fudge brownie', 'desserts-hot', 171.00, NULL, true, false, false, false, 4),
  ('Chocolate Cheese Sandwich', 'molten chocolate & melted cheese', 'desserts-hot', 160.00, NULL, true, false, true, false, 5),
  ('Chocolate Oreo Sandwich', 'crispy oreos inside toasted bread', 'desserts-hot', 183.00, NULL, true, false, false, false, 6),
  ('Hot Coffee', 'freshly brewed hot cappuccino', 'desserts-hot', 79.00, NULL, true, false, false, true, 7),
  ('Hot Chocolate', 'rich melted cocoa milk', 'desserts-hot', 171.00, NULL, true, false, false, false, 8),
  ('Ginger Tea', 'fresh adrak chai', 'desserts-hot', 68.00, NULL, true, false, false, false, 9),
  ('Regular Tea', 'comfort masala tea', 'desserts-hot', 56.00, NULL, true, false, false, false, 10),
  ('Black Coffee', 'strong double espresso shot', 'desserts-hot', 56.00, NULL, true, false, false, false, 11)
) AS v(name, note, category, price, size_price, is_veg, is_spicy, is_famous, is_pick, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items LIMIT 1)
ON CONFLICT (name, category) DO NOTHING;

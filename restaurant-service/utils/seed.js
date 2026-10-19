const restaurantRepository = require('../repositories/restaurant.repository');
const menuRepository = require('../repositories/menu.repository');
const fs = require('fs');
const path = require('path');

const getDemoOwnerId = () => {
  try {
    const authUsersPath = path.join(__dirname, '../../auth-service/data/users.json');
    if (fs.existsSync(authUsersPath)) {
      const users = JSON.parse(fs.readFileSync(authUsersPath, 'utf-8'));
      const owner = users.find((u) => u.email === 'owner@biteflow.com');
      if (owner) return owner._id || owner.id;
    }
  } catch {}
  return 'owner_demo_default_id';
};

const seedRestaurants = async () => {
  try {
    const count = await restaurantRepository.count();
    if (count > 0) {
      console.log(`[restaurant-service] Restaurants already exist (${count}). Skipping seed.`);
      return;
    }

    console.log('[restaurant-service] Seeding initial restaurants and menus...');
    const ownerId = getDemoOwnerId();

    const r1 = await restaurantRepository.create({
      name: 'Bella Napoli Trattoria',
      description: 'Authentic wood-fired Neapolitan pizzas, handmade fresh pasta, and classic Italian hospitality.',
      address: '142 Via Roma, Culinary Quarter',
      contactNumber: '+1 (555) 234-5678',
      email: 'owner@biteflow.com',
      cuisineType: 'Italian',
      openingTime: '11:00 AM',
      closingTime: '10:30 PM',
      status: 'OPEN',
      ownerId,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      deliveryTimeEstimate: '20-30 min',
    });

    const r1Id = r1._id || r1.id;

    const r1Items = [
      {
        restaurantId: r1Id,
        name: 'Neapolitan Margherita Pizza',
        description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, extra virgin olive oil.',
        category: 'Mains',
        price: 14.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r1Id,
        name: 'Truffle Tagliatelle Pasta',
        description: 'Fresh egg pasta tossed with black summer truffles, butter emulsion, and aged Parmigiano Reggiano.',
        category: 'Mains',
        price: 18.5,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r1Id,
        name: 'Classic Bruschetta al Pomodoro',
        description: 'Toasted country sourdough topped with marinated vine tomatoes, garlic, and fresh basil.',
        category: 'Starters',
        price: 8.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r1Id,
        name: 'Tiramisu della Casa',
        description: 'Espresso-soaked savoiardi ladyfingers layered with whipped mascarpone cream and Valrhona cocoa.',
        category: 'Desserts',
        price: 7.5,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r1Id,
        name: 'San Pellegrino Sparkling Water',
        description: 'Chilled 500ml glass bottle of natural Italian sparkling mineral water.',
        category: 'Beverages',
        price: 3.5,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
      },
    ];

    for (const item of r1Items) {
      await menuRepository.create(item);
    }

    const r2 = await restaurantRepository.create({
      name: 'Flame & Grill Artisan Burgers',
      description: 'Smashed premium Angus beef, brioche buns, craft secret sauces, and loaded hand-cut fries.',
      address: '88 Broadway Ave, Downtown Food Park',
      contactNumber: '+1 (555) 876-5432',
      email: 'flamegrill@biteflow.com',
      cuisineType: 'Burgers & Fast Food',
      openingTime: '11:30 AM',
      closingTime: '11:00 PM',
      status: 'OPEN',
      ownerId: 'owner_demo_burger_id',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      deliveryTimeEstimate: '25-35 min',
    });

    const r2Id = r2._id || r2.id;

    const r2Items = [
      {
        restaurantId: r2Id,
        name: 'The Truffle Beast Double Burger',
        description: 'Two smashed Angus patties, black truffle mayo, smoked cheddar, caramelized onions on toasted brioche.',
        category: 'Mains',
        price: 15.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r2Id,
        name: 'Smokey BBQ Bacon Cheeseburger',
        description: 'Applewood smoked bacon, crispy onion tanglers, house bourbon BBQ sauce, melted Monterey Jack.',
        category: 'Mains',
        price: 13.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r2Id,
        name: 'Crispy Parmigiano Herb Fries',
        description: 'Skin-on hand-cut russet potatoes dusted with rosemary, thyme, garlic salt, and grated Parmesan.',
        category: 'Starters',
        price: 5.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r2Id,
        name: 'Salted Caramel Thick Milkshake',
        description: 'Hand-spun Madagascar vanilla gelato with sea salt caramel ripple and whipped cream.',
        category: 'Beverages',
        price: 6.5,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
      },
    ];

    for (const item of r2Items) {
      await menuRepository.create(item);
    }

    const r3 = await restaurantRepository.create({
      name: 'Sakura Zen Japanese Cuisine',
      description: 'Masterfully prepared sushi nigiri, specialty maki rolls, rich tonkotsu ramen, and Japanese desserts.',
      address: '25 Sakura Way, Garden District',
      contactNumber: '+1 (555) 432-1098',
      email: 'sakurazen@biteflow.com',
      cuisineType: 'Asian & Sushi',
      openingTime: '12:00 PM',
      closingTime: '10:00 PM',
      status: 'OPEN',
      ownerId: 'owner_demo_asian_id',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      deliveryTimeEstimate: '30-45 min',
    });

    const r3Id = r3._id || r3.id;

    const r3Items = [
      {
        restaurantId: r3Id,
        name: 'Salmon Dragon Roll (8 pcs)',
        description: 'Tempura shrimp and cucumber inside, draped with fresh Norwegian salmon, avocado, unagi glaze.',
        category: 'Mains',
        price: 16.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r3Id,
        name: 'Tonkotsu Chashu Ramen',
        description: '16-hour simmered pork broth, springy ramen noodles, braised pork belly, ajitsuke tamago egg, nori.',
        category: 'Mains',
        price: 15.5,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r3Id,
        name: 'Crispy Chicken Gyoza (6 pcs)',
        description: 'Pan-seared Japanese dumplings filled with ground chicken, cabbage, scallions, with ponzu dipping sauce.',
        category: 'Starters',
        price: 7.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
      },
      {
        restaurantId: r3Id,
        name: 'Matcha Green Tea Cheesecake',
        description: 'Velvety Japanese Uji matcha cheesecake on a black sesame biscuit crust.',
        category: 'Desserts',
        price: 6.99,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
      },
    ];

    for (const item of r3Items) {
      await menuRepository.create(item);
    }

    console.log('[restaurant-service] Demo restaurants and menus seeded successfully!');
  } catch (error) {
    console.error('[restaurant-service] Seeding error:', error.message);
  }
};

module.exports = { seedRestaurants };

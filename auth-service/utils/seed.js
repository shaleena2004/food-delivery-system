const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('./password.utils');

const seedUsers = async () => {
  try {
    const count = await userRepository.count();
    if (count > 0) {
      console.log(`[auth-service] Users already exist (${count}). Skipping seed.`);
      return;
    }

    console.log('[auth-service] Seeding initial demo users...');

    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@biteflow.com',
        password: await hashPassword('Admin123!'),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      {
        name: 'Sarah Customer',
        email: 'customer@biteflow.com',
        password: await hashPassword('Customer123!'),
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
      {
        name: 'Marco Rossi',
        email: 'owner@biteflow.com',
        password: await hashPassword('Owner123!'),
        role: 'RESTAURANT_ADMIN',
        status: 'ACTIVE',
      },
      {
        name: 'David Rider',
        email: 'delivery@biteflow.com',
        password: await hashPassword('Delivery123!'),
        role: 'DELIVERY_PERSON',
        status: 'ACTIVE',
      },
    ];

    for (const u of defaultUsers) {
      await userRepository.create(u);
    }

    console.log('[auth-service] Demo users seeded successfully!');
  } catch (error) {
    console.error('[auth-service] Seeding error:', error.message);
  }
};

module.exports = { seedUsers };

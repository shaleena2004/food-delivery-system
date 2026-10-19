const customerRepository = require('../repositories/customer.repository');

class CustomerService {
  async getProfile(userId, userContext = {}) {
    let customer = await customerRepository.findByUserId(userId);

    // If profile does not exist yet, auto-create one with Auth user details
    if (!customer) {
      const nameParts = (userContext.name || '').trim().split(' ');
      const firstName = nameParts[0] || 'Valued';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      customer = await customerRepository.create({
        userId,
        firstName,
        lastName,
        phoneNumber: '',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
      });
    }

    return customer;
  }

  async updateProfile(userId, data) {
    const updated = await customerRepository.updateByUserId(userId, {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
      profileImage: data.profileImage || undefined,
    });

    return updated;
  }
}

module.exports = new CustomerService();

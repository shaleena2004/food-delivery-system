const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { generateToken } = require('../utils/jwt.utils');

class AuthService {
  async register({ name, email, password, role }) {
    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      error.statusCode = 400;
      throw error;
    }

    if (role && role !== 'CUSTOMER') {
      const error = new Error(
        'Public registration is only available for Customers. Restaurant Admin and Rider accounts must be provisioned by System Administration.'
      );
      error.statusCode = 403;
      throw error;
    }

    const assignedRole = 'CUSTOMER';

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('User already exists with this email address');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      status: 'ACTIVE',
    });

    const userObj = createdUser.toJSON ? createdUser.toJSON() : { ...createdUser };
    delete userObj.password;

    // Automatically sync customer profile and default address into biteflow_customer
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const customerDb = mongoose.connection.useDb('biteflow_customer');
        const userIdStr = (userObj._id || userObj.id).toString();
        const parts = name.trim().split(' ');
        const firstName = parts[0] || 'Valued';
        const lastName = parts.slice(1).join(' ') || 'Customer';

        await customerDb.collection('customers').updateOne(
          { userId: userIdStr },
          {
            $setOnInsert: {
              userId: userIdStr,
              firstName,
              lastName,
              phoneNumber: '+1 (555) 019-2834',
              profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

        await customerDb.collection('addresses').updateOne(
          { customerId: userIdStr },
          {
            $setOnInsert: {
              customerId: userIdStr,
              addressName: 'Home',
              addressLines: '45 Park Avenue, Apt 7B',
              city: 'New York',
              postalCode: '10016',
              isDefault: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch (syncErr) {
      console.warn('Customer profile sync notice:', syncErr.message);
    }

    const token = generateToken({
      userId: userObj._id || userObj.id,
      email: userObj.email,
      role: userObj.role,
      name: userObj.name,
    });

    return {
      user: {
        id: userObj._id || userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        status: userObj.status,
      },
      token,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.status === 'INACTIVE') {
      const error = new Error('Account is inactive. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const userId = user._id ? user._id.toString() : user.id;

    const token = generateToken({
      userId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const userObj = user.toJSON ? user.toJSON() : { ...user };
    delete userObj.password;

    return {
      id: userObj._id || userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      status: userObj.status,
      createdAt: userObj.createdAt,
    };
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }

  async updateUserStatus(userId, status) {
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      const error = new Error("Invalid status. Must be 'ACTIVE' or 'INACTIVE'");
      error.statusCode = 400;
      throw error;
    }

    const updated = await userRepository.updateById(userId, { status });
    if (!updated) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  async createUserByAdmin({ name, email, password, role }) {
    if (!name || !email || !password || !role) {
      const error = new Error('Name, email, password, and role are required');
      error.statusCode = 400;
      throw error;
    }

    const validRoles = ['CUSTOMER', 'RESTAURANT_ADMIN', 'DELIVERY_PERSON', 'ADMIN'];
    if (!validRoles.includes(role)) {
      const error = new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('User already exists with this email address');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      status: 'ACTIVE',
    });

    const userObj = createdUser.toJSON ? createdUser.toJSON() : { ...createdUser };
    delete userObj.password;

    if (role === 'CUSTOMER') {
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          const customerDb = mongoose.connection.useDb('biteflow_customer');
          const userIdStr = (userObj._id || userObj.id).toString();
          const parts = name.trim().split(' ');
          const firstName = parts[0] || 'Valued';
          const lastName = parts.slice(1).join(' ') || 'Customer';

          await customerDb.collection('customers').updateOne(
            { userId: userIdStr },
            {
              $setOnInsert: {
                userId: userIdStr,
                firstName,
                lastName,
                phoneNumber: '+1 (555) 019-2834',
                profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );

          await customerDb.collection('addresses').updateOne(
            { customerId: userIdStr },
            {
              $setOnInsert: {
                customerId: userIdStr,
                addressName: 'Home',
                addressLines: '45 Park Avenue, Apt 7B',
                city: 'New York',
                postalCode: '10016',
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );
        }
      } catch (syncErr) {
        console.warn('Customer profile sync notice:', syncErr.message);
      }
    }

    return {
      id: userObj._id || userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      status: userObj.status,
    };
  }

  async resetPassword({ email, newPassword }) {
    if (!email || !newPassword) {
      const error = new Error('Email and new password are required');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('No account found with this email address');
      error.statusCode = 404;
      throw error;
    }

    const hashedPassword = await hashPassword(newPassword);
    const userId = user._id ? user._id.toString() : user.id;
    await userRepository.updateById(userId, { password: hashedPassword });

    return {
      message: 'Password reset successfully. You can now log in with your new password.',
    };
  }
}

module.exports = new AuthService();

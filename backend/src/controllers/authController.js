const { User, FinancialProfile, NudgeSetting } = require('../models');
const { generateToken } = require('../middleware/auth');
const { addUserToDefaultPool } = require('../utils/poolInitializer');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    // Hash password
    const password_hash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name
    });

    // Create default nudge settings
    await NudgeSetting.create({
      user_id: user.id
    });

    // Add user to default savings pool
    await addUserToDefaultPool(user.id);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        { model: FinancialProfile, as: 'financialProfile' },
        { model: NudgeSetting, as: 'nudgeSetting' }
      ]
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, expo_push_token } = req.body;

    const user = await User.findByPk(req.userId);

    if (full_name !== undefined) user.full_name = full_name;
    if (expo_push_token !== undefined) user.expo_push_token = expo_push_token;

    await user.save();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Create or update financial profile
exports.updateFinancialProfile = async (req, res, next) => {
  try {
    const { savings_barrier, motivation, spending_personality } = req.body;

    let profile = await FinancialProfile.findOne({
      where: { user_id: req.userId }
    });

    if (profile) {
      // Update existing profile
      await profile.update({
        savings_barrier,
        motivation,
        spending_personality
      });
    } else {
      // Create new profile
      profile = await FinancialProfile.create({
        user_id: req.userId,
        savings_barrier,
        motivation,
        spending_personality
      });
    }

    res.json({
      message: 'Perfil financiero actualizado exitosamente',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Reset password (simplified for testing - no email verification)
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, new_password } = req.body;

    // Validate required fields
    if (!email || !new_password) {
      return res.status(400).json({
        error: 'Email y nueva contraseña son obligatorios'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Validate password length
    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        error: 'No existe una cuenta con este email'
      });
    }

    // Hash new password
    const password_hash = await User.hashPassword(new_password);

    // Update user password
    await user.update({ password_hash });

    res.json({
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    next(error);
  }
};

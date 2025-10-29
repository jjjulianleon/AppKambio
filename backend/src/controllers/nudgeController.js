const { NudgeSetting, User } = require('../models');

// Get user nudge settings
exports.getNudgeSettings = async (req, res, next) => {
  try {
    let settings = await NudgeSetting.findOne({
      where: { user_id: req.userId }
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await NudgeSetting.create({
        user_id: req.userId
      });
    }

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

// Update nudge settings
exports.updateNudgeSettings = async (req, res, next) => {
  try {
    const { time_1, time_2, time_3, is_active } = req.body;

    let settings = await NudgeSetting.findOne({
      where: { user_id: req.userId }
    });

    if (!settings) {
      // Create if doesn't exist
      settings = await NudgeSetting.create({
        user_id: req.userId,
        time_1,
        time_2,
        time_3,
        is_active: is_active !== undefined ? is_active : true
      });
    } else {
      // Update existing
      if (time_1 !== undefined) settings.time_1 = time_1;
      if (time_2 !== undefined) settings.time_2 = time_2;
      if (time_3 !== undefined) settings.time_3 = time_3;
      if (is_active !== undefined) settings.is_active = is_active;

      await settings.save();
    }

    res.json({
      message: 'Configuración de notificaciones actualizada exitosamente',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Toggle nudge notifications on/off
exports.toggleNudges = async (req, res, next) => {
  try {
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        error: 'Debe proporcionar el campo is_active (true/false)'
      });
    }

    let settings = await NudgeSetting.findOne({
      where: { user_id: req.userId }
    });

    if (!settings) {
      settings = await NudgeSetting.create({
        user_id: req.userId,
        is_active
      });
    } else {
      settings.is_active = is_active;
      await settings.save();
    }

    res.json({
      message: `Notificaciones ${is_active ? 'activadas' : 'desactivadas'} exitosamente`,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Update user expo push token
exports.updatePushToken = async (req, res, next) => {
  try {
    const { expo_push_token } = req.body;

    if (!expo_push_token) {
      return res.status(400).json({
        error: 'Token de notificación es obligatorio'
      });
    }

    const user = await User.findByPk(req.userId);
    user.expo_push_token = expo_push_token;
    await user.save();

    res.json({
      message: 'Token de notificación actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

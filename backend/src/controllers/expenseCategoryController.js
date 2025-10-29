const { ExpenseCategory } = require('../models');

// Get all user expense categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await ExpenseCategory.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']]
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// Get active categories only
exports.getActiveCategories = async (req, res, next) => {
  try {
    const categories = await ExpenseCategory.findAll({
      where: {
        user_id: req.userId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await ExpenseCategory.findOne({
      where: { id, user_id: req.userId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ category });
  } catch (error) {
    next(error);
  }
};

// Create new expense category
exports.createCategory = async (req, res, next) => {
  try {
    const { category_name, default_amount } = req.body;

    // Validate required fields
    if (!category_name) {
      return res.status(400).json({
        error: 'El nombre de la categoría es obligatorio'
      });
    }

    const category = await ExpenseCategory.create({
      user_id: req.userId,
      category_name,
      default_amount: default_amount || 4.00
    });

    res.status(201).json({
      message: 'Categoría de gasto creada exitosamente',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Create multiple categories (for onboarding)
exports.createBulkCategories = async (req, res, next) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        error: 'Debe proporcionar un array de categorías'
      });
    }

    // Validate each category
    for (const c of categories) {
      if (!c.category_name) {
        return res.status(400).json({
          error: 'Todas las categorías deben tener un nombre'
        });
      }
    }

    // Add user_id to each category
    const categoriesToCreate = categories.map(c => ({
      user_id: req.userId,
      category_name: c.category_name,
      default_amount: c.default_amount || 4.00
    }));

    const createdCategories = await ExpenseCategory.bulkCreate(categoriesToCreate);

    res.status(201).json({
      message: `${createdCategories.length} categorías creadas exitosamente`,
      categories: createdCategories
    });
  } catch (error) {
    next(error);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_name, default_amount, is_active } = req.body;

    const category = await ExpenseCategory.findOne({
      where: { id, user_id: req.userId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Update fields
    if (category_name !== undefined) category.category_name = category_name;
    if (default_amount !== undefined) category.default_amount = default_amount;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();

    res.json({
      message: 'Categoría actualizada exitosamente',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await ExpenseCategory.findOne({
      where: { id, user_id: req.userId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await category.destroy();

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

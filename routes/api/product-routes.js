const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET all products with associated Category and Tags
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag } // Use through to include the join table
      ]
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single product by its `id` with associated Category and Tags
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag } // Use through to include the join table
      ]
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  try {
    const { tagIds, ...productData } = req.body; // Extract tagIds from request body
    const product = await Product.create(productData);

    // If there are tags associated with the product, create entries in the ProductTag join table
    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// PUT update a product by its `id`
router.put('/:id', async (req, res) => {
  try {
    const { tagIds, ...productData } = req.body; // Extract tagIds from request body
    const [updated] = await Product.update(productData, {
      where: { id: req.params.id }
    });

    if (updated) {
      const existingProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });

      const existingTagIds = existingProductTags.map(({ tag_id }) => tag_id);
      const newTagIds = tagIds ? tagIds.filter(tag_id => !existingTagIds.includes(tag_id)) : [];
      const tagsToRemove = existingProductTags.filter(({ tag_id }) => !tagIds.includes(tag_id)).map(({ id }) => id);

      // Remove tags not included in the update request
      await ProductTag.destroy({ where: { id: tagsToRemove } });

      // Add new tags
      if (newTagIds.length) {
        const newProductTags = newTagIds.map(tag_id => ({
          product_id: req.params.id,
          tag_id
        }));
        await ProductTag.bulkCreate(newProductTags);
      }

      const updatedProduct = await Product.findByPk(req.params.id, {
        include: [
          { model: Category },
          { model: Tag, through: ProductTag }
        ]
      });

      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'No product found with this id!' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// DELETE a product by its `id`
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      // Optionally remove associated ProductTags if needed
      await ProductTag.destroy({ where: { product_id: req.params.id } });
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'No product found with this id!' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;


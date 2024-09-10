const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// GET all tags with associated Product data
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }] // Include associated products through ProductTag
    });
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single tag by its `id` with associated Product data
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }] // Include associated products through ProductTag
    });

    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create a new tag
router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// PUT update a tag's name by its `id`
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Tag.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedTag = await Tag.findByPk(req.params.id, {
        include: [{ model: Product, through: ProductTag }]
      });
      res.status(200).json(updatedTag);
    } else {
      res.status(404).json({ message: 'No tag found with this id!' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// DELETE a tag by its `id`
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tag.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      // Optionally remove associated ProductTags if needed
      await ProductTag.destroy({ where: { tag_id: req.params.id } });
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'No tag found with this id!' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;

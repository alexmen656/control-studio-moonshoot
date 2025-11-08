import express from 'express';
import { getAvailableRegions, getRegionById } from '../utils/regions.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const regions = getAvailableRegions();
    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const region = getRegionById(id);

    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json(region);
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ error: 'Failed to fetch region' });
  }
});

export default router;

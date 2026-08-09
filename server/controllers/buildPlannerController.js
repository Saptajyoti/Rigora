import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const purposeWeights = {
  gaming: {
    'Graphics Cards': 2.5,
    Processors: 1.45,
    Motherboards: 0.8,
    Memory: 0.75,
    Storage: 0.75,
    'Power Supplies': 0.45,
    'CPU Coolers': 0.35,
    'PC Cases': 0.3,
  },
  creator: {
    'Graphics Cards': 1.8,
    Processors: 1.8,
    Motherboards: 0.9,
    Memory: 1.25,
    Storage: 1.25,
    'Power Supplies': 0.45,
    'CPU Coolers': 0.35,
    'PC Cases': 0.25,
  },
  workstation: {
    'Graphics Cards': 1.2,
    Processors: 2.2,
    Motherboards: 1,
    Memory: 1.7,
    Storage: 1.4,
    'Power Supplies': 0.5,
    'CPU Coolers': 0.45,
    'PC Cases': 0.25,
  },
  balanced: {
    'Graphics Cards': 1.6,
    Processors: 1.5,
    Motherboards: 0.9,
    Memory: 1,
    Storage: 1,
    'Power Supplies': 0.55,
    'CPU Coolers': 0.45,
    'PC Cases': 0.4,
  },
};

const categoryNames = Object.keys(purposeWeights.gaming);
const getSpec = (product, key) =>
  String(product.specifications?.get?.(key) || product.specifications?.[key] || '');
const productScore = (product) =>
  Number(product.averageRating || 0) * 100 +
  Number(product.reviewCount || 0) +
  (product.featured ? 10 : 0) +
  (product.bestSeller ? 10 : 0);
const getGpuWattage = (name) => {
  const model = name.toLowerCase();
  if (model.includes('5090')) return 575;
  if (model.includes('5080')) return 360;
  if (model.includes('4080') || model.includes('7900 xtx')) return 320;
  if (model.includes('5070') || model.includes('4070') || model.includes('9070'))
    return 220;
  if (model.includes('7800') || model.includes('7700')) return 260;
  return 170;
};
const getPsuWattage = (product) => Number.parseInt(getSpec(product, 'Wattage'), 10) || 0;
const scoreBuild = (items, purpose) =>
  items.reduce(
    (score, product) =>
      score +
      product.price * (purposeWeights[purpose][product.category.name] || 1) +
      productScore(product) * 100,
    0,
  );
const findBestBuild = (byCategory, budget, purpose) => {
  const cpuPairs = byCategory.get('Processors').flatMap((cpu) =>
    byCategory
      .get('Motherboards')
      .filter((motherboard) => getSpec(cpu, 'Socket') === getSpec(motherboard, 'Socket'))
      .map((motherboard) => ({ cpu, motherboard })),
  );
  let bestBuild;
  let bestScore = -Infinity;

  for (const gpu of byCategory.get('Graphics Cards')) {
    const estimatedWattage = getGpuWattage(gpu.name) + 170;
    const powerSupplies = byCategory
      .get('Power Supplies')
      .filter((product) => getPsuWattage(product) >= estimatedWattage * 1.25);

    for (const { cpu, motherboard } of cpuPairs) {
      const memoryOptions = byCategory
        .get('Memory')
        .filter((product) => getSpec(product, 'Type') === getSpec(motherboard, 'Memory'));
      const coolerOptions = byCategory
        .get('CPU Coolers')
        .filter((product) => getSpec(product, 'Socket').includes(getSpec(cpu, 'Socket')));

      for (const memory of memoryOptions) {
        for (const cooler of coolerOptions) {
          for (const powerSupply of powerSupplies) {
            for (const storage of byCategory.get('Storage')) {
              for (const pcCase of byCategory.get('PC Cases')) {
                const items = [
                  gpu,
                  cpu,
                  motherboard,
                  memory,
                  storage,
                  powerSupply,
                  cooler,
                  pcCase,
                ];
                const total = items.reduce((sum, product) => sum + product.price, 0);

                if (total > budget) continue;

                const score = scoreBuild(items, purpose);
                if (score > bestScore) {
                  bestBuild = { items, total, estimatedWattage, powerSupply };
                  bestScore = score;
                }
              }
            }
          }
        }
      }
    }
  }

  return bestBuild;
};

export const planPcBuild = asyncHandler(async (request, response) => {
  const budget = Number(request.body.budget);
  const purpose = request.body.purpose || 'gaming';
  const categories = await Category.find({ name: { $in: categoryNames } }).select('name');
  const categoryIds = new Map(
    categories.map((category) => [category.name, category._id]),
  );

  if (categoryIds.size !== categoryNames.length)
    return response.status(422).json({
      message:
        'The catalog is missing one or more PC build categories. Seed the catalog first.',
    });

  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
    category: { $in: [...categoryIds.values()] },
  })
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo');
  const byCategory = new Map(
    categoryNames.map((name) => [
      name,
      products.filter((product) => product.category?.name === name),
    ]),
  );

  const missingCategory = categoryNames.find((name) => !byCategory.get(name).length);
  if (missingCategory)
    return response.status(422).json({
      message: `No in-stock products are available for ${missingCategory}.`,
    });

  const selectedBuild = findBestBuild(byCategory, budget, purpose);
  if (!selectedBuild)
    return response.status(422).json({
      message: 'No complete compatible PC build is available within this budget.',
    });

  const { items, total, estimatedWattage, powerSupply } = selectedBuild;
  const [, cpu, motherboard, memory, , , cooler] = items;
  const compatible = {
    cpuMotherboard: getSpec(cpu, 'Socket') === getSpec(motherboard, 'Socket'),
    memoryMotherboard: getSpec(memory, 'Type') === getSpec(motherboard, 'Memory'),
    coolerCpu: getSpec(cooler, 'Socket').includes(getSpec(cpu, 'Socket')),
    powerHeadroom: getPsuWattage(powerSupply) >= estimatedWattage * 1.25,
  };

  return response.status(200).json({
    build: {
      purpose,
      budget,
      total,
      remaining: budget - total,
      withinBudget: true,
      estimatedWattage,
      powerSupplyWattage: getPsuWattage(powerSupply),
      compatible: Object.values(compatible).every(Boolean),
      compatibility: compatible,
      items,
    },
  });
});

import productSeeds from './products.js';

export const reviewUsers = [
  {
    firstName: 'Aarav',
    lastName: 'Mehta',
    username: 'rigora_seed_aarav',
    email: 'seed.aarav@rigora.local',
  },
  {
    firstName: 'Diya',
    lastName: 'Sharma',
    username: 'rigora_seed_diya',
    email: 'seed.diya@rigora.local',
  },
  {
    firstName: 'Kabir',
    lastName: 'Nair',
    username: 'rigora_seed_kabir',
    email: 'seed.kabir@rigora.local',
  },
  {
    firstName: 'Meera',
    lastName: 'Iyer',
    username: 'rigora_seed_meera',
    email: 'seed.meera@rigora.local',
  },
];

const reviewTemplates = [
  {
    rating: 5,
    title: 'Excellent for a focused build',
    comment:
      'The fit and day-to-day performance have been excellent. It feels like a well-chosen part for a balanced PC build.',
  },
  {
    rating: 4,
    title: 'Reliable performance',
    comment:
      'A dependable component with the performance I expected. Installation was straightforward and it has been stable in regular use.',
  },
  {
    rating: 5,
    title: 'Worth the upgrade',
    comment:
      'This made a noticeable improvement to my setup. Build quality is reassuring and it performs consistently under load.',
  },
  {
    rating: 4,
    title: 'Good value for the setup',
    comment:
      'It delivers what the specifications promise and pairs nicely with the rest of my system. A solid choice for the price.',
  },
];

const reviews = productSeeds.flatMap((product, productIndex) =>
  reviewTemplates
    .slice(0, 2 + (productIndex % 3 === 0 ? 1 : 0))
    .map((template, index) => ({
      sku: product.sku,
      reviewerEmail: reviewUsers[(productIndex + index) % reviewUsers.length].email,
      ...template,
    })),
);

export default reviews;

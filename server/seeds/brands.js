export default [
  [
    'NVIDIA',
    'Graphics technology for gaming and professional workloads.',
    'https://www.nvidia.com',
  ],
  ['AMD', 'High-performance processors and graphics products.', 'https://www.amd.com'],
  ['Intel', 'Desktop processors and platform technology.', 'https://www.intel.com'],
  ['ASUS', 'Gaming-focused PC components and displays.', 'https://www.asus.com'],
  ['MSI', 'Performance hardware for gaming systems.', 'https://www.msi.com'],
  [
    'Gigabyte',
    'PC components, graphics cards, and motherboards.',
    'https://www.gigabyte.com',
  ],
  [
    'ASRock',
    'Motherboards and graphics products for PC enthusiasts.',
    'https://www.asrock.com',
  ],
  ['Corsair', 'Memory, cooling, cases, and peripherals.', 'https://www.corsair.com'],
  ['Kingston', 'Memory and storage for enthusiast systems.', 'https://www.kingston.com'],
  ['Crucial', 'Memory and NVMe storage products.', 'https://www.crucial.com'],
  [
    'Samsung',
    'High-performance solid state storage and displays.',
    'https://www.samsung.com',
  ],
  [
    'Western Digital',
    'Reliable internal storage solutions.',
    'https://www.westerndigital.com',
  ],
  ['Seagate', 'High-capacity desktop storage.', 'https://www.seagate.com'],
  ['NZXT', 'PC cases, liquid cooling, and accessories.', 'https://nzxt.com'],
  [
    'Cooler Master',
    'Cooling, cases, and power solutions.',
    'https://www.coolermaster.com',
  ],
  [
    'DeepCool',
    'Cooling and power products for performance builds.',
    'https://www.deepcool.com',
  ],
  ['Noctua', 'Premium quiet air-cooling components.', 'https://noctua.at'],
  [
    'Logitech',
    'Gaming mice, keyboards, headsets, and webcams.',
    'https://www.logitechg.com',
  ],
  ['Razer', 'Premium gaming peripherals.', 'https://www.razer.com'],
  ['SteelSeries', 'Gaming headsets, keyboards, and mice.', 'https://steelseries.com'],
  ['HyperX', 'Gaming headsets, keyboards, and accessories.', 'https://hyperx.com'],
  ['Acer', 'Gaming monitors and display technology.', 'https://www.acer.com'],
  ['LG', 'High-refresh gaming and creator displays.', 'https://www.lg.com'],
  ['BenQ', 'Gaming and professional display products.', 'https://www.benq.com'],
  [
    'TP-Link',
    'Networking equipment for home and gaming setups.',
    'https://www.tp-link.com',
  ],
].map(([name, description, website]) => ({
  name,
  description,
  logo: `/products/brands/${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}.png`,
  website,
  isFeatured: ['NVIDIA', 'AMD', 'Intel', 'ASUS', 'Corsair', 'Logitech'].includes(name),
}));

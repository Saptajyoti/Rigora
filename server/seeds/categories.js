export default [
  [
    'Graphics Cards',
    'Desktop GPUs for high-frame-rate gaming and creator workloads.',
    true,
  ],
  ['Processors', 'Desktop CPUs for gaming rigs and workstation builds.', true],
  ['Motherboards', 'Reliable AMD and Intel motherboard platforms.', true],
  ['Memory', 'DDR4 and DDR5 desktop memory kits.', false],
  ['Storage', 'NVMe SSDs, SATA SSDs, and high-capacity hard drives.', true],
  ['Power Supplies', 'Efficient power supplies for dependable modern PC builds.', false],
  ['PC Cases', 'Airflow-focused cases for clean component builds.', false],
  ['CPU Coolers', 'Air and liquid CPU coolers for enthusiast systems.', false],
  ['Case Fans', 'PWM and RGB fans for quieter, cooler cases.', false],
  ['Monitors', 'High-refresh gaming and creator displays.', true],
  ['Keyboards', 'Mechanical keyboards for gaming and productivity.', false],
  ['Mice', 'Precision gaming mice for every grip style.', false],
  ['Headsets', 'Gaming headsets with clear positional audio.', false],
  ['Webcams', 'Cameras for streaming, meetings, and content creation.', false],
  ['Networking', 'Wi-Fi routers and adapters for low-latency connectivity.', false],
  ['Accessories', 'Essential PC-building and desk setup accessories.', false],
].map(([name, description, isFeatured]) => ({
  name,
  description,
  image: `/products/categories/${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}.jpg`,
  isFeatured,
}));

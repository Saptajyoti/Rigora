export default [
  [
    'Graphics Cards',
    'Desktop GPUs for high-frame-rate gaming and creator workloads.',
    true,
  ],
  ['Processors', 'Desktop CPUs for gaming rigs and workstation builds.', true],
  ['Motherboards', 'Reliable AMD and Intel motherboard platforms.', true],
  ['Memory', 'DDR4 and DDR5 desktop memory kits.', false],
  ['Storage', 'NVMe SSDs and high-capacity SATA drives.', true],
  ['Power Supplies', 'Efficient, modular power supplies for modern builds.', false],
  ['PC Cases', 'Airflow-focused cases for clean component builds.', false],
  ['Cooling', 'Air and liquid cooling for enthusiast PCs.', false],
  ['Monitors', 'High-refresh gaming and creator displays.', true],
  ['Keyboards', 'Mechanical keyboards for gaming and productivity.', false],
  ['Mice', 'Precision gaming mice for every grip style.', false],
  ['Headsets', 'Gaming headsets with clear positional audio.', false],
].map(([name, description, isFeatured]) => ({ name, description, isFeatured }));

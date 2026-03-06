import type { DropdownData } from '@/types';

export const dropdownData: DropdownData = {
  // User related
  sections: [
    'Production',
    'Quality Control',
    'Maintenance',
    'Engineering',
    'Warehouse',
    'Administration'
  ],
  departments: [
    'Manufacturing',
    'Quality Assurance',
    'Engineering',
    'Logistics',
    'Human Resources',
    'Finance'
  ],
  positions: [
    'Engineer',
    'Technician',
    'Operator',
    'Supervisor',
    'Manager',
    'Staff'
  ],

  // Tool Code related
  toolTypes: [
    'End Mill',
    'Drill',
    'Tap',
    'Reamer',
    'Insert',
    'Holder',
    'Collet',
    'Cutter',
    'Grinding Wheel',
    'Measuring Tool'
  ],
  makers: [
    'Mitsubishi',
    'Sandvik',
    'Kennametal',
    'OSG',
    'YG-1',
    'Sumitomo',
    'Tungaloy',
    'Kyocera',
    'Hitachi',
    'Makita'
  ],
  suppliers: [
    'Thai Tool Supply',
    'Metro Machinery',
    'Precision Tools Co.',
    'Industrial Solutions',
    'Tool Master Thailand',
    'CNC Tools Center'
  ],
  machineNos: [
    'MC-001',
    'MC-002',
    'MC-003',
    'MC-004',
    'MC-005',
    'MC-006',
    'MC-007',
    'MC-008',
    'MC-009',
    'MC-010'
  ],
  sopModels: [
    'SOP-VMC-001',
    'SOP-VMC-002',
    'SOP-HMC-001',
    'SOP-HMC-002',
    'SOP-TURN-001',
    'SOP-TURN-002',
    'SOP-GRIND-001'
  ],
  processNames: [
    'Rough Milling',
    'Finish Milling',
    'Drilling',
    'Tapping',
    'Reaming',
    'Turning',
    'Grinding',
    'Polishing'
  ],
  stockControls: [
    'FIFO',
    'LIFO',
    'Min-Max',
    'Kanban',
    'Just-In-Time'
  ],
  locations: [
    'Warehouse A',
    'Warehouse B',
    'Tool Room',
    'Production Line 1',
    'Production Line 2',
    'QC Room',
    'Maintenance Room'
  ],

  // Tool List related
  caliperTypes: [
    'Standard',
    'Digital',
    'Dial',
    'Vernier',
    'Micrometer',
    'Height Gauge'
  ],
  models: [
    'Model A-100',
    'Model B-200',
    'Model C-300',
    'Model D-400',
    'Model E-500'
  ],
  types: [
    'Type 1',
    'Type 2',
    'Type 3',
    'Type 4',
    'Type 5'
  ],
  spindles: [
    'BT30',
    'BT40',
    'BT50',
    'HSK-A63',
    'HSK-A100',
    'CAT40',
    'CAT50'
  ],
  machinePoints: [
    'Point 1',
    'Point 2',
    'Point 3',
    'Point 4',
    'Point 5'
  ],
  toolConners: [
    'Corner 1',
    'Corner 2',
    'Corner 3',
    'Corner 4'
  ],
  machineMakers: [
    'Mazak',
    'Makino',
    'Okuma',
    'DMG Mori',
    'Haas',
    'Fanuc',
    'Brother'
  ],
  preSetImages: [
    { id: 'ps-001', name: 'Pre-Set 10x20', url: '/assets/preset-10x20.png' },
    { id: 'ps-002', name: 'Pre-Set 15x30', url: '/assets/preset-15x30.png' },
    { id: 'ps-003', name: 'Pre-Set 20x40', url: '/assets/preset-20x40.png' },
    { id: 'ps-004', name: 'Pre-Set 25x50', url: '/assets/preset-25x50.png' },
    { id: 'ps-005', name: 'Pre-Set 30x60', url: '/assets/preset-30x60.png' }
  ]
};

export default dropdownData;

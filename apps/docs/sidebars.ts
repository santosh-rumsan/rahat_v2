import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/frontend-overview',
        'architecture/plugin-system',
        'architecture/data-management',
        'architecture/routing-and-layouts',
        'architecture/component-architecture',
        'architecture/diagrams',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'features/dashboard',
        'features/projects',
        'features/services',
        'features/fund-management',
        'features/vendors',
        'features/users',
      ],
    },
    {
      type: 'category',
      label: 'User Roles',
      collapsed: true,
      items: ['user-roles/overview'],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: true,
      items: [
        'api/overview',
        'api/projects',
        'api/users',
        'api/vendors',
        'api/services',
        'api/fund-management',
      ],
    },
  ],
};

export default sidebars;

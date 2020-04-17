interface MainMenuItem {
  icon: string;
  title: string;
  to: string;
}

export const menuItems: MainMenuItem[] = [
  {
    icon: 'mdi-apps',
    title: 'Welcome',
    to: '/',
  },
  {
    icon: 'mdi-chart-bubble',
    title: 'UUID4 Generator',
    to: '/uuid-generator',
  },
  {
    icon: 'mdi-chart-bubble',
    title: 'String utilities',
    to: '/string-utils',
  },
];

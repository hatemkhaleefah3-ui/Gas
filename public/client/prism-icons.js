const ICONS = {
  home: [
    '<path d="M4.5 10.4 12 4l7.5 6.4V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20v-9.6Z" fill="currentColor" opacity=".16"/>',
    '<path d="M3.5 10.8 12 3.7l8.5 7.1M5.3 9.8v10.3h13.4V9.8M9.3 20.1v-6h5.4v6"/>'
  ],
  learn: [
    '<path d="M4 5.2A3.2 3.2 0 0 1 7.2 2H12v18H7.2A3.2 3.2 0 0 0 4 23.2v-18Z" fill="currentColor" opacity=".14"/><path d="M20 5.2A3.2 3.2 0 0 0 16.8 2H12v18h4.8a3.2 3.2 0 0 1 3.2 3.2v-18Z" fill="currentColor" opacity=".08"/>',
    '<path d="M4 5.2A3.2 3.2 0 0 1 7.2 2H12v18H7.2A3.2 3.2 0 0 0 4 23.2v-18ZM20 5.2A3.2 3.2 0 0 0 16.8 2H12v18h4.8a3.2 3.2 0 0 1 3.2 3.2v-18Z"/>'
  ],
  plan: [
    '<rect x="3" y="5" width="18" height="16" rx="4" fill="currentColor" opacity=".14"/>',
    '<rect x="3" y="5" width="18" height="16" rx="4"/><path d="M8 3v4M16 3v4M3 10.5h18M7.5 14.5h3M13.5 14.5h3M7.5 18h2"/>'
  ],
  rooms: [
    '<circle cx="9" cy="8" r="4" fill="currentColor" opacity=".15"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0" fill="currentColor" opacity=".11"/>',
    '<circle cx="9" cy="8" r="4"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0M17.5 5.8a3.4 3.4 0 0 1 0 6.4M21.5 21a5.2 5.2 0 0 0-3.8-5"/>'
  ],
  community: [
    '<path d="M4 5.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H11l-5.5 3v-3H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" fill="currentColor" opacity=".14"/>',
    '<path d="M4 5.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H11l-5.5 3v-3H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2ZM7 10h10M7 14h7"/>'
  ],
  grid: [
    '<rect x="3" y="3" width="8" height="8" rx="2.5" fill="currentColor" opacity=".15"/><rect x="13" y="13" width="8" height="8" rx="2.5" fill="currentColor" opacity=".15"/>',
    '<rect x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="8" rx="2.5"/><rect x="3" y="13" width="8" height="8" rx="2.5"/><rect x="13" y="13" width="8" height="8" rx="2.5"/>'
  ],
  continue: [
    '<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".13"/>',
    '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none"/>'
  ],
  upcoming: [
    '<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".13"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.8 2.2"/>'
  ],
  progress: [
    '<path d="M4 20V11h4v9H4Zm6 0V5h4v15h-4Zm6 0v-7h4v7h-4Z" fill="currentColor" opacity=".16"/>',
    '<path d="M4 20V11h4v9H4Zm6 0V5h4v15h-4Zm6 0v-7h4v7h-4Z"/>'
  ],
  bookmark: [
    '<path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V22l-6-3.6L6 22V4.5Z" fill="currentColor" opacity=".15"/>',
    '<path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V22l-6-3.6L6 22V4.5Z"/>'
  ],
  agenda: [
    '<rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity=".12"/>',
    '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h8M8 12h8M8 16h5"/>'
  ],
  completed: [
    '<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".14"/>',
    '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/>'
  ],
  discover: [
    '<circle cx="11" cy="11" r="7" fill="currentColor" opacity=".12"/>',
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/>'
  ],
  questions: [
    '<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".13"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 4 2c-1 .7-1.7 1.2-1.7 2.5M12 17h.01"/>'
  ],
  resources: [
    '<path d="M5 3h11l3 3v15H5V3Z" fill="currentColor" opacity=".13"/>',
    '<path d="M5 3h11l3 3v15H5V3ZM15 3v5h4M8 12h8M8 16h6"/>'
  ],
  work: [
    '<rect x="3" y="7" width="18" height="13" rx="4" fill="currentColor" opacity=".14"/>',
    '<rect x="3" y="7" width="18" height="13" rx="4"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>'
  ],
  scholarship: [
    '<path d="m3 9 9-5 9 5-9 5-9-5Z" fill="currentColor" opacity=".16"/>',
    '<path d="m3 9 9-5 9 5-9 5-9-5ZM7 12v4.5c2.8 2 7.2 2 10 0V12M21 10v6"/>'
  ],
  volunteer: [
    '<path d="M12 21s-8-4.9-8-11a4.8 4.8 0 0 1 8-3.5A4.8 4.8 0 0 1 20 10c0 6.1-8 11-8 11Z" fill="currentColor" opacity=".15"/>',
    '<path d="M12 21s-8-4.9-8-11a4.8 4.8 0 0 1 8-3.5A4.8 4.8 0 0 1 20 10c0 6.1-8 11-8 11Z"/>'
  ],
  donate: [
    '<path d="M12 21s-7-4.2-7-9.2A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7 3.8C19 16.8 12 21 12 21Z" fill="currentColor" opacity=".15"/>',
    '<path d="M12 21s-7-4.2-7-9.2A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7 3.8C19 16.8 12 21 12 21ZM12 8V3M9.5 5.5 12 3l2.5 2.5"/>'
  ],
  profile: [
    '<circle cx="12" cy="8" r="4" fill="currentColor" opacity=".15"/><path d="M4 21a8 8 0 0 1 16 0" fill="currentColor" opacity=".1"/>',
    '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  ],
  settings: [
    '<circle cx="12" cy="12" r="7" fill="currentColor" opacity=".12"/>',
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .86V20.5h-4v-.24a1.7 1.7 0 0 0-1-.86 1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.86-1H3.5v-4h.24a1.7 1.7 0 0 0 .86-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.86V3.5h4v.24a1.7 1.7 0 0 0 1 .86 1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.39.46.71.86 1h.24v4h-.24c-.4.29-.7.61-.86 1Z"/>'
  ],
  courses: [
    '<path d="m12 3 9 5-9 5-9-5 9-5Z" fill="currentColor" opacity=".16"/>',
    '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>'
  ],
  notifications: [
    '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" fill="currentColor" opacity=".13"/>',
    '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>'
  ],
  search: [
    '<circle cx="11" cy="11" r="7" fill="currentColor" opacity=".11"/>',
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'
  ],
  menu: [
    '<rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor" opacity=".1"/>',
    '<path d="M7 9h10M7 15h10"/>'
  ],
  plus: [
    '<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".12"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'
  ],
  close: [
    '<circle cx="12" cy="12" r="9" fill="currentColor" opacity=".1"/>',
    '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'
  ],
  arrow: [
    '',
    '<path d="M5 12h14M14 7l5 5-5 5"/>'
  ],
  spark: [
    '<path d="m12 3 1.3 3.4L17 7.7l-3.7 1.3L12 12.5 10.7 9 7 7.7l3.7-1.3L12 3Z" fill="currentColor" opacity=".18"/>',
    '<path d="m12 3 1.3 3.4L17 7.7l-3.7 1.3L12 12.5 10.7 9 7 7.7l3.7-1.3L12 3ZM19 14l.7 1.8 1.8.7-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7L19 14Z"/>'
  ],
  focus: [
    '<circle cx="12" cy="12" r="8" fill="currentColor" opacity=".12"/>',
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'
  ]
};

export function prismIcon(name, className='prism-icon') {
  const [tone,line] = ICONS[name] || ICONS.spark;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${tone}${line}</svg>`;
}

export const routeIcon = pathname => {
  if(pathname.startsWith('/dashboard')) return 'home';
  if(pathname.startsWith('/subjects')) return 'learn';
  if(pathname.startsWith('/schedule')) return 'plan';
  if(pathname.startsWith('/study-rooms')) return 'rooms';
  if(pathname.startsWith('/community')) return 'community';
  if(pathname.startsWith('/work')) return 'work';
  if(pathname.startsWith('/scholarships')) return 'scholarship';
  if(pathname.startsWith('/volunteer')) return 'volunteer';
  if(pathname.startsWith('/donate')) return 'donate';
  if(pathname.startsWith('/profile') || pathname.startsWith('/users/')) return 'profile';
  if(pathname.startsWith('/settings')) return 'settings';
  if(pathname.startsWith('/courses')) return 'courses';
  if(pathname.startsWith('/notifications')) return 'notifications';
  return 'spark';
};

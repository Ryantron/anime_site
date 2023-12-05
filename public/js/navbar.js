const navbar = document.querySelector('#navbar');
const navbarMenuBtn = document.querySelector('#navbar__menu-button');
const navbarUsername = document.querySelector('#navbar__username');

/**
 * Run after page loads
 */

// Create Menu Popup Element

const createLi = (aHref, aId, aContent) => `
<li class='no-bullet py-2'>
  <a href='${aHref}' id='${aId}' class='no-underline secondary-text-color'>
    ${aContent}
  </a>
</li>
`;

const accountsItemHTML = createLi(
  '/accounts',
  'navbar_accounts-anchor',
  'Accounts'
);

const menuHTML = `
<ul id='navbar_menu-popup' class='position-absolute end-0 top-100 secondary-bg-color flex-center flex-column px-2'>
  ${createLi('/main', 'navbar_main-anchor', 'Main')}
  ${createLi('/entries', 'navbar_entries_anchor', 'Entries')}
  ${navbarUsername === undefined ? '' : accountsItemHTML}
</ul>
`;

const menuTemplate = document.createElement('template');
menuTemplate.innerHTML = menuHTML;
const menuEl = menuTemplate.content.children[0];

/**
 * Event Handlers
 */

navbarMenuBtn.addEventListener('click', () => {
  if (navbar.contains(menuEl)) menuTemplate.appendChild(menuEl);
  else navbar.appendChild(menuEl);
});

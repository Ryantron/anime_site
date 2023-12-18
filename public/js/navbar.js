/**
 * DOM ELEMENTS
 */

const navbar = document.querySelector("#navbar");
const navbarMenuBtn = document.querySelector("#navbar__menu-button");
const navbarUsername = document.querySelector("#navbar__username");

/**
 * RUNTIME Dynamic HTML & CSS
 */

// Create Menu Popup Element

const createLi = (aHref, aId, aContent) => `
<li class='no-bullet py-2 flex-center'>
  <a href='${aHref}' id='${aId}' class='no-underline secondary-text-color'>
    ${aContent}
  </a>
</li>
`;

const logoutItemHTML = createLi("/logout", "navbar_logout-anchor", "Logout");

const menuHTML = `
<ul 
  id='navbar_menu-popup' 
  class='position-absolute end-0 top-100 secondary-bg-color flex-center flex-column px-2 flex-align-stretch border-bottom border-dark'>
  ${createLi("/main", "navbar_main-anchor", "Main")}
  ${createLi("/accounts/friends", "navbar_friends_anchor", "Friends")}
  ${navbarUsername === null ? "" : logoutItemHTML}
</ul>
`;

const menuTemplate = document.createElement("template");
menuTemplate.innerHTML = menuHTML;
const menuEl = menuTemplate.content.children[0];

/**
 * EVENT LISTENERS
 */

navbarMenuBtn.addEventListener("click", () => {
  if (navbar.contains(menuEl)) menuTemplate.appendChild(menuEl);
  else navbar.appendChild(menuEl);
});

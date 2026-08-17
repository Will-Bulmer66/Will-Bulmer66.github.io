const navButton = document.querySelector('#navButton');
const navMenu = document.querySelector('#navMenu');

navButton.addEventListener('click', function () {
    if (navMenu.classList.contains('is-active')) {
        this.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-active');
        navMenu.setAttribute('aria-hidden', 'true');
    } else {
        navMenu.classList.add('is-active');
        this.setAttribute('aria-expanded', 'true');
        navMenu.setAttribute('aria-hidden', 'false');
    }
});

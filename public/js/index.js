import '@babel/polyfill';
import { signup, login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookMovie } from './stripe';

//* DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.querySelector('#book-movie');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const video = document.querySelector('.video');

//* EVENT LISTENERS
if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.querySelector('#photo').files[0]);
    console.log(form);
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    const { movieId } = e.target.dataset;
    bookMovie(movieId);
  });

if (video)
  video.addEventListener('ended', e => {
    e.preventDefault();
    video.autoplay = false;
    video.load();
  });

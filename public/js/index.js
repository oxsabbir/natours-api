/*eslint-disable*/

import { login, logout } from './login';

import { updateUserInfo, updateUserPassword } from './updateSettings';
import { bookTour } from './stripe';

const loginForm = document.querySelector('.form-login');
const logoutbtn = document.querySelector('.nav__el--logout');

const saveSetting = document.querySelector('#updateSetting');
const savePassword = document.querySelector('#updatePassword');
const bookBtn = document.getElementById('bookTour');

if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (saveSetting) {
  saveSetting.addEventListener('submit', function (event) {
    event.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUserInfo(form);
  });
}

if (savePassword) {
  savePassword.addEventListener('submit', function (event) {
    event.preventDefault();
    const currentPass = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    updateUserPassword(currentPass, password, confirmPassword);
  });
}

if (logoutbtn) {
  logoutbtn.addEventListener('click', logout);
}

if (bookBtn) {
  bookBtn.addEventListener('click', function (e) {
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
    bookBtn.textContent = 'Processing...';
  });
}

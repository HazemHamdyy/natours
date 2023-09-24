
import '@babel/polyfill';
import { login , signup} from './login';
import { updateSettings } from './updateSettings';
import {axios} from 'axios'

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const signupForm = document.querySelector('.form--signup');



// DELEGATION


if (loginForm) 
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('emailogin').value;
    const password = document.getElementById('passwordlogin').value;
    login(email, password);
  });



if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    if(document.getElementById('photo').files[0])
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm){
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if(signupForm){
  signupForm.addEventListener('submit', e => {
    console.log('submit')
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm').value;
    signup(email, name, password, confirmPassword);
  }); 
}

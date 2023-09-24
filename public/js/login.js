/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import email from '../../utils/email';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/auth/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
  showAlert('error', err.response.data.message);
  }
};



export const signup = async (email,name,password,confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/auth/signup',
      data: {
        name,
        email,
        password,
        confirmPassword
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Signed up! Please check your mails to verify your account');
      window.setTimeout(() => {
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

/*eslint-disable*/
import { showAlert } from './alert';

export const login = async function (email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      showAlert('success', 'Successfully logged in & Redirecting...');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    }

    if (data.status !== 'success') {
      throw data;
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const logout = async function () {
  try {
    const response = await fetch('http://localhost:3000/logout');
    if (!response.ok) throw response;
    location.reload(true);
  } catch (err) {
    showAlert('error', 'Something went wrong!');
  }
};

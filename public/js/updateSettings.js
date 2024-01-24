/*eslint-disable*/
import { showAlert } from './alert';

export const updateUserInfo = async function (formData) {
  try {
    const response = await fetch(
      'http://localhost:3000/api/v1/users/updateMe',
      {
        method: 'PATCH',
        body: formData,
      },
    );
    const data = await response.json();
    if (response.ok) {
      showAlert('success', 'Data updated successfully');
      setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
    if (!response.ok) throw data;
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};

export const updateUserPassword = async function (
  currentPassword,
  newPassword,
  confirmPassword,
) {
  try {
    const response = await fetch(
      'http://localhost:3000/api/v1/users/updatePassword',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
          confirmPassword,
        }),
      },
    );
    const data = await response.json();
    if (response.ok) {
      showAlert('success', 'Password updated successfully');
      setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
    if (!response.ok) throw data;
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};

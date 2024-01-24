/*eslint-disable*/

const hideAlert = function () {
  const alert = document.querySelector('.alert');
  if (alert) {
    const parent = alert.parentElement;
    parent.removeChild(alert);
  }
};

export const showAlert = function (status, message) {
  hideAlert();
  const markUp = `<div class="alert alert--${status}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);

  window.setTimeout(hideAlert, 4500);
};

/*eslint-disable*/
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51OWcRSFERfGnFFktKuQrzIJjQ1Li5OUmTsTfwmEufB4QzWBTZekzxVQ9ZkEJ9R2x5kfVhN2ye5SPYzQlTwu8EXBN00fddXrh98',
);

export const bookTour = async function (tourId) {
  try {
    // getting the session with id
    const session = await fetch(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    const data = await session.json();

    if (session.ok) {
      // charging card using redirectToCheckout
      stripe.redirectToCheckout({
        sessionId: data.session.id,
      });
    }
    if (!session.ok) {
      throw data;
    }
  } catch (err) {
    showAlert('error', err);
  }
};

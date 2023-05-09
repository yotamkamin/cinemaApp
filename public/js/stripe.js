import axios from 'axios';

import { showAlert } from './alerts';

export const bookMovie = async movieId => {
  const stripe = Stripe(
    'pk_test_51N0rvpAvvot7bhSbm1d4w6L9DrcV161HTU9wTgRVxjVfpSgmQ0WchkngzZCGUVdGhdaSrQXUwnsz6WfwW4rrjpYM00A916fOwH'
  );
  try {
    //1
    const session = await axios(`/api/v1/booking/checkout-session/${movieId}`);
    // console.log(session);

    //2
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    window.location.replace(session.data.session.url);
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }

  //2
};

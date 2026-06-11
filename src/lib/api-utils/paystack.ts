// ================================================================
// Paystack payment utility
// ================================================================

import { config } from './config';

const PAYSTACK_API = 'https://api.paystack.co';

/**
 * Initialize a Paystack payment
 */
export async function initializePayment(
  email: string,
  amount: number,
  callbackUrl: string
): Promise<{ authorization_url: string; reference: string }> {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount),
      callback_url: callbackUrl,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Payment initialization failed');
  }

  const data = await response.json();
  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  };
}

/**
 * Verify a Paystack payment by reference
 */
export async function verifyPayment(
  reference: string
): Promise<any> {
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Payment verification failed');
  }

  const data = await response.json();
  return data.data;
}

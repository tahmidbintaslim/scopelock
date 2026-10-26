track('checkout_complete', { plan: new URLSearchParams(location.search).get('plan') || '' });

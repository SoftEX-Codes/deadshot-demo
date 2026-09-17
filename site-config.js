// Public connection values only. Never put a secret/service-role key here.
export const config = Object.freeze({
  supabaseUrl: '',
  supabasePublishableKey: '',
  assistantFunction: ''
});
export const cloudEnabled = Boolean(config.supabaseUrl && config.supabasePublishableKey);

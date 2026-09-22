// Public connection values only. Never put a secret/service-role key here.
export const config = Object.freeze({
  contactEmail: '', // Business-approved public enquiry address; awaiting owner.
  supabaseUrl: '',
  supabasePublishableKey: '',
  assistantFunction: ''
});
export const cloudEnabled = Boolean(config.supabaseUrl && config.supabasePublishableKey);

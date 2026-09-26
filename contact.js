import {config} from './site-config.js?v=7';
// An actual business address is required. Never display an invented destination.
const email=String(config.contactEmail||'').trim();
if(/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i.test(email)){
  for(const section of document.querySelectorAll('[data-contact-fallback]')){
    const link=section.querySelector('[data-contact-email]');
    link.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('Device enquiry — Moxie Gadgets');
    link.textContent=email;section.hidden=false;
  }
}

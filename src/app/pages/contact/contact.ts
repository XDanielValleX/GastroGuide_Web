import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  sending = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor() {
    // initialize emailjs with public key
    try {
      emailjs.init(environment.emailjsPublicKey);
    } catch (e) {
      // ignore init errors
    }
  }

  sendEmail(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form) return;
    this.sending = true;

    // Log all form values to help debugging
    const fd = new FormData(form);
    const debug: any = {};
    fd.forEach((v, k) => debug[k] = v);
    console.log('Contact form values:', debug);
    // Try to read important fields (fallback to direct DOM read if FormData missing)
    const fromName = (debug['from_name'] as string) || (form.querySelector('#firstName') as HTMLInputElement)?.value || '';
    const lastName = (debug['last_name'] as string) || (form.querySelector('#lastName') as HTMLInputElement)?.value || '';
    const fromEmail = (debug['from_email'] as string) || (form.querySelector('#email') as HTMLInputElement)?.value || '';
    const subject = (debug['subject'] as string) || (form.querySelector('#subject') as HTMLSelectElement)?.value || '';
    const message = (debug['message'] as string) || (form.querySelector('#message') as HTMLTextAreaElement)?.value || '';

    const templateParams: any = {
      from_name: `${fromName} ${lastName}`.trim() || '(Sin nombre)',
      from_email: fromEmail || '(Sin email)',
      subject: subject || '(Sin asunto)',
      message: message || '' ,
      newsletter: (debug['newsletter'] ? 'SI' : 'NO')
    };

    console.log('Template params to send:', templateParams);

    emailjs.send(environment.emailjsServiceId, environment.emailjsTemplateId, templateParams)
      .then(() => {
        this.sending = false;
        this.successMessage = 'Formulario enviado correctamente.';
        this.errorMessage = null;
        try { form.reset(); } catch {}
        // auto-hide after 6 seconds
        setTimeout(() => this.successMessage = null, 6000);
      })
      .catch((err) => {
        console.error('EmailJS error', err);
        this.sending = false;
        this.errorMessage = 'Ocurrió un error al enviar el mensaje. Intenta de nuevo.';
        // auto-hide after 8 seconds
        setTimeout(() => this.errorMessage = null, 8000);
      });
  }

  clearMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

}



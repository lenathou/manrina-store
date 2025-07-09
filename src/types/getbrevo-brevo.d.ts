declare module '@getbrevo/brevo' {
  export class SendSmtpEmail {
    subject?: string;
    htmlContent?: string;
    sender?: { name?: string; email?: string };
    to?: Array<{ email: string; name?: string }>;
    replyTo?: { email?: string; name?: string };
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
  }

  export enum TransactionalEmailsApiApiKeys {
    apiKey = 'apiKey'
  }

  export class TransactionalEmailsApi {
    setApiKey(keyName: string, apiKey: string): void;
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<unknown>;
  }

  namespace brevo {
    export { TransactionalEmailsApi };
  }

  export default brevo;
}
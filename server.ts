import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse request payloads
  app.use(express.json());

  // API router endpoint to handle form lead submissions
  app.post("/api/submit-lead", async (req, res) => {
    const { parentName, childName, childAge, phone, whatsapp, email, origin, message } = req.body;
    
    const adminEmail = 'contact.pequenosbilingues@gmail.com';
    const parentEmail = email || '';

    // Construct Email content for administrator
    const adminSubject = `📥 [Site Pequenos Bilíngues] Novo Interesse: ${origin}`;
    const adminBody = `
📢 Novo lead cadastrado no site Pequenos Bilíngues!

Ficha de Informações:
---------------------------------------------
⭐ Canal de Origem: ${origin}
👤 Nome do Responsável: ${parentName}
👶 Nome da Criança: ${childName || 'Não informado'}
🎈 Idade da Criança: ${childAge || 'Não informada'}
📞 Telefone: ${phone || 'Não informado'}
🟢 WhatsApp: ${whatsapp || 'Não informado'}
📧 E-mail: ${email || 'Não informado'}
📝 Mensagem/Notas adicionais:
"${message || ''}"
---------------------------------------------

Este é um e-mail gerado automaticamente pelo portal oficial.
    `.trim();

    // Construct Welcome email for parent
    const welcomeSubject = 'Bem-vindo(a) ao Pequenos Bilíngues! 🎈🇬🇧';
    const welcomeBody = `
Olá, ${parentName}! 🌟

Ficamos extremamente felizes com o seu interesse no Pequenos Bilíngues!

Recebemos os seus dados preenchidos com sucesso via site. Aqui está uma cópia do que recebemos de você:
- Criança: ${childName || 'Não informado'} (${childAge || 'Não informada'} anos)
- Modalidade solicitada: ${origin}

Em breve, a Teacher Carla Cristina entrará em contato diretamente com você através do número de telefone/WhatsApp fornecido para conversarmos com carinho sobre a rotina de inglês do seu pequeno e agendarmos a nossa incrível vivência lúdica e prática!

Se precisar falar conosco urgentemente, basta acessar nosso WhatsApp: https://wa.me/5569992512267

Com muita alegria,
Teacher Carla Cristina 🎈
Pequenos Bilíngues
    `.trim();

    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      const hasSmtpConfig = smtpHost && smtpUser && smtpPass;

      if (hasSmtpConfig) {
        // Setup Nodemailer transporter with credentials
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort || "587"),
          secure: smtpPort === "465", // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // 1. Send e-mail to administrator (Carla)
        await transporter.sendMail({
          from: `"${parentName} via Pequenos Bilíngues" <${smtpUser}>`,
          to: adminEmail,
          subject: adminSubject,
          text: adminBody,
          replyTo: parentEmail || undefined
        });

        // 2. Send e-mail to parent if email is defined
        if (parentEmail && parentEmail.includes('@')) {
          await transporter.sendMail({
            from: `"Teacher Carla | Pequenos Bilíngues" <${smtpUser}>`,
            to: parentEmail,
            subject: welcomeSubject,
            text: welcomeBody
          });
        }

        console.log(`[SMTP] Emails successfully dispatched to ${adminEmail} and ${parentEmail || '(no parent email)'}`);
        return res.json({ 
          success: true, 
          message: 'Dados enviados com sucesso! E-mails enviados.',
          smtp: true
        });
      } else {
        // Fallback mode if SMTP is not configured in environment yet
        console.log(`[SIMULATION-API] SMTP not configured. Simulated dispatch details:`);
        console.log(`------------ EMAIL TO ADMIN ------------`);
        console.log(`To: ${adminEmail}`);
        console.log(`Subject: ${adminSubject}`);
        console.log(`Body:\n${adminBody}`);
        console.log(`----------------------------------------`);
        if (parentEmail) {
          console.log(`------------ EMAIL TO PARENT ------------`);
          console.log(`To: ${parentEmail}`);
          console.log(`Subject: ${welcomeSubject}`);
          console.log(`Body:\n${welcomeBody}`);
          console.log(`-----------------------------------------`);
        }
        
        // We return success to ensure client receives "Dados enviados" perfectly and gracefully!
        return res.json({ 
          success: true, 
          message: 'Dados enviados com sucesso! (Modo Simulação local ativo)',
          smtp: false,
          simulated: true,
          trace: {
            adminEmail,
            parentEmail,
            adminSubject,
            welcomeSubject
          }
        });
      }
    } catch (error: any) {
      console.error('[SMTP error]:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno ao conectar ao servidor SMTP.' 
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

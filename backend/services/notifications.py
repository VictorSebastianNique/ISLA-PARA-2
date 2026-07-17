import time

def enviar_notificacion(contacto: str, pdf_path: str):
    """
    Enrutador Lógico:
    - Si el contacto contiene @, enviamos un correo electrónico.
    - Si son dígitos numéricos, enviamos por WhatsApp.
    """
    if "@" in contacto:
        return enviar_email_simulado(contacto, pdf_path)
    elif contacto.isdigit():
        return enviar_whatsapp_simulado(contacto, pdf_path)
    else:
        print(f"Formato de contacto no reconocido: {contacto}")
        return False

def enviar_email_simulado(email: str, pdf_path: str):
    print(f"[SIMULACIÓN EMAIL] Conectando con SendGrid/Resend...")
    time.sleep(1)
    print(f"[SIMULACIÓN EMAIL] Correo enviado a {email} con archivo adjunto: {pdf_path}")
    return True

def enviar_whatsapp_simulado(telefono: str, pdf_path: str):
    print(f"[SIMULACIÓN WHATSAPP] Conectando con WhatsApp Cloud API/Twilio...")
    time.sleep(1)
    print(f"[SIMULACIÓN WHATSAPP] Mensaje con plantilla 'document' enviado a {telefono}, Enlace/Archivo: {pdf_path}")
    return True

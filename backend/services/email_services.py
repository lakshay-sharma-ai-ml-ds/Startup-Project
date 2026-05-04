import os, asyncio, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "alerts@aisheriff.com")

async def send_alert_email(to_email, model_name, alert_type, severity, title, message):
    if not SMTP_HOST or not SMTP_USER:
        print(f"\n[AI Sheriff Alert]\n  TO: {to_email}\n  TITLE: {title}\n  SEVERITY: {severity}\n  MODEL: {model_name}\n")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"AI Sheriff <{FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = f"[AI Sheriff] {title}"
        msg.attach(MIMEText(f"AI Sheriff Alert\n\n{title}\n\n{message}\n\nModel: {model_name}", "plain"))
        def _send():
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
                smtp.ehlo(); smtp.starttls(); smtp.login(SMTP_USER, SMTP_PASS)
                smtp.sendmail(FROM_EMAIL, to_email, msg.as_string())
        await asyncio.to_thread(_send)
    except Exception as e:
        print(f"[AI Sheriff] Email failed: {e}")

async def send_welcome_email(to_email, full_name, auth_key, tier):
    if not SMTP_HOST:
        print(f"\n[AI Sheriff Welcome]\n  TO: {to_email}\n  AUTH KEY: {auth_key}\n")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"AI Sheriff <{FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = "🛡️ Welcome to AI Sheriff — Your Auth Key"
        msg.attach(MIMEText(f"Welcome {full_name}!\n\nYour auth key: {auth_key}\n\nDashboard: http://localhost:3000/dashboard", "plain"))
        def _send():
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
                smtp.ehlo(); smtp.starttls(); smtp.login(SMTP_USER, SMTP_PASS)
                smtp.sendmail(FROM_EMAIL, to_email, msg.as_string())
        await asyncio.to_thread(_send)
    except Exception as e:
        print(f"[AI Sheriff] Welcome email failed: {e}")
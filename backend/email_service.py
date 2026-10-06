import os
import re
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from email.utils import formatdate, make_msgid, formataddr
from typing import List, Dict, Any, Optional
from config import get_settings, settings
import markdown

logger = logging.getLogger("email_service")
logger.setLevel(logging.INFO)

def get_email_config() -> Dict[str, Any]:
    cfg = get_settings()
    return {
        "host": cfg.smtp_host,
        "port": cfg.smtp_port,
        "user": cfg.smtp_user,
        "password": cfg.smtp_password,
        "from_email": cfg.sender_email,
        "from_name": cfg.from_name,
        "base_url": cfg.blog_base_url.rstrip("/"),
        "configured": cfg.is_smtp_configured
    }

def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
    inline_images: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Sends an email using standard SMTP with proper RFC headers.
    Supports inline CID images via multipart/related.
    If SMTP credentials are not configured, gracefully logs the email so local development is seamless.
    """
    config = get_email_config()

    if not config["configured"]:
        print(f"\n{'=' * 60}", flush=True)
        print(f"[EMAIL SERVICE - DEV / SIMULATION MODE]", flush=True)
        print(f"To: {to_email}", flush=True)
        print(f"From: {config['from_name']} <{config['from_email']}>", flush=True)
        print(f"Subject: {subject}", flush=True)
        preview = (text_body or html_body)[:150].replace("\n", " ")
        print(f"Snippet: {preview}...", flush=True)
        print(f"(Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD in backend/.env for real delivery)", flush=True)
        print(f"{'=' * 60}\n", flush=True)
        return {
            "success": True,
            "mode": "simulation",
            "message": "Email logged to console (SMTP not configured in .env)"
        }

    try:
        domain = config["from_email"].split("@")[-1] if "@" in config["from_email"] else "gmail.com"

        if inline_images:
            # RFC 2387 multipart/related root for inline images
            msg = MIMEMultipart("related")
            msg["Subject"] = subject
            msg["From"] = formataddr((config["from_name"], config["from_email"]))
            msg["To"] = to_email
            msg["Date"] = formatdate(localtime=True)
            msg["Message-ID"] = make_msgid(domain=domain)
            msg["Reply-To"] = config["from_email"]
            msg["X-Mailer"] = "SantheriBlog-Mailer/1.0"
            msg["List-Unsubscribe"] = f"<mailto:{config['from_email']}?subject=unsubscribe>"

            msg_alt = MIMEMultipart("alternative")
            msg.attach(msg_alt)

            if text_body:
                msg_alt.attach(MIMEText(text_body, "plain", "utf-8"))
            if html_body:
                msg_alt.attach(MIMEText(html_body, "html", "utf-8"))

            for cid, img_path in inline_images.items():
                if os.path.exists(img_path):
                    with open(img_path, "rb") as f:
                        img_data = f.read()
                    subtype = "png" if img_path.lower().endswith(".png") else "jpeg"
                    img_part = MIMEImage(img_data, _subtype=subtype)
                    img_part.add_header("Content-ID", f"<{cid}>")
                    img_part.add_header("Content-Disposition", "inline", filename=os.path.basename(img_path))
                    msg.attach(img_part)
        else:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = formataddr((config["from_name"], config["from_email"]))
            msg["To"] = to_email
            msg["Date"] = formatdate(localtime=True)
            msg["Message-ID"] = make_msgid(domain=domain)
            msg["Reply-To"] = config["from_email"]
            msg["X-Mailer"] = "SantheriBlog-Mailer/1.0"
            msg["List-Unsubscribe"] = f"<mailto:{config['from_email']}?subject=unsubscribe>"

            if text_body:
                msg.attach(MIMEText(text_body, "plain", "utf-8"))
            if html_body:
                msg.attach(MIMEText(html_body, "html", "utf-8"))

        # Connect and send
        if config["port"] == 465:
            server = smtplib.SMTP_SSL(config["host"], config["port"], timeout=20)
        else:
            server = smtplib.SMTP(config["host"], config["port"], timeout=20)
            server.ehlo()
            server.starttls()
            server.ehlo()

        server.login(config["user"], config["password"])
        server.sendmail(config["from_email"], [to_email], msg.as_string())
        server.quit()

        print(f"[EMAIL SERVICE] Successfully sent email to {to_email}: {subject}", flush=True)
        return {"success": True, "mode": "smtp", "message": f"Delivered to {to_email}"}
    except Exception as e:
        error_msg = f"Failed to send email to {to_email} via SMTP: {str(e)}"
        print(f"[EMAIL SERVICE ERROR] {error_msg}", flush=True)
        return {"success": False, "mode": "smtp", "error": error_msg}

def build_test_email(to_email: str, base_url: str) -> Dict[str, str]:
    subject = "Santheri Blog · Email Delivery Test"
    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #171717;
      background-color: #faf9f6;
      margin: 0;
      padding: 40px 20px;
    }}
    .container {{
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #dedcd6;
      border-radius: 6px;
    }}
    .brand {{
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #171717;
      margin-bottom: 24px;
      display: inline-block;
      text-decoration: none;
    }}
    .badge {{
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background-color: #ecfdf5;
      color: #059669;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 16px;
    }}
    h1 {{
      font-size: 24px;
      font-weight: 600;
      color: #171717;
      margin: 0 0 16px;
      line-height: 1.25;
    }}
    p {{
      color: #55534e;
      font-size: 15px;
      margin-bottom: 18px;
    }}
    .box {{
      background: #fbfbf9;
      border: 1px solid #e7e5e4;
      border-radius: 4px;
      padding: 16px 20px;
      margin: 20px 0;
      font-size: 13px;
      color: #44403c;
    }}
    .btn {{
      display: inline-block;
      background-color: #171717;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 3px;
      margin-top: 10px;
      margin-bottom: 20px;
    }}
    .footer {{
      margin-top: 30px;
      padding-top: 18px;
      border-top: 1px solid #dedcd6;
      font-size: 12px;
      color: #949088;
    }}
  </style>
</head>
<body>
  <div class="container">
    <a href="{base_url}" class="brand">SANTHERI</a>
    <br>
    <span class="badge">SMTP Verified</span>
    <h1>Test Email Delivery Confirmed</h1>
    <p>Your blog's email notification service is working properly with Gmail SMTP.</p>
    <div class="box">
      <strong>Recipient:</strong> {to_email}<br>
      <strong>Status:</strong> Active Subscriber<br>
      <strong>Feature:</strong> Automatic email notifications on new stories
    </div>
    <a href="{base_url}/writing" class="btn">View Published Stories →</a>
    <div class="footer">
      Sent from <a href="{base_url}" style="color: #77736b;">Santheri's Personal Blog</a>.
    </div>
  </div>
</body>
</html>"""
    text = f"""SANTHERI BLOG · EMAIL DELIVERY TEST
SMTP Verified!

Your blog's email notification service is working properly with Gmail SMTP.
Recipient: {to_email}
Status: Active Subscriber

View Published Stories: {base_url}/writing
"""
    return {"subject": subject, "html": html, "text": text}

def build_welcome_email(to_email: str, base_url: str) -> Dict[str, str]:
    subject = "Welcome to Santheri's Stories"
    
    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #171717;
      background-color: #faf9f6;
      margin: 0;
      padding: 40px 20px;
    }}
    .container {{
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #dedcd6;
      border-radius: 6px;
    }}
    .brand {{
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #171717;
      margin-bottom: 30px;
      display: inline-block;
      text-decoration: none;
    }}
    h1 {{
      font-size: 26px;
      font-weight: 600;
      color: #171717;
      margin-top: 0;
      margin-bottom: 20px;
      line-height: 1.25;
    }}
    p {{
      color: #55534e;
      font-size: 16px;
      margin-bottom: 20px;
    }}
    .btn {{
      display: inline-block;
      background-color: #171717;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 3px;
      margin-top: 15px;
      margin-bottom: 25px;
    }}
    .footer {{
      margin-top: 35px;
      padding-top: 20px;
      border-top: 1px solid #dedcd6;
      font-size: 13px;
      color: #949088;
    }}
    .footer a {{
      color: #77736b;
      text-decoration: underline;
    }}
  </style>
</head>
<body>
  <div class="container">
    <a href="{base_url}" class="brand">SANTHERI</a>
    <h1>You're subscribed.</h1>
    <p>Thank you for joining my reading list. You'll now receive an email whenever I publish a new story about <strong>Travel</strong>, <strong>Technology</strong>, or <strong>Life</strong>.</p>
    <p>No spam, ever — just thoughtful essays, travelogues, and technical field notes.</p>
    <a href="{base_url}/writing" class="btn">Explore Stories →</a>
    <div class="footer">
      Sent from <a href="{base_url}">Santheri's Personal Blog</a>.<br>
      You are receiving this because you subscribed at {to_email}.
    </div>
  </div>
</body>
</html>"""

    text = f"""SANTHERI
You're subscribed!

Thank you for joining my reading list. You'll now receive an email whenever I publish a new story about Travel, Technology, or Life.

Explore existing stories: {base_url}/writing

Sent from Santheri's Personal Blog ({base_url})
"""
    return {"subject": subject, "html": html, "text": text}

def extract_three_fourths_content(raw_content: str) -> tuple[str, bool]:
    """
    Extracts approximately 75% (3/4th) of the post content,
    ensuring it breaks cleanly on natural paragraph boundaries.
    Returns (truncated_content, has_more).
    """
    if not raw_content or not raw_content.strip():
        return ("", False)

    blocks = [b.strip() for b in raw_content.split("\n\n") if b.strip()]
    if len(blocks) <= 1:
        text = raw_content.strip()
        if len(text) < 400:
            return (text, False)
        cutoff_len = int(len(text) * 0.75)
        space_idx = text.rfind(" ", 0, cutoff_len)
        if space_idx != -1:
            return (text[:space_idx] + "...", True)
        return (text[:cutoff_len] + "...", True)

    cutoff_blocks = max(1, int(round(len(blocks) * 0.75)))
    has_more = cutoff_blocks < len(blocks)
    three_fourths_md = "\n\n".join(blocks[:cutoff_blocks])
    return (three_fourths_md, has_more)

def build_new_post_email(post: Any, base_url: str, to_email: str) -> Dict[str, Any]:
    post_url = f"{base_url}/writing/{post.slug or post.id}"
    subject = f"New story: {post.title}"
    category_label = (post.category or "Writing").upper()
    description = (post.description or "").strip()
    reading_time = getattr(post, "reading_time", "3 min read") or "3 min read"

    upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    inline_images: Dict[str, str] = {}

    # 1. Cover Image Processing
    cover_image_html = ""
    if post.cover_image:
        cover_val = post.cover_image.strip()
        if cover_val.startswith("http://") or cover_val.startswith("https://"):
            cover_image_html = f'''
            <div style="margin: 20px 0 28px; border-radius: 6px; overflow: hidden; border: 1px solid #dedcd6;">
              <img src="{cover_val}" alt="{post.title}" style="width: 100%; max-height: 420px; object-fit: cover; display: block;" />
            </div>'''
        else:
            clean_name = os.path.basename(cover_val)
            local_img_path = os.path.join(upload_dir, clean_name)
            if os.path.exists(local_img_path):
                cid = "post_cover_image"
                inline_images[cid] = local_img_path
                cover_image_html = f'''
                <div style="margin: 20px 0 28px; border-radius: 6px; overflow: hidden; border: 1px solid #dedcd6;">
                  <img src="cid:{cid}" alt="{post.title}" style="width: 100%; max-height: 420px; object-fit: cover; display: block;" />
                </div>'''
            else:
                abs_url = f"{base_url.rstrip('/')}/{cover_val.lstrip('/')}"
                cover_image_html = f'''
                <div style="margin: 20px 0 28px; border-radius: 6px; overflow: hidden; border: 1px solid #dedcd6;">
                  <img src="{abs_url}" alt="{post.title}" style="width: 100%; max-height: 420px; object-fit: cover; display: block;" />
                </div>'''

    # 2. Extract 3/4th of story content cleanly
    raw_content = post.content or ""
    three_fourths_md, has_more = extract_three_fourths_content(raw_content)

    # Convert markdown to clean HTML
    body_html = markdown.markdown(three_fourths_md, extensions=['extra', 'nl2br'])

    # 3. Check for any local inline images in the story content
    inline_img_idx = 0
    def replace_content_img(match):
        nonlocal inline_img_idx
        prefix, full_path, filename, suffix = match.groups()
        local_file = os.path.join(upload_dir, filename)
        if os.path.exists(local_file):
            inline_img_idx += 1
            cid = f"post_content_img_{inline_img_idx}"
            inline_images[cid] = local_file
            return f'{prefix}cid:{cid}{suffix}'
        return match.group(0)

    img_regex = re.compile(r'(<img[^>]+src=["\'])(/uploads/([^"\']+))(["\'])', re.IGNORECASE)
    body_html = img_regex.sub(replace_content_img, body_html)

    # 4. Continuation Call-to-action
    if has_more:
        continue_reading_html = f'''
        <div style="margin: 40px 0 24px; padding: 28px 24px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; text-align: center;">
          <div style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #78716c; background: #f5f5f4; padding: 4px 12px; border-radius: 12px; margin-bottom: 12px;">
            ✦ Reading Progress: 75% Completed
          </div>
          <h3 style="font-size: 19px; font-weight: 600; color: #171717; margin: 0 0 8px;">Enjoying this story?</h3>
          <p style="font-size: 14px; color: #57534e; margin: 0 0 20px; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
            You have read three-quarters of this piece. Dive into the conclusion, interactive details, and explore more on the blog.
          </p>
          <a href="{post_url}" style="display: inline-block; background-color: #171717; color: #ffffff !important; text-decoration: none; padding: 13px 30px; font-size: 15px; font-weight: 600; border-radius: 4px;">
            Continue Reading Full Story on the Blog →
          </a>
        </div>
        '''
    else:
        continue_reading_html = f'''
        <div style="margin: 40px 0 24px; text-align: center;">
          <a href="{post_url}" style="display: inline-block; background-color: #171717; color: #ffffff !important; text-decoration: none; padding: 13px 30px; font-size: 15px; font-weight: 600; border-radius: 4px;">
            View Story & Discussion on Blog →
          </a>
        </div>
        '''

    desc_html = f'<p class="desc">{description}</p>' if description else ""

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #171717;
      background-color: #faf9f6;
      margin: 0;
      padding: 40px 20px;
    }}
    .container {{
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      padding: 44px;
      border: 1px solid #dedcd6;
      border-radius: 8px;
    }}
    .brand {{
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #171717;
      margin-bottom: 24px;
      display: inline-block;
      text-decoration: none;
    }}
    .category-tag {{
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #77736b;
      margin-bottom: 8px;
    }}
    h1.title {{
      font-size: 30px;
      font-weight: 600;
      color: #171717;
      margin: 6px 0 14px;
      line-height: 1.25;
    }}
    .desc {{
      color: #55534e;
      font-size: 17px;
      line-height: 1.6;
      margin-bottom: 20px;
      font-style: italic;
    }}
    .story-body {{
      font-size: 16px;
      line-height: 1.75;
      color: #292524;
      margin-top: 24px;
    }}
    .story-body p {{
      margin-top: 0;
      margin-bottom: 20px;
    }}
    .story-body h1, .story-body h2, .story-body h3, .story-body h4 {{
      color: #171717;
      font-weight: 600;
      line-height: 1.35;
      margin-top: 32px;
      margin-bottom: 14px;
    }}
    .story-body h2 {{
      font-size: 22px;
      border-bottom: 1px solid #f0eee6;
      padding-bottom: 8px;
    }}
    .story-body h3 {{
      font-size: 19px;
    }}
    .story-body ul, .story-body ol {{
      margin-top: 0;
      margin-bottom: 20px;
      padding-left: 24px;
    }}
    .story-body li {{
      margin-bottom: 8px;
    }}
    .story-body blockquote {{
      margin: 24px 0;
      padding: 12px 20px;
      border-left: 3px solid #171717;
      background: #fafaf9;
      color: #57534e;
      font-style: italic;
    }}
    .story-body pre {{
      background: #f5f5f4;
      border: 1px solid #e7e5e4;
      border-radius: 4px;
      padding: 14px;
      overflow-x: auto;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 13px;
      line-height: 1.5;
      margin: 20px 0;
    }}
    .story-body code {{
      background: #f5f5f4;
      border: 1px solid #e7e5e4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 13px;
      color: #1c1917;
    }}
    .story-body hr {{
      border: none;
      border-top: 1px solid #e7e5e4;
      margin: 32px 0;
    }}
    .story-body img {{
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 16px 0;
      display: block;
      border: 1px solid #dedcd6;
    }}
    .footer {{
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #dedcd6;
      font-size: 13px;
      color: #949088;
      line-height: 1.6;
    }}
    .footer a {{
      color: #77736b;
      text-decoration: underline;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div>
      <a href="{base_url}" class="brand">SANTHERI</a>
    </div>
    <span class="category-tag">{category_label} · {reading_time}</span>
    <h1 class="title">{post.title}</h1>
    {desc_html}
    {cover_image_html}
    <div class="story-body">
      {body_html}
    </div>
    {continue_reading_html}
    <div class="footer">
      Sent to {to_email} from <a href="{base_url}">Santheri's Personal Blog</a>.<br>
      To manage your subscription or unsubscribe, reply directly to this email.
    </div>
  </div>
</body>
</html>"""

    text = f"""SANTHERI · {category_label}
{post.title}
{reading_time}

{description}

{'[Cover Image: Attached/Available online]' if post.cover_image else ''}

---

{three_fourths_md}

---
{'[75% Completed - Continue reading the full story at: ' + post_url + ']' if has_more else '[Read on blog: ' + post_url + ']'}

Sent to {to_email} from Santheri's Personal Blog ({base_url}).
"""
    return {
        "subject": subject,
        "html": html,
        "text": text,
        "inline_images": inline_images
    }

def dispatch_post_notification_to_subscribers(post: Any, subscriber_emails: List[str]):
    """
    Background worker that dispatches notification emails to all active subscribers.
    """
    config = get_email_config()
    if not subscriber_emails:
        print("[EMAIL SERVICE] No active subscribers to notify.", flush=True)
        return

    print(f"[EMAIL SERVICE] Starting broadcast of new post '{post.title}' to {len(subscriber_emails)} subscriber(s)...", flush=True)

    success_count = 0
    fail_count = 0

    for email in subscriber_emails:
        payload = build_new_post_email(post, config["base_url"], email)
        res = send_email(
            to_email=email,
            subject=payload["subject"],
            html_body=payload["html"],
            text_body=payload["text"],
            inline_images=payload.get("inline_images")
        )
        if res.get("success"):
            success_count += 1
        else:
            fail_count += 1

    print(f"[EMAIL SERVICE] Broadcast completed for '{post.title}': {success_count} sent, {fail_count} failed.", flush=True)

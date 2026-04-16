import resend
from app.config import get_settings

settings = get_settings()
resend.api_key = settings.resend_api_key


async def send_escalation_email(
    client_name: str,
    client_contact: str,
    channel: str,
    reason: str,
    urgency: str,
    original_message: str,
):
    urgency_color = "#FF0000" if urgency.lower() == "high" else "#FFA500"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: {urgency_color}; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🚨 Human Escalation Required</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 140px;"><strong>Client:</strong></td><td>{client_name}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>Contact:</strong></td><td>{client_contact}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>Channel:</strong></td><td>{channel}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>Urgency:</strong></td>
                    <td><span style="background-color: {urgency_color}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px;">{urgency.upper()}</span></td>
                </tr>
                <tr><td style="padding: 8px 0; color: #666;"><strong>Reason:</strong></td><td>{reason}</td></tr>
            </table>
            <div style="margin-top: 20px; background-color: #fff; border-left: 4px solid {urgency_color}; padding: 16px;">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;"><strong>Client's Message:</strong></p>
                <p style="margin: 0; color: #333; font-style: italic;">"{original_message}"</p>
            </div>
        </div>
        <div style="background-color: #f0f0f0; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">AI Agent — Automated Escalation System</p>
        </div>
    </div>
    """

    try:
        params = {
            "from": "AI Agent <onboarding@resend.dev>",
            "to": [settings.alert_email],
            "subject": f"🚨 [{urgency.upper()}] Escalation — {client_name} via {channel}",
            "html": html_content,
        }
        resend.Emails.send(params)
        print(f"✅ Escalation email sent to {settings.alert_email}")
    except Exception as e:
        print(f"ERROR Email: {e}")


async def send_task_created_email(
    client_name: str,
    client_email: str,
    task_title: str,
    task_description: str,
    task_priority: str,
    trello_url: str,
):
    priority_color = {
        "critical": "#FF0000",
        "high": "#FF6B00",
        "medium": "#FFA500",
        "low": "#4CAF50",
    }.get(task_priority.lower(), "#666666")

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #7c6fff; margin: 0; font-size: 22px;">✅ Support Task Created</h1>
            <p style="color: #888; margin: 8px 0 0; font-size: 14px;">DS Technologies (Pvt.) Limited</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 28px; border: 1px solid #e0e0e0;">
            <p style="color: #333; font-size: 15px; margin-top: 0;">Dear <strong>{client_name}</strong>,</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Your support request has been received and a task has been created for our team.
                We will get back to you as soon as possible.
            </p>
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Task:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-weight: 600;">{task_title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Priority:</strong></td>
                        <td style="padding: 8px 0;">
                            <span style="background: {priority_color}22; color: {priority_color}; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                {task_priority.upper()}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Details:</strong></td>
                        <td style="padding: 8px 0; color: #555; font-size: 13px; line-height: 1.5;">{task_description}</td>
                    </tr>
                </table>
            </div>
            {f'<div style="text-align: center; margin: 24px 0;"><a href="{trello_url}" style="background: #7c6fff; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">View Task on Trello →</a></div>' if trello_url else ''}
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Our team will review your request and reach out shortly.
            </p>
        </div>
        <div style="background: #f0f0f0; padding: 16px 28px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
                DS Technologies (Pvt.) Limited — Faisalabad, Pakistan<br>
                <a href="https://digitalsolutions.com.pk" style="color: #7c6fff;">digitalsolutions.com.pk</a>
            </p>
        </div>
    </div>
    """

    try:
        params = {
            "from": "DS Technologies <onboarding@resend.dev>",
            "to": [settings.alert_email],  # apni email
            "reply_to": client_email,       # client ka email reply-to mein
            "subject": f"✅ Task Created for {client_name} ({client_email})",
            "html": html_content,
        }
        resend.Emails.send(params)
        print(f"✅ Task email sent to {client_email}")
    except Exception as e:
        print(f"ERROR Task Email: {e}")

async def send_task_status_email(
    client_name: str,
    client_email: str,
    task_title: str,
    new_status: str,
    notification_text: str,
):
    """Send task status update email to client."""

    status_color = {
        "ToDo": "#888888",
        "In Progress": "#FFA500",
        "In Review": "#7c6fff",
        "Done": "#4CAF50",
    }.get(new_status, "#888888")

    status_emoji = {
        "ToDo": "📋",
        "In Progress": "⚙️",
        "In Review": "🔍",
        "Done": "✅",
    }.get(new_status, "📌")

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #7c6fff; margin: 0; font-size: 22px;">{status_emoji} Task Status Update</h1>
            <p style="color: #888; margin: 8px 0 0; font-size: 14px;">DS Technologies (Pvt.) Limited</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 28px; border: 1px solid #e0e0e0;">
            <p style="color: #333; font-size: 15px; margin-top: 0;">Dear <strong>{client_name}</strong>,</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
                There is an update on your support task.
            </p>
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Task:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-weight: 600;">{task_title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>New Status:</strong></td>
                        <td style="padding: 8px 0;">
                            <span style="background: {status_color}22; color: {status_color}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                                {status_emoji} {new_status}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
                {"Your issue has been resolved! Please let us know if everything is working correctly." if new_status == "Done" else "We will keep you updated as progress is made."}
            </p>
        </div>
        <div style="background: #f0f0f0; padding: 16px 28px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
                DS Technologies (Pvt.) Limited — Faisalabad, Pakistan<br>
                <a href="https://digitalsolutions.com.pk" style="color: #7c6fff;">digitalsolutions.com.pk</a>
            </p>
        </div>
    </div>
    """

    try:
        params = {
            "from": "DS Technologies <onboarding@resend.dev>",
            "to": [settings.alert_email],
            "reply_to": client_email,
            "subject": f"{status_emoji} Task Update — {task_title} is now {new_status}",
            "html": html_content,
        }
        resend.Emails.send(params)
        print(f"✅ Status email sent for {task_title}")
    except Exception as e:
        print(f"ERROR Status Email: {e}")
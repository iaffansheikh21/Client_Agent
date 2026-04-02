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
    """Send escalation alert email to team."""

    urgency_color = "#FF0000" if urgency.lower() == "high" else "#FFA500"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <div style="background-color: {urgency_color}; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🚨 Human Escalation Required</h1>
        </div>

        <div style="background-color: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0;">
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Client:</strong></td>
                    <td style="padding: 8px 0;">{client_name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Contact:</strong></td>
                    <td style="padding: 8px 0;">{client_contact}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Channel:</strong></td>
                    <td style="padding: 8px 0;">{channel}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Urgency:</strong></td>
                    <td style="padding: 8px 0;">
                        <span style="background-color: {urgency_color}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px;">
                            {urgency.upper()}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Reason:</strong></td>
                    <td style="padding: 8px 0;">{reason}</td>
                </tr>
            </table>

            <div style="margin-top: 20px; background-color: #fff; border-left: 4px solid {urgency_color}; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;"><strong>Client's Message:</strong></p>
                <p style="margin: 0; color: #333; font-style: italic;">"{original_message}"</p>
            </div>

            <div style="margin-top: 24px; padding: 16px; background-color: #fff3cd; border-radius: 4px;">
                <p style="margin: 0; color: #856404;">
                    ⚡ Please respond to this client as soon as possible on <strong>{channel}</strong>.
                </p>
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
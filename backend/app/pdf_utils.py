from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration # <--- MUST ADD THIS
from datetime import datetime
import io
import base64
import os
from pathlib import Path

def create_certificate_pdf(credential_data, verification_url, qr_code_path):
    # 1. Initialize Font Config
    font_config = FontConfiguration()
    
    # 2. Setup Paths
    BASE_DIR = Path(__file__).resolve().parent.parent
    # Replace 'Inter-Regular.ttf' with your actual filename in assets/fonts/
    font_path = BASE_DIR / "app" / "assets" / "fonts" / "Inter-Regular.ttf"
    font_uri = font_path.as_uri()
    
    # 3. Handle Images
    with open(qr_code_path, 'rb') as f:
        qr_base64 = base64.b64encode(f.read()).decode()
    
    shield_path = BASE_DIR / "app" / "public" / "shield.png"
    shield_base64 = ""
    if shield_path.exists():
        with open(shield_path, 'rb') as f:
            shield_base64 = base64.b64encode(f.read()).decode()

    # 4. Data Processing
    dt = datetime.fromtimestamp(credential_data["issueDate"])
    date_str = dt.strftime('%B %d, %Y')
    time_str = dt.strftime('%I:%M %p')
    
    issuer_addr = credential_data["issuer"]
    if len(issuer_addr) > 35:
        issuer_addr = f"{issuer_addr[:16]}...{issuer_addr[-16:]}"
    
    description = credential_data["description"]
    if len(description) > 80:
        description = description[:77] + "..."

    # 5. HTML with Modern Font Logic
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @font-face {{
                font-family: 'ModernFont';
                src: url('{font_uri}');
            }}

            @page {{
                size: letter;
                margin: 0; /* Removing page margin to control border via container */
            }}
            
            body {{
                font-family: 'ModernFont', sans-serif;
                margin: 0;
                padding: 0.2in; /* This creates the outer "white" space */
                background-color: white;
            }}
            
            .container {{
                border: 1px solid #e2e8f0;
                position: relative;
                height: 10.6in; /* 11in total - (0.2in padding * 2) */
                box-sizing: border-box;
            }}
            
            .header {{
                background-color: #18181b;
                padding: 30px 40px;
                color: white;
                border-bottom: 3px solid #52525b;
            }}
            
            .logo {{
                display: flex;
                align-items: center;
                font-size: 18px;
                font-weight: bold;
            }}

            .logo-img {{
                width: 20px;
                height: 20px;
                margin-right: 8px;
            }}
            
            .main-content {{
                padding: 40px 60px;
                text-align: center;
            }}
            
            .certificate-title {{
                font-size: 32px;
                font-weight: bold;
                margin: 20px 0 10px 0;
                color: #18181b;
            }}
            
            .recipient-name {{
                font-size: 42px;
                font-weight: bold;
                margin: 15px 0;
            }}
            
            .credential-card {{
                background-color: #f1f5f9;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 20px 30px;
                margin: 20px auto;
                width: 80%;
            }}
            
            .info-section {{
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
            }}
            
            .info-card {{
                flex: 1;
                background-color: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 15px;
                text-align: left;
                margin: 0 10px;
            }}
            
            .qr-container {{
                position: absolute;
                bottom: 10px;
                right: 40px;
                text-align: center;
            }}
            
            .qr-code {{
                width: 60px;
                height: 60px;
            }}
            
            .footer {{
                position: absolute;
                bottom: 20px;
                width: 100%;
                text-align: center;
                font-size: 8px;
                color: #94a3b8;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <img src="data:image/png;base64,{shield_base64}" class="logo-img">
                    <span>CredentialChain</span>
                </div>
            </div>
            <div class="main-content">
                <h1 class="certificate-title">Certificate of Completion</h1>
                <div style="font-size: 11px; color: #64748b; letter-spacing: 2px; font-weight: bold;">BLOCKCHAIN-VERIFIED CREDENTIAL</div>
                <div style="width: 250px; height: 1px; background-color: #cbd5e1; margin: 20px auto;"></div>
                
                <p>This is to certify that</p>
                <h2 class="recipient-name">{credential_data["recipientName"]}</h2>
                <p style="color: #94a3b8;">{credential_data["recipientEmail"]}</p>
                
                <p>has successfully completed</p>
                <div class="credential-card">
                    <div style="font-size: 24px; font-weight: bold;">{credential_data["credentialType"]}</div>
                </div>
                <p style="font-size: 11px; color: #64748b;">{description}</p>
                
                <div class="info-section">
                    <div class="info-card">
                        <div style="font-size: 10px; font-weight: bold; color: #64748b;">ISSUED BY</div>
                        <div style="font-size: 14px; font-weight: bold;">{credential_data["issuerName"]}</div>
                        <div style="font-size: 8px; color: #94a3b8;">{issuer_addr}</div>
                    </div>
                    <div class="info-card">
                        <div style="font-size: 10px; font-weight: bold; color: #64748b;">DATE ISSUED</div>
                        <div style="font-size: 14px; font-weight: bold;">{date_str}</div>
                        <div style="font-size: 8px; color: #94a3b8;">{time_str}</div>
                    </div>
                </div>
            </div>
            <div class="qr-container">
                <img src="data:image/png;base64,{qr_base64}" class="qr-code">
                <div style="font-size: 7px; font-weight: bold;">SCAN TO VERIFY</div>
            </div>
            <div class="footer">
                <div>Credential ID: {credential_data["credentialId"]}</div>
                <div>{verification_url}</div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # 6. Generate PDF
    buffer = io.BytesIO()
    # Pass font_config here
    HTML(string=html_content).write_pdf(buffer, font_config=font_config)
    
    buffer.seek(0)
    return buffer
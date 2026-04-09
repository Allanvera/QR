let qrCodeInstance = null;
let ultimaUrl = '';
let logoPersonalizado = '';

function generarQR() {
    const input = document.getElementById('qrInput').value.trim();
    const logoInput = document.getElementById('logoInput').value.trim();
    const colorDark = document.getElementById('colorDark').value;
    const colorLight = document.getElementById('colorLight').value;
    const errorMsg = document.getElementById('errorMsg');
    
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
    
    if (!input) {
        errorMsg.textContent = 'Por favor, ingresa un texto o URL';
        errorMsg.style.display = 'block';
        return;
    }
    
    const qrCodeDiv = document.getElementById('qrCode');
    qrCodeDiv.innerHTML = '';
    ultimaUrl = input;
    logoPersonalizado = logoInput;
    
    try {
        qrCodeInstance = new QRCode(qrCodeDiv, {
            text: input,
            width: 220,
            height: 220,
            colorDark: colorDark,
            colorLight: colorLight,
            correctLevel: QRCode.CorrectLevel.H
        });
        
        setTimeout(() => agregarLogo(qrCodeDiv, input, logoInput), 300);
        
        document.getElementById('btnDescargar').disabled = false;
        document.getElementById('btnLimpiar').disabled = false;
    } catch (error) {
        errorMsg.textContent = 'Error al generar el QR. Intenta de nuevo.';
        errorMsg.style.display = 'block';
        console.error(error);
    }
}

function agregarLogo(qrCodeDiv, input, logoUrl) {
    let canvas = qrCodeDiv.querySelector('canvas');
    
    if (!canvas) {
        const img = qrCodeDiv.querySelector('img');
        if (img) {
            canvas = document.createElement('canvas');
            canvas.width = 220;
            canvas.height = 220;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 220, 220);
        }
    }
    
    if (!canvas) {
        setTimeout(() => agregarLogo(qrCodeDiv, input, logoUrl), 200);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const logoSize = 35;
    const centerX = (canvas.width - logoSize) / 2;
    const centerY = (canvas.height - logoSize) / 2;
    
    // Fondo blanco redondeado para el logo
    ctx.fillStyle = '#ffffff';
    ctx.save();
    ctx.globalAlpha = 0.95;
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(centerX - 2, centerY - 2, logoSize + 4, logoSize + 4, 6);
        ctx.fill();
    } else {
        ctx.fillRect(centerX - 2, centerY - 2, logoSize + 4, logoSize + 4);
    }
    ctx.restore();
    
    let logoSrc = '';
    
    if (logoUrl) {
        logoSrc = logoUrl;
    } else {
        const urlMatch = input.match(/^https?:\/\/([^\/]+)/);
        if (urlMatch) {
            const domain = urlMatch[1];
            logoSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        }
    }
    
    if (logoSrc) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX + logoSize/2, centerY + logoSize/2, logoSize/2 - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, centerX, centerY, logoSize, logoSize);
            ctx.restore();
        };
        img.onerror = function() {
            dibujarLogoDefault(ctx, centerX, centerY, logoSize);
        };
        img.src = logoSrc;
    } else {
        dibujarLogoDefault(ctx, centerX, centerY, logoSize);
    }
}

function dibujarLogoDefault(ctx, x, y, size) {
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size/2}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QR', x + size/2, y + size/2);
}

function descargarQR() {
    const qrCodeDiv = document.getElementById('qrCode');
    const canvas = qrCodeDiv.querySelector('canvas');
    
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'codigo-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function limpiar() {
    document.getElementById('qrInput').value = '';
    document.getElementById('logoInput').value = '';
    document.getElementById('qrCode').innerHTML = '';
    document.getElementById('btnDescargar').disabled = true;
    document.getElementById('btnLimpiar').disabled = true;
    document.getElementById('errorMsg').style.display = 'none';
    qrCodeInstance = null;
    ultimaUrl = '';
    logoPersonalizado = '';
}

// Permitir generar QR al presionar Enter
document.getElementById('qrInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generarQR();
    }
});

document.getElementById('logoInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generarQR();
    }
});

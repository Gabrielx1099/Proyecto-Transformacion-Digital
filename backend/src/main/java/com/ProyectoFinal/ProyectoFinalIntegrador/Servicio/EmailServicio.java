package com.ProyectoFinal.ProyectoFinalIntegrador.Servicio;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Venta;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.annotation.PostConstruct;
import jakarta.mail.*;
import jakarta.mail.internet.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Properties;

@Service
public class EmailServicio {

    private static final Logger logger = LoggerFactory.getLogger(EmailServicio.class);

@Value("${spring.mail.host:smtp.gmail.com}")
private String mailHost;

@Value("${spring.mail.port:587}")
private String mailPort;

@Value("${spring.mail.username:}")
private String mailUsername;

@Value("${spring.mail.password:}")
private String mailPassword;

@Value("${spring.mail.properties.mail.smtp.auth:true}")
private String mailAuth;

@Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
private String mailStartTls;

@Value("${app.nombre:Pañalería Online}")
private String nombreEmpresa;

// Agregar validación en el constructor o método @PostConstruct
@PostConstruct
public void validarConfiguracion() {
    if (mailUsername == null || mailUsername.isEmpty()) {
        logger.warn("Configuración de email no encontrada. El servicio de email no funcionará correctamente.");
        logger.warn("Agrega spring.mail.username y spring.mail.password en application.properties");
    }
}

    /**
     * Envía el comprobante de venta por correo electrónico
     */
    public boolean enviarComprobante(String emailDestino, String tipoComprobante, 
                                byte[] pdfComprobante, Venta venta) {
        try {
            logger.info("Enviando {} a: {}", tipoComprobante, emailDestino);

            // Configurar propiedades del servidor SMTP
            Properties props = configurarPropiedadesEmail();
            
            // Crear autenticador
            Authenticator auth = new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(mailUsername, mailPassword);
                }
            };

            // Crear sesión
            Session session = Session.getInstance(props, auth);

            // Crear mensaje
            Message mensaje = crearMensajeComprobante(session, emailDestino, 
                                                    tipoComprobante, pdfComprobante, venta);

            // Enviar mensaje
            Transport.send(mensaje);

            logger.info("Comprobante enviado exitosamente a: {}", emailDestino);
            return true;

        } catch (Exception e) {
            logger.error("Error enviando comprobante a {}: {}", emailDestino, e.getMessage());
            return false;
        }
    }

    /**
     * Envía notificación de confirmación de pedido
     */
    public boolean enviarConfirmacionPedido(String emailDestino, Venta venta) {
        try {
            logger.info("Enviando confirmación de pedido a: {}", emailDestino);

            Properties props = configurarPropiedadesEmail();
            Authenticator auth = new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(mailUsername, mailPassword);
                }
            };

            Session session = Session.getInstance(props, auth);
            Message mensaje = crearMensajeConfirmacion(session, emailDestino, venta);

            Transport.send(mensaje);

            logger.info("Confirmación de pedido enviada exitosamente a: {}", emailDestino);
            return true;

        } catch (Exception e) {
            logger.error("Error enviando confirmación a {}: {}", emailDestino, e.getMessage());
            return false;
        }
    }

    /**
     * Envía notificación de cambio de estado del pedido
     */
    public boolean enviarNotificacionEstado(String emailDestino, Venta venta, String nuevoEstado) {
        try {
            logger.info("Enviando notificación de estado {} a: {}", nuevoEstado, emailDestino);

            Properties props = configurarPropiedadesEmail();
            Authenticator auth = new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(mailUsername, mailPassword);
                }
            };

            Session session = Session.getInstance(props, auth);
            Message mensaje = crearMensajeEstado(session, emailDestino, venta, nuevoEstado);

            Transport.send(mensaje);

            logger.info("Notificación de estado enviada exitosamente a: {}", emailDestino);
            return true;

        } catch (Exception e) {
            logger.error("Error enviando notificación de estado a {}: {}", emailDestino, e.getMessage());
            return false;
        }
    }

    /**
     * Configura las propiedades del servidor de email
     */
    private Properties configurarPropiedadesEmail() {
        Properties props = new Properties();
        props.put("mail.smtp.host", mailHost);
        props.put("mail.smtp.port", mailPort);
        props.put("mail.smtp.auth", mailAuth);
        props.put("mail.smtp.starttls.enable", mailStartTls);
        props.put("mail.smtp.ssl.trust", mailHost);
        return props;
    }

    /**
     * Crea el mensaje de email con el comprobante adjunto
     */
    private Message crearMensajeComprobante(Session session, String emailDestino, 
                                        String tipoComprobante, byte[] pdfComprobante, 
                                        Venta venta) throws MessagingException, UnsupportedEncodingException {
        
        MimeMessage mensaje = new MimeMessage(session);
        mensaje.setFrom(new InternetAddress(mailUsername, nombreEmpresa));
        mensaje.setRecipient(Message.RecipientType.TO, new InternetAddress(emailDestino));
        
        String tipoComprobanteCapitalized = tipoComprobante.substring(0, 1).toUpperCase() + 
                                        tipoComprobante.substring(1).toLowerCase();
        mensaje.setSubject(tipoComprobanteCapitalized + " Electrónica - Pedido #" + venta.getIdVenta());

        // Crear contenido multipart
        Multipart multipart = new MimeMultipart();

        // Parte del texto
        BodyPart textoPart = new MimeBodyPart();
        textoPart.setContent(crearContenidoHtmlComprobante(venta, tipoComprobante), "text/html; charset=utf-8");
        multipart.addBodyPart(textoPart);

        // Parte del adjunto (PDF)
        if (pdfComprobante != null && pdfComprobante.length > 0) {
            BodyPart adjuntoPart = new MimeBodyPart();
            adjuntoPart.setDataHandler(new DataHandler(new ByteArrayDataSource(pdfComprobante, "application/pdf")));
            adjuntoPart.setFileName(tipoComprobanteCapitalized + "_" + venta.getIdVenta() + ".pdf");
            multipart.addBodyPart(adjuntoPart);
        }

        mensaje.setContent(multipart);
        return mensaje;
    }

    /**
     * Crea el mensaje de confirmación de pedido
     */
    private Message crearMensajeConfirmacion(Session session, String emailDestino, 
                                        Venta venta) throws MessagingException, UnsupportedEncodingException {
    
        MimeMessage mensaje = new MimeMessage(session);
        mensaje.setFrom(new InternetAddress(mailUsername, nombreEmpresa));
        mensaje.setRecipient(Message.RecipientType.TO, new InternetAddress(emailDestino));
        mensaje.setSubject("Confirmación de Pedido #" + venta.getIdVenta() + " - " + nombreEmpresa);

        String contenidoHtml = crearContenidoHtmlConfirmacion(venta);
        mensaje.setContent(contenidoHtml, "text/html; charset=utf-8");

        return mensaje;
    }

    /**
     * Crea el mensaje de notificación de estado
     */
    private Message crearMensajeEstado(Session session, String emailDestino, 
                                    Venta venta, String nuevoEstado) throws MessagingException, UnsupportedEncodingException {
        
        MimeMessage mensaje = new MimeMessage(session);
        mensaje.setFrom(new InternetAddress(mailUsername, nombreEmpresa));
        mensaje.setRecipient(Message.RecipientType.TO, new InternetAddress(emailDestino));
        mensaje.setSubject("Actualización de Pedido #" + venta.getIdVenta() + " - " + nombreEmpresa);

        String contenidoHtml = crearContenidoHtmlEstado(venta, nuevoEstado);
        mensaje.setContent(contenidoHtml, "text/html; charset=utf-8");

        return mensaje;
    }

    /**
     * Crea el contenido HTML para el email del comprobante
     */
    private String crearContenidoHtmlComprobante(Venta venta, String tipoComprobante) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='es'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>").append(tipoComprobante.toUpperCase()).append(" Electrónica</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background-color: #007bff; color: white; padding: 20px; text-align: center; }");
        html.append(".content { background-color: #f8f9fa; padding: 20px; }");
        html.append(".order-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }");
        html.append(".footer { background-color: #343a40; color: white; padding: 15px; text-align: center; }");
        html.append("table { width: 100%; border-collapse: collapse; margin: 10px 0; }");
        html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append("th { background-color: #f2f2f2; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        html.append("<div class='container'>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>").append(nombreEmpresa).append("</h1>");
        html.append("<h2>").append(tipoComprobante.toUpperCase()).append(" ELECTRÓNICA</h2>");
        html.append("</div>");

        // Contenido
        html.append("<div class='content'>");
        html.append("<h3>¡Gracias por tu compra!</h3>");
        html.append("<p>Estimado/a ").append(venta.getNombreCliente()).append(",</p>");
        html.append("<p>Te enviamos tu ").append(tipoComprobante).append(" electrónica adjunta a este correo.</p>");

        // Detalles del pedido
        html.append("<div class='order-details'>");
        html.append("<h4>Detalles del Pedido</h4>");
        html.append("<p><strong>Número de Pedido:</strong> ").append(venta.getIdVenta()).append("</p>");
        html.append("<p><strong>Fecha:</strong> ").append(venta.getFecha().toString()).append("</p>");
        html.append("<p><strong>Estado:</strong> ").append(venta.getEstado()).append("</p>");
        html.append("<p><strong>Total:</strong> S/ ").append(venta.getTotal()).append("</p>");
        
        if (venta.getDireccionEnvio() != null) {
            html.append("<p><strong>Dirección de Envío:</strong><br>");
            html.append(venta.getDireccionEnvio()).append("<br>");
            html.append(venta.getDistritoEnvio()).append(", ").append(venta.getProvinciaEnvio());
            html.append("</p>");
        }
        html.append("</div>");

        html.append("<p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>");
        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append("<p>&copy; 2024 ").append(nombreEmpresa).append(". Todos los derechos reservados.</p>");
        html.append("<p>Este es un correo automático, por favor no respondas a este mensaje.</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    /**
     * Crea el contenido HTML para el email de confirmación
     */
    private String crearContenidoHtmlConfirmacion(Venta venta) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='es'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background-color: #28a745; color: white; padding: 20px; text-align: center; }");
        html.append(".content { background-color: #f8f9fa; padding: 20px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>¡Pedido Confirmado!</h1>");
        html.append("<h2>Pedido #").append(venta.getIdVenta()).append("</h2>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<p>Estimado/a ").append(venta.getNombreCliente()).append(",</p>");
        html.append("<p>Tu pedido ha sido confirmado y se encuentra en proceso.</p>");
        html.append("<p><strong>Total:</strong> S/ ").append(venta.getTotal()).append("</p>");
        html.append("<p>Te enviaremos actualizaciones sobre el estado de tu pedido.</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    /**
     * Crea el contenido HTML para el email de estado
     */
    private String crearContenidoHtmlEstado(Venta venta, String nuevoEstado) {
        StringBuilder html = new StringBuilder();
        
        String colorEstado = obtenerColorEstado(nuevoEstado);
        String mensajeEstado = obtenerMensajeEstado(nuevoEstado);
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='es'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background-color: ").append(colorEstado).append("; color: white; padding: 20px; text-align: center; }");
        html.append(".content { background-color: #f8f9fa; padding: 20px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>Actualización de Pedido</h1>");
        html.append("<h2>Pedido #").append(venta.getIdVenta()).append("</h2>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<p>Estimado/a ").append(venta.getNombreCliente()).append(",</p>");
        html.append("<p>").append(mensajeEstado).append("</p>");
        html.append("<p><strong>Estado actual:</strong> ").append(nuevoEstado).append("</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    /**
     * Obtiene el color asociado al estado
     */
    private String obtenerColorEstado(String estado) {
        switch (estado.toUpperCase()) {
            case "PAGADA":
                return "#28a745";
            case "ENVIADA":
                return "#007bff";
            case "ENTREGADA":
                return "#17a2b8";
            case "CANCELADA":
                return "#dc3545";
            default:
                return "#6c757d";
        }
    }

    /**
     * Obtiene el mensaje asociado al estado
     */
    private String obtenerMensajeEstado(String estado) {
        switch (estado.toUpperCase()) {
            case "PAGADA":
                return "Tu pago ha sido confirmado y tu pedido está siendo preparado.";
            case "ENVIADA":
                return "Tu pedido ha sido enviado y está en camino.";
            case "ENTREGADA":
                return "¡Tu pedido ha sido entregado exitosamente!";
            case "CANCELADA":
                return "Tu pedido ha sido cancelado.";
            default:
                return "El estado de tu pedido ha sido actualizado.";
        }
    }

    /**
     * Clase auxiliar para manejar datos de bytes como fuente de datos
     */
    private static class ByteArrayDataSource implements DataSource {
        private byte[] data;
        private String type;

        public ByteArrayDataSource(byte[] data, String type) {
            this.data = data;
            this.type = type;
        }

        @Override
        public String getContentType() {
            return type;
        }

        @Override
        public java.io.InputStream getInputStream() {
            return new java.io.ByteArrayInputStream(data);
        }

        @Override
        public String getName() {
            return "ByteArrayDataSource";
        }

        @Override
        public java.io.OutputStream getOutputStream() {
            throw new UnsupportedOperationException("Not Supported");
        }
    }
}
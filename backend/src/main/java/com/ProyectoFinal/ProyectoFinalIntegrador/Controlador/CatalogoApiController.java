package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Categoria;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Marca;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Producto;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Subcategoria;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.CategoriaRespositorio;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.MarcaRespositorio;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.ProductoRespositorio;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.SubcategoriaRespositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Importaciones para Excel (Apache POI)
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

// Importaciones para PDF (iText)
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalogo")
@CrossOrigin(origins = "http://localhost:3000")
public class CatalogoApiController {

    @Autowired
    private CategoriaRespositorio categoriaRespositorio;

    @Autowired
    private MarcaRespositorio marcaRespositorio;

    @Autowired
    private ProductoRespositorio productoRespositorio;

    @Autowired
    private SubcategoriaRespositorio subcategoriaRespositorio;

    private static final String UPLOAD_DIR = "./uploads/";

    // ===============================
    // ENDPOINTS EXISTENTES
    // ===============================

    @GetMapping("/categorias")
    public List<Categoria> getCategorias() {
        return categoriaRespositorio.findAll();
    }

    @GetMapping("/marcas")
    public List<Marca> getMarcas() {
        return marcaRespositorio.findAll();
    }

    @GetMapping("/subcategorias")
    public List<Subcategoria> getSubcategorias() {
    return subcategoriaRespositorio.findAll();
}

    @GetMapping("/subcategorias/categoria/{idCategoria}")
    public List<Subcategoria> getSubcategoriasByCategoria(@PathVariable int idCategoria) {
        return subcategoriaRespositorio.findByIdCategoria(idCategoria);
    }

    @PostMapping("/productos")
    public ResponseEntity<Producto> createProducto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") BigDecimal precio,
            @RequestParam("stock") int stock,
            @RequestParam("idCategoria") int idCategoria,
            @RequestParam("idSubcategoria") int idSubcategoria,
            @RequestParam("idMarca") int idMarca) {

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            Producto nuevoProducto = new Producto();
            nuevoProducto.setNombre(nombre);
            nuevoProducto.setPrecio(precio);
            nuevoProducto.setStock(stock);
            nuevoProducto.setIdCategoria(idCategoria);
            nuevoProducto.setIdSubcategoria(idSubcategoria);
            nuevoProducto.setIdMarca(idMarca);
            nuevoProducto.setImagenUrl("/uploads/" + fileName);

            Producto productoGuardado = productoRespositorio.save(nuevoProducto);
            return ResponseEntity.ok(productoGuardado);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> listarProductos() {
        List<Producto> productos = productoRespositorio.findAll();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/productos/categoria/{idCategoria}")
    public List<Producto> getProductosByCategoria(@PathVariable int idCategoria) {
        return productoRespositorio.findProductosByIdCategoria(idCategoria);
    }

    @GetMapping("/productos/subcategoria/{idSubcategoria}")
    public List<Producto> getProductosBySubcategoria(@PathVariable int idSubcategoria) {
        return productoRespositorio.findByIdSubcategoria(idSubcategoria);
    }

    // ===============================
    // NUEVOS ENDPOINTS PARA REPORTES
    // ===============================

    @GetMapping("/productos/export/excel")
    public ResponseEntity<byte[]> exportarProductosExcel() {
        try {
            List<Producto> productos = productoRespositorio.findAll();
            List<Categoria> categorias = categoriaRespositorio.findAll();
            List<Subcategoria> subcategorias = subcategoriaRespositorio.findAll();
            List<Marca> marcas = marcaRespositorio.findAll();

            byte[] excelData = generarExcelProductos(productos, categorias, subcategorias, marcas);

            String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
            String fileName = "productos_" + fecha + ".xlsx";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", fileName);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/productos/export/pdf")
    public ResponseEntity<byte[]> exportarProductosPdf() {
        try {
            List<Producto> productos = productoRespositorio.findAll();
            List<Categoria> categorias = categoriaRespositorio.findAll();
            List<Subcategoria> subcategorias = subcategoriaRespositorio.findAll();
            List<Marca> marcas = marcaRespositorio.findAll();

            byte[] pdfData = generarPdfProductos(productos, categorias, subcategorias, marcas);

            String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
            String fileName = "productos_" + fecha + ".pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", fileName);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ===============================
    // MÉTODOS PARA GENERAR REPORTES
    // ===============================

    private byte[] generarExcelProductos(List<Producto> productos, List<Categoria> categorias, 
                                       List<Subcategoria> subcategorias, List<Marca> marcas) throws IOException {
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Productos");

        // Crear estilo para el encabezado
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Crear fila de encabezado
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Nombre", "Precio", "Stock", "Categoría", "Subcategoría", "Marca", "Imagen URL"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Llenar datos
        int rowNum = 1;
        for (Producto producto : productos) {
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(producto.getId_producto());
            row.createCell(1).setCellValue(producto.getNombre());
            row.createCell(2).setCellValue(producto.getPrecio().doubleValue());
            row.createCell(3).setCellValue(producto.getStock());
            row.createCell(4).setCellValue(obtenerNombreCategoria(producto.getIdCategoria(), categorias));
            row.createCell(5).setCellValue(obtenerNombreSubcategoria(producto.getIdSubcategoria(), subcategorias));
            row.createCell(6).setCellValue(obtenerNombreMarca(producto.getIdMarca(), marcas));
            row.createCell(7).setCellValue(producto.getImagenUrl() != null ? producto.getImagenUrl() : "Sin imagen");
        }

        // Ajustar ancho de columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Convertir a bytes
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    private byte[] generarPdfProductos(List<Producto> productos, List<Categoria> categorias, 
                                     List<Subcategoria> subcategorias, List<Marca> marcas) throws DocumentException, IOException {
        
        Document document = new Document(PageSize.A4.rotate()); // Horizontal para más espacio
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Título
        com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph title = new Paragraph("REPORTE DE PRODUCTOS", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Fecha
        com.itextpdf.text.Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
        String fechaActual = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        Paragraph dateParagraph = new Paragraph("Generado el: " + fechaActual, dateFont);
        dateParagraph.setAlignment(Element.ALIGN_RIGHT);
        dateParagraph.setSpacingAfter(20);
        document.add(dateParagraph);

        // Tabla
        PdfPTable table = new PdfPTable(7); // 7 columnas
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        // Configurar anchos de columnas
        float[] columnWidths = {1f, 2.5f, 1.2f, 1f, 1.5f, 1.5f, 1.5f};
        table.setWidths(columnWidths);

        // Encabezados
        com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        String[] headers = {"ID", "Nombre", "Precio", "Stock", "Categoría", "Subcategoría", "Marca"};
        
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(BaseColor.DARK_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            table.addCell(cell);
        }

        // Datos
        com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
        for (Producto producto : productos) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(producto.getId_producto()), dataFont)));
            table.addCell(new PdfPCell(new Phrase(producto.getNombre(), dataFont)));
            table.addCell(new PdfPCell(new Phrase("S/. " + producto.getPrecio().toString(), dataFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(producto.getStock()), dataFont)));
            table.addCell(new PdfPCell(new Phrase(obtenerNombreCategoria(producto.getIdCategoria(), categorias), dataFont)));
            table.addCell(new PdfPCell(new Phrase(obtenerNombreSubcategoria(producto.getIdSubcategoria(), subcategorias), dataFont)));
            table.addCell(new PdfPCell(new Phrase(obtenerNombreMarca(producto.getIdMarca(), marcas), dataFont)));
        }

        document.add(table);

        // Resumen
        Paragraph resumen = new Paragraph("\nTotal de productos: " + productos.size(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        resumen.setSpacingBefore(20);
        document.add(resumen);

        document.close();
        return outputStream.toByteArray();
    }
        private String obtenerNombreCategoria(int idCategoria, List<Categoria> categorias) {
        return categorias.stream()
            .filter(cat -> cat.getId_categoria() == idCategoria)
            .map(Categoria::getNombre)
            .findFirst()
            .orElse("Desconocida");
        }

        private String obtenerNombreSubcategoria(int idSubcategoria, List<Subcategoria> subcategorias) {
        return subcategorias.stream()
            .filter(sub -> sub.getId_subcategoria() == idSubcategoria)
            .map(Subcategoria::getNombre)
            .findFirst()
            .orElse("Sin subcategoría");
        }

        private String obtenerNombreMarca(int idMarca, List<Marca> marcas) {
        return marcas.stream()
            .filter(marca -> marca.getId_marca() == idMarca)
            .map(Marca::getNombre)
            .findFirst()
            .orElse("Desconocida");
        }
       

    @PutMapping("/productos/{id}")
public ResponseEntity<Producto> editarProducto(
        @PathVariable int id,
        @RequestParam(value = "file", required = false) MultipartFile file,
        @RequestParam("nombre") String nombre,
        @RequestParam("precio") BigDecimal precio,
        @RequestParam("stock") int stock,
        @RequestParam("idCategoria") int idCategoria,
        @RequestParam("idSubcategoria") int idSubcategoria,
        @RequestParam("idMarca") int idMarca) {
    
    try {
        Producto producto = productoRespositorio.findById(id).orElse(null);
        if (producto == null) {
            return ResponseEntity.notFound().build();
        }
        
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setIdCategoria(idCategoria);
        producto.setIdSubcategoria(idSubcategoria);
        producto.setIdMarca(idMarca);
        
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            producto.setImagenUrl("/uploads/" + fileName);
        }
        
        Producto productoActualizado = productoRespositorio.save(producto);
        return ResponseEntity.ok(productoActualizado);
        
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
}

@DeleteMapping("/productos/{id}")
public ResponseEntity<Void> eliminarProducto(@PathVariable int id) {
    try {
        if (productoRespositorio.existsById(id)) {
            productoRespositorio.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
    }
}    
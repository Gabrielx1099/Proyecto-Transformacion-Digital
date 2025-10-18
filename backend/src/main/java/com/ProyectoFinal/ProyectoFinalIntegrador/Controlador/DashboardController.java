package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;
import java.math.BigDecimal;

// Importaciones de Google Guava
import com.google.common.collect.Maps;
import com.google.common.collect.Lists;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableList;
import com.google.common.base.Strings;
import com.google.common.math.DoubleMath;
import com.google.common.base.Preconditions;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.Cache;
import java.util.concurrent.TimeUnit;

// Importaciones para Excel (Apache POI) - AGREGAR DESPUÉS DE LAS IMPORTACIONES EXISTENTES
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

// Importaciones adicionales para archivos
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;


@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Cache para mejorar performance en consultas frecuentes
    private final Cache<String, Object> cache = CacheBuilder.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .build();

    @GetMapping("/metricas")
    public Map<String, Object> obtenerMetricas() {
        // Usar Maps.newHashMap() de Guava para crear el mapa
        Map<String, Object> metricas = Maps.newHashMap();

        // Validar que el JdbcTemplate no sea null usando Preconditions
        Preconditions.checkNotNull(jdbcTemplate, "JdbcTemplate no puede ser null");

        String sqlIngresos = "SELECT COALESCE(SUM(dv.cantidad * p.precio), 0) as total " +
                "FROM detalle_venta dv " +
                "INNER JOIN productos p ON dv.id_producto = p.id_producto " +
                "INNER JOIN ventas v ON dv.id_venta = v.id_venta " +
                "WHERE MONTH(v.fecha_venta) = MONTH(CURRENT_DATE()) " +
                "AND YEAR(v.fecha_venta) = YEAR(CURRENT_DATE())";

        BigDecimal ingresosTotales = jdbcTemplate.queryForObject(sqlIngresos, BigDecimal.class);

        String sqlIngresosMesAnterior = "SELECT COALESCE(SUM(dv.cantidad * p.precio), 0) as total " +
                "FROM detalle_venta dv " +
                "INNER JOIN productos p ON dv.id_producto = p.id_producto " +
                "INNER JOIN ventas v ON dv.id_venta = v.id_venta " +
                "WHERE MONTH(v.fecha_venta) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) " +
                "AND YEAR(v.fecha_venta) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))";

        BigDecimal ingresosMesAnterior = jdbcTemplate.queryForObject(sqlIngresosMesAnterior, BigDecimal.class);

        // Usar DoubleMath de Guava para cálculos más seguros
        double porcentajeCambioIngresos = 0;
        if (ingresosMesAnterior.compareTo(BigDecimal.ZERO) > 0) {
            double cambio = ((ingresosTotales.subtract(ingresosMesAnterior))
                    .divide(ingresosMesAnterior, 2, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal(100))).doubleValue();
            
            // Validar que el resultado sea finito usando DoubleMath
            porcentajeCambioIngresos = DoubleMath.fuzzyEquals(cambio, Double.NaN, 0.001) ? 0 : cambio;
        }

        String sqlPedidos = "SELECT COUNT(*) FROM ventas " +
                "WHERE MONTH(fecha_venta) = MONTH(CURRENT_DATE()) " +
                "AND YEAR(fecha_venta) = YEAR(CURRENT_DATE())";

        Integer pedidosCompletados = jdbcTemplate.queryForObject(sqlPedidos, Integer.class);

        String sqlClientes = "SELECT COUNT(*) FROM usuarios " +
                "WHERE rol = 'cliente' " +
                "AND MONTH(fechacreacion) = MONTH(CURRENT_DATE()) " +
                "AND YEAR(fechacreacion) = YEAR(CURRENT_DATE())";

        Integer nuevosClientes = jdbcTemplate.queryForObject(sqlClientes, Integer.class);

        String sqlProductos = "SELECT COALESCE(SUM(dv.cantidad), 0) FROM detalle_venta dv " +
                "INNER JOIN ventas v ON dv.id_venta = v.id_venta " +
                "WHERE MONTH(v.fecha_venta) = MONTH(CURRENT_DATE()) " +
                "AND YEAR(v.fecha_venta) = YEAR(CURRENT_DATE())";

        Integer productosVendidos = jdbcTemplate.queryForObject(sqlProductos, Integer.class);

        // Usar ImmutableMap.Builder para crear el resultado de forma más segura
        return ImmutableMap.<String, Object>builder()
                .put("ingresosTotales", ingresosTotales != null ? ingresosTotales : BigDecimal.ZERO)
                .put("cambioIngresos", porcentajeCambioIngresos)
                .put("pedidosCompletados", pedidosCompletados != null ? pedidosCompletados : 0)
                .put("nuevosClientes", nuevosClientes != null ? nuevosClientes : 0)
                .put("productosVendidos", productosVendidos != null ? productosVendidos : 0)
                .build();
    }

    @GetMapping("/ventas-por-mes")
    public List<Map<String, Object>> obtenerVentasPorMes() {
        String cacheKey = "ventas-por-mes";
        
        // Intentar obtener del cache primero
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cachedResult = (List<Map<String, Object>>) cache.getIfPresent(cacheKey);
        if (cachedResult != null) {
            return cachedResult;
        }

        String sql = "SELECT DATE_FORMAT(v.fecha_venta, '%b') as mes, " +
                "COALESCE(SUM(dv.cantidad * p.precio), 0) as ventas " +
                "FROM ventas v " +
                "LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta " +
                "LEFT JOIN productos p ON dv.id_producto = p.id_producto " +
                "WHERE v.fecha_venta >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 MONTH) " +
                "GROUP BY YEAR(v.fecha_venta), MONTH(v.fecha_venta), DATE_FORMAT(v.fecha_venta, '%b') " +
                "ORDER BY YEAR(v.fecha_venta), MONTH(v.fecha_venta)";

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        
        // Crear una lista inmutable y guardar en cache
        List<Map<String, Object>> immutableResult = ImmutableList.copyOf(result);
        cache.put(cacheKey, immutableResult);
        
        return immutableResult;
    }

    @GetMapping("/ventas-por-categoria")
    public List<Map<String, Object>> obtenerVentasPorCategoria() {
        String sql = "SELECT c.nombre as name, " +
                "COALESCE(SUM(dv.cantidad * p.precio), 0) as value " +
                "FROM categorias c " +
                "LEFT JOIN productos p ON c.id_categoria = p.id_categoria " +
                "LEFT JOIN detalle_venta dv ON p.id_producto = dv.id_producto " +
                "LEFT JOIN ventas v ON dv.id_venta = v.id_venta " +
                "WHERE (v.fecha_venta >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH) OR v.fecha_venta IS NULL) " +
                "GROUP BY c.id_categoria, c.nombre";

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        
        // Filtrar resultados usando Guava, eliminando entradas con nombres null o vacíos
        List<Map<String, Object>> filteredResult = Lists.newArrayList();
        for (Map<String, Object> row : result) {
            String name = (String) row.get("name");
            if (!Strings.isNullOrEmpty(name)) {
                filteredResult.add(row);
            }
        }
        
        return ImmutableList.copyOf(filteredResult);
    }

    @GetMapping("/cantidad-por-mes")
    public List<Map<String, Object>> obtenerCantidadPorMes() {
        String sql = "SELECT DATE_FORMAT(v.fecha_venta, '%b') as mes, " +
                "COALESCE(SUM(dv.cantidad), 0) as cantidad " +
                "FROM ventas v " +
                "LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta " +
                "WHERE v.fecha_venta >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 MONTH) " +
                "GROUP BY YEAR(v.fecha_venta), MONTH(v.fecha_venta), DATE_FORMAT(v.fecha_venta, '%b') " +
                "ORDER BY YEAR(v.fecha_venta), MONTH(v.fecha_venta)";

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        return ImmutableList.copyOf(result);
    }

    @GetMapping("/cantidad-por-categoria")
    public List<Map<String, Object>> obtenerCantidadPorCategoria() {
        String sql = "SELECT c.nombre as name, " +
                "COALESCE(SUM(dv.cantidad), 0) as value " +
                "FROM categorias c " +
                "LEFT JOIN productos p ON c.id_categoria = p.id_categoria " +
                "LEFT JOIN detalle_venta dv ON p.id_producto = dv.id_producto " +
                "LEFT JOIN ventas v ON dv.id_venta = v.id_venta " +
                "WHERE (v.fecha_venta >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH) OR v.fecha_venta IS NULL) " +
                "GROUP BY c.id_categoria, c.nombre";

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        
        // Filtrar y transformar usando Guava
        List<Map<String, Object>> processedResult = Lists.newArrayList();
        for (Map<String, Object> row : result) {
            String name = (String) row.get("name");
            if (!Strings.isNullOrEmpty(name)) {
                // Crear un mapa inmutable para cada fila
                Map<String, Object> immutableRow = ImmutableMap.of(
                    "name", name,
                    "value", row.get("value") != null ? row.get("value") : 0
                );
                processedResult.add(immutableRow);
            }
        }
        
        return ImmutableList.copyOf(processedResult);
    }

    @GetMapping("/resumen-categorias")
    public List<Map<String, Object>> obtenerResumenCategorias() {
        String sql = "SELECT c.nombre as categoria, " +
                "COUNT(DISTINCT p.id_producto) as productos_totales, " +
                "COALESCE(SUM(dv.cantidad), 0) as cantidad_vendida, " +
                "COALESCE(SUM(dv.cantidad * p.precio), 0) as ingresos_totales, " +
                "COALESCE(AVG(p.precio), 0) as precio_promedio, " +
                "COALESCE(COUNT(DISTINCT v.id_venta), 0) as numero_ventas " +
                "FROM categorias c " +
                "LEFT JOIN productos p ON c.id_categoria = p.id_categoria " +
                "LEFT JOIN detalle_venta dv ON p.id_producto = dv.id_producto " +
                "LEFT JOIN ventas v ON dv.id_venta = v.id_venta " +
                "WHERE (v.fecha_venta >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH) OR v.fecha_venta IS NULL) " +
                "GROUP BY c.id_categoria, c.nombre " +
                "ORDER BY ingresos_totales DESC";

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        
        // Procesar y validar datos usando Guava
        List<Map<String, Object>> processedResult = Lists.newArrayList();
        for (Map<String, Object> row : result) {
            String categoria = (String) row.get("categoria");
            if (!Strings.isNullOrEmpty(categoria)) {
                processedResult.add(row);
            }
        }
        
        return ImmutableList.copyOf(processedResult);
    }

    @GetMapping("/estadisticas")
    public Map<String, Object> obtenerEstadisticas() {
        String cacheKey = "estadisticas-generales";
        
        // Intentar obtener del cache
        @SuppressWarnings("unchecked")
        Map<String, Object> cachedStats = (Map<String, Object>) cache.getIfPresent(cacheKey);
        if (cachedStats != null) {
            return cachedStats;
        }

        String sqlTotalProductos = "SELECT COUNT(*) FROM productos";
        Integer totalProductos = jdbcTemplate.queryForObject(sqlTotalProductos, Integer.class);

        String sqlStockBajo = "SELECT COUNT(*) FROM productos WHERE stock < 10";
        Integer productosStockBajo = jdbcTemplate.queryForObject(sqlStockBajo, Integer.class);

        String sqlClienteFrecuente = "SELECT u.nombre, COUNT(v.id_venta) as compras " +
                "FROM usuarios u " +
                "INNER JOIN ventas v ON u.id = v.id_usuario " +
                "WHERE u.rol = 'cliente' " +
                "GROUP BY u.id, u.nombre " +
                "ORDER BY compras DESC " +
                "LIMIT 1";

        List<Map<String, Object>> clienteFrecuente = jdbcTemplate.queryForList(sqlClienteFrecuente);

        // Crear estadísticas usando ImmutableMap para mayor seguridad
        Map<String, Object> stats = ImmutableMap.<String, Object>builder()
                .put("totalProductos", totalProductos != null ? totalProductos : 0)
                .put("productosStockBajo", productosStockBajo != null ? productosStockBajo : 0)
                .put("clienteFrecuente", clienteFrecuente.isEmpty() ? null : clienteFrecuente.get(0))
                .build();

        // Guardar en cache
        cache.put(cacheKey, stats);
        
        return stats;
    }

    // Método adicional para limpiar el cache manualmente si es necesario
    @PostMapping("/limpiar-cache")
    public Map<String, String> limpiarCache() {
        cache.invalidateAll();
        return ImmutableMap.of("mensaje", "Cache limpiado exitosamente");
    }

    // Método para obtener estadísticas del cache
    @GetMapping("/cache-stats")
    public Map<String, Object> obtenerEstadisticasCache() {
        return ImmutableMap.<String, Object>builder()
                .put("size", cache.size())
                .put("hitCount", cache.stats().hitCount())
                .put("missCount", cache.stats().missCount())
                .put("hitRate", cache.stats().hitRate())
                .build();
    }
    // ===============================
// ENDPOINTS PARA EXPORTAR REPORTES
// ===============================

@GetMapping("/export/metricas/excel")
public ResponseEntity<byte[]> exportarMetricasExcel() {
    try {
        Map<String, Object> metricas = obtenerMetricas();
        List<Map<String, Object>> ventasPorMes = obtenerVentasPorMes();
        List<Map<String, Object>> ventasPorCategoria = obtenerVentasPorCategoria();

        byte[] excelData = generarExcelMetricas(metricas, ventasPorMes, ventasPorCategoria);

        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String fileName = "dashboard_metricas_" + fecha + ".xlsx";

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

@GetMapping("/export/metricas/pdf")
public ResponseEntity<byte[]> exportarMetricasPdf() {
    try {
        Map<String, Object> metricas = obtenerMetricas();
        List<Map<String, Object>> ventasPorMes = obtenerVentasPorMes();
        List<Map<String, Object>> ventasPorCategoria = obtenerVentasPorCategoria();

        byte[] pdfData = generarPdfMetricas(metricas, ventasPorMes, ventasPorCategoria);

        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String fileName = "dashboard_metricas_" + fecha + ".pdf";

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

@GetMapping("/export/categorias/excel")
public ResponseEntity<byte[]> exportarResumenCategoriasExcel() {
    try {
        List<Map<String, Object>> resumenCategorias = obtenerResumenCategorias();

        byte[] excelData = generarExcelResumenCategorias(resumenCategorias);

        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String fileName = "resumen_categorias_" + fecha + ".xlsx";

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

@GetMapping("/export/categorias/pdf")
public ResponseEntity<byte[]> exportarResumenCategoriasPdf() {
    try {
        List<Map<String, Object>> resumenCategorias = obtenerResumenCategorias();

        byte[] pdfData = generarPdfResumenCategorias(resumenCategorias);

        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String fileName = "resumen_categorias_" + fecha + ".pdf";

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
// MÉTODOS PARA GENERAR REPORTES EXCEL
// ===============================


private byte[] generarExcelMetricas(Map<String, Object> metricas, 
                                   List<Map<String, Object>> ventasPorMes,
                                   List<Map<String, Object>> ventasPorCategoria) throws IOException {
    
    Workbook workbook = new XSSFWorkbook();
    
    // Hoja 1: Métricas Generales
    Sheet metricasSheet = workbook.createSheet("Métricas Generales");
    crearHojaMetricas(metricasSheet, metricas, workbook);
    
    // Hoja 2: Ventas por Mes
    Sheet ventasMesSheet = workbook.createSheet("Ventas por Mes");
    crearHojaVentasPorMes(ventasMesSheet, ventasPorMes, workbook);
    
    // Hoja 3: Ventas por Categoría
    Sheet ventasCatSheet = workbook.createSheet("Ventas por Categoría");
    crearHojaVentasPorCategoria(ventasCatSheet, ventasPorCategoria, workbook);
    
    // Convertir a bytes
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    workbook.write(outputStream);
    workbook.close();
    
    return outputStream.toByteArray();
}

private byte[] generarExcelResumenCategorias(List<Map<String, Object>> resumenCategorias) throws IOException {
    
    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Resumen por Categorías");
    
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
    String[] headers = {"Categoría", "Productos Totales", "Cantidad Vendida", 
                       "Ingresos Totales", "Precio Promedio", "Número de Ventas"};
    
    for (int i = 0; i < headers.length; i++) {
        Cell cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
        cell.setCellStyle(headerStyle);
    }
    
    // Llenar datos
    int rowNum = 1;
    for (Map<String, Object> categoria : resumenCategorias) {
        Row row = sheet.createRow(rowNum++);
        
        row.createCell(0).setCellValue((String) categoria.get("categoria"));
        row.createCell(1).setCellValue(((Number) categoria.get("productos_totales")).intValue());
        row.createCell(2).setCellValue(((Number) categoria.get("cantidad_vendida")).intValue());
        row.createCell(3).setCellValue(((Number) categoria.get("ingresos_totales")).doubleValue());
        row.createCell(4).setCellValue(((Number) categoria.get("precio_promedio")).doubleValue());
        row.createCell(5).setCellValue(((Number) categoria.get("numero_ventas")).intValue());
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

private void crearHojaMetricas(Sheet sheet, Map<String, Object> metricas, Workbook workbook) {
    // Estilo para títulos
    CellStyle titleStyle = workbook.createCellStyle();
    org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
    titleFont.setBold(true);
    titleFont.setFontHeightInPoints((short) 14);
    titleStyle.setFont(titleFont);
    
    // Estilo para valores
    CellStyle valueStyle = workbook.createCellStyle();
    org.apache.poi.ss.usermodel.Font valueFont = workbook.createFont();
    valueFont.setFontHeightInPoints((short) 12);
    valueStyle.setFont(valueFont);
    
    int rowNum = 0;
    
    // Título principal
    Row titleRow = sheet.createRow(rowNum++);
    Cell titleCell = titleRow.createCell(0);
    titleCell.setCellValue("MÉTRICAS DEL DASHBOARD");
    titleCell.setCellStyle(titleStyle);
    
    rowNum++; // Fila vacía
    
    // Métricas
    String[] metricNames = {"Ingresos Totales", "Cambio en Ingresos (%)", 
                           "Pedidos Completados", "Nuevos Clientes", "Productos Vendidos"};
    String[] metricKeys = {"ingresosTotales", "cambioIngresos", 
                          "pedidosCompletados", "nuevosClientes", "productosVendidos"};
    
    for (int i = 0; i < metricNames.length; i++) {
        Row row = sheet.createRow(rowNum++);
        
        Cell nameCell = row.createCell(0);
        nameCell.setCellValue(metricNames[i]);
        nameCell.setCellStyle(titleStyle);
        
        Cell valueCell = row.createCell(1);
        Object value = metricas.get(metricKeys[i]);
        if (value instanceof Number) {
            valueCell.setCellValue(((Number) value).doubleValue());
        } else {
            valueCell.setCellValue(value != null ? value.toString() : "0");
        }
        valueCell.setCellStyle(valueStyle);
    }
    
    // Ajustar columnas
    sheet.autoSizeColumn(0);
    sheet.autoSizeColumn(1);
}

private void crearHojaVentasPorMes(Sheet sheet, List<Map<String, Object>> ventasPorMes, Workbook workbook) {
    // Crear estilo para el encabezado
    CellStyle headerStyle = workbook.createCellStyle();
    org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
    headerFont.setBold(true);
    headerFont.setFontHeightInPoints((short) 12);
    headerStyle.setFont(headerFont);
    headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
    headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    
    // Crear fila de encabezado
    Row headerRow = sheet.createRow(0);
    headerRow.createCell(0).setCellValue("Mes");
    headerRow.createCell(1).setCellValue("Ventas");
    headerRow.getCell(0).setCellStyle(headerStyle);
    headerRow.getCell(1).setCellStyle(headerStyle);
    
    // Llenar datos
    int rowNum = 1;
    for (Map<String, Object> venta : ventasPorMes) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue((String) venta.get("mes"));
        row.createCell(1).setCellValue(((Number) venta.get("ventas")).doubleValue());
    }
    
    // Ajustar columnas
    sheet.autoSizeColumn(0);
    sheet.autoSizeColumn(1);
}

private void crearHojaVentasPorCategoria(Sheet sheet, List<Map<String, Object>> ventasPorCategoria, Workbook workbook) {
    // Crear estilo para el encabezado
    CellStyle headerStyle = workbook.createCellStyle();
    org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
    headerFont.setBold(true);
    headerFont.setFontHeightInPoints((short) 12);
    headerStyle.setFont(headerFont);
    headerStyle.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
    headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    
    // Crear fila de encabezado
    Row headerRow = sheet.createRow(0);
    headerRow.createCell(0).setCellValue("Categoría");
    headerRow.createCell(1).setCellValue("Valor de Ventas");
    headerRow.getCell(0).setCellStyle(headerStyle);
    headerRow.getCell(1).setCellStyle(headerStyle);
    
    // Llenar datos
    int rowNum = 1;
    for (Map<String, Object> categoria : ventasPorCategoria) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue((String) categoria.get("name"));
        row.createCell(1).setCellValue(((Number) categoria.get("value")).doubleValue());
    }
    
    // Ajustar columnas
    sheet.autoSizeColumn(0);
    sheet.autoSizeColumn(1);
}

// ===============================
// MÉTODOS PARA GENERAR REPORTES PDF
// ===============================


private byte[] generarPdfMetricas(Map<String, Object> metricas,
                                 List<Map<String, Object>> ventasPorMes,
                                 List<Map<String, Object>> ventasPorCategoria) throws DocumentException, IOException {
    
    Document document = new Document(PageSize.A4);
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    PdfWriter.getInstance(document, outputStream);
    
    document.open();
    
    // Título principal
    com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.BLACK);
    Paragraph title = new Paragraph("REPORTE DE MÉTRICAS DEL DASHBOARD", titleFont);
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
    
    // Sección de métricas generales
    agregarSeccionMetricas(document, metricas);
    
    // Sección de ventas por mes
    agregarSeccionVentasPorMes(document, ventasPorMes);
    
    // Sección de ventas por categoría
    agregarSeccionVentasPorCategoria(document, ventasPorCategoria);
    
    document.close();
    return outputStream.toByteArray();
}

private byte[] generarPdfResumenCategorias(List<Map<String, Object>> resumenCategorias) throws DocumentException, IOException {
    
    Document document = new Document(PageSize.A4.rotate()); // Horizontal para más espacio
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    PdfWriter.getInstance(document, outputStream);
    
    document.open();
    
    // Título
    com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
    Paragraph title = new Paragraph("RESUMEN POR CATEGORÍAS", titleFont);
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
    PdfPTable table = new PdfPTable(6); // 6 columnas
    table.setWidthPercentage(100);
    table.setSpacingBefore(10f);
    table.setSpacingAfter(10f);
    
    // Configurar anchos de columnas
    float[] columnWidths = {2f, 1.5f, 1.5f, 1.8f, 1.5f, 1.5f};
    table.setWidths(columnWidths);
    
    // Encabezados
    com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
    String[] headers = {"Categoría", "Productos", "Cantidad Vendida", "Ingresos", "Precio Promedio", "Ventas"};
    
    for (String header : headers) {
        PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
        cell.setBackgroundColor(BaseColor.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }
    
    // Datos
    com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
    for (Map<String, Object> categoria : resumenCategorias) {
        table.addCell(new PdfPCell(new Phrase((String) categoria.get("categoria"), dataFont)));
        table.addCell(new PdfPCell(new Phrase(categoria.get("productos_totales").toString(), dataFont)));
        table.addCell(new PdfPCell(new Phrase(categoria.get("cantidad_vendida").toString(), dataFont)));
        table.addCell(new PdfPCell(new Phrase("S/. " + categoria.get("ingresos_totales").toString(), dataFont)));
        table.addCell(new PdfPCell(new Phrase("S/. " + String.format("%.2f", ((Number) categoria.get("precio_promedio")).doubleValue()), dataFont)));
        table.addCell(new PdfPCell(new Phrase(categoria.get("numero_ventas").toString(), dataFont)));
    }
    
    document.add(table);
    
    document.close();
    return outputStream.toByteArray();
}

private void agregarSeccionMetricas(Document document, Map<String, Object> metricas) throws DocumentException {
    // Título de sección
    com.itextpdf.text.Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
    Paragraph sectionTitle = new Paragraph("MÉTRICAS GENERALES", sectionFont);
    sectionTitle.setSpacingBefore(20);
    sectionTitle.setSpacingAfter(10);
    document.add(sectionTitle);
    
    // Tabla de métricas
    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(60);
    table.setSpacingAfter(20);
    
    // Datos
    com.itextpdf.text.Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.BLACK);
    com.itextpdf.text.Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
    
    String[] labels = {"Ingresos Totales:", "Cambio en Ingresos (%):", "Pedidos Completados:", "Nuevos Clientes:", "Productos Vendidos:"};
    String[] keys = {"ingresosTotales", "cambioIngresos", "pedidosCompletados", "nuevosClientes", "productosVendidos"};
    
    for (int i = 0; i < labels.length; i++) {
        table.addCell(new PdfPCell(new Phrase(labels[i], labelFont)));
        Object value = metricas.get(keys[i]);
        String valueStr = value != null ? value.toString() : "0";
        if (keys[i].equals("ingresosTotales")) {
            valueStr = "S/. " + valueStr;
        } else if (keys[i].equals("cambioIngresos")) {
            valueStr = String.format("%.2f%%", ((Number) value).doubleValue());
        }
        table.addCell(new PdfPCell(new Phrase(valueStr, valueFont)));
    }
    
    document.add(table);
}

private void agregarSeccionVentasPorMes(Document document, List<Map<String, Object>> ventasPorMes) throws DocumentException {
    // Título de sección
    com.itextpdf.text.Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
    Paragraph sectionTitle = new Paragraph("VENTAS POR MES", sectionFont);
    sectionTitle.setSpacingBefore(20);
    sectionTitle.setSpacingAfter(10);
    document.add(sectionTitle);
    
    // Tabla
    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(50);
    table.setSpacingAfter(20);
    
    // Encabezados
    com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
    PdfPCell headerMes = new PdfPCell(new Phrase("Mes", headerFont));
    headerMes.setBackgroundColor(BaseColor.GRAY);
    headerMes.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.addCell(headerMes);
    
    PdfPCell headerVentas = new PdfPCell(new Phrase("Ventas", headerFont));
    headerVentas.setBackgroundColor(BaseColor.GRAY);
    headerVentas.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.addCell(headerVentas);
    
    // Datos
    com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
    for (Map<String, Object> venta : ventasPorMes) {
        table.addCell(new PdfPCell(new Phrase((String) venta.get("mes"), dataFont)));
        table.addCell(new PdfPCell(new Phrase("S/. " + venta.get("ventas").toString(), dataFont)));
    }
    
    document.add(table);
}

private void agregarSeccionVentasPorCategoria(Document document, List<Map<String, Object>> ventasPorCategoria) throws DocumentException {
    // Título de sección
    com.itextpdf.text.Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
    Paragraph sectionTitle = new Paragraph("VENTAS POR CATEGORÍA", sectionFont);
    sectionTitle.setSpacingBefore(20);
    sectionTitle.setSpacingAfter(10);
    document.add(sectionTitle);
    
    // Tabla
    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(50);
    table.setSpacingAfter(20);
    
    // Encabezados
    com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
    PdfPCell headerCategoria = new PdfPCell(new Phrase("Categoría", headerFont));
    headerCategoria.setBackgroundColor(BaseColor.GRAY);
    headerCategoria.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.addCell(headerCategoria);
    
    PdfPCell headerValor = new PdfPCell(new Phrase("Valor", headerFont));
    headerValor.setBackgroundColor(BaseColor.GRAY);
    headerValor.setHorizontalAlignment(Element.ALIGN_CENTER);
    table.addCell(headerValor);
    
    // Datos
    com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
    for (Map<String, Object> categoria : ventasPorCategoria) {
        table.addCell(new PdfPCell(new Phrase((String) categoria.get("name"), dataFont)));
        table.addCell(new PdfPCell(new Phrase("S/. " + categoria.get("value").toString(), dataFont)));
    }
    
    document.add(table);
}
}
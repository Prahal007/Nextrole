package ai.pdfzen.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfExportService {

    private static final float FONT_SIZE = 11;
    private static final float HEADING_FONT_SIZE = 13;
    private static final float LEADING = 16f;
    private static final float MARGIN = 50f;
    private static final int LINES_PER_PAGE = 42;

    public byte[] textToPdf(String text) throws IOException {
        if (text == null || text.isBlank()) {
            text = "No content.";
        }

        // Convert markdown to clean text before processing
        text = convertMarkdownToPlainText(text);

        List<String> lines = splitIntoLines(text);
        if (lines.isEmpty()) {
            lines = List.of("No content.");
        }

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            int lineIndex = 0;
            while (lineIndex < lines.size()) {
                PDPage page = new PDPage();
                document.addPage(page);

                float pageHeight = page.getMediaBox().getHeight();
                float y = pageHeight - MARGIN;

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    int linesOnPage = 0;
                    while (lineIndex < lines.size() && linesOnPage < LINES_PER_PAGE) {
                        String line = lines.get(lineIndex);
                        if (y < MARGIN + LEADING) break;

                        // Use bold font for section headings (ALL CAPS lines)
                        boolean isHeading = line.matches("^[A-Z][A-Z\\s]{3,}$") || line.endsWith(":");
                        if (isHeading) {
                            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), HEADING_FONT_SIZE);
                        } else {
                            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), FONT_SIZE);
                        }

                        contentStream.beginText();
                        contentStream.newLineAtOffset(MARGIN, y);
                        contentStream.showText(sanitizeForPdf(line));
                        contentStream.endText();

                        y -= LEADING;
                        lineIndex++;
                        linesOnPage++;
                    }
                }
            }

            document.save(out);
            return out.toByteArray();
        }
    }

    /**
     * Converts markdown syntax to clean plain text for PDF rendering.
     */
    private static String convertMarkdownToPlainText(String text) {
        if (text == null) return "";

        // Remove bold: **text** or __text__ -> text
        text = text.replaceAll("\\*\\*(.+?)\\*\\*", "$1");
        text = text.replaceAll("__(.+?)__", "$1");

        // Remove italic: *text* or _text_ -> text
        text = text.replaceAll("\\*(.+?)\\*", "$1");
        text = text.replaceAll("_(.+?)_", "$1");

        // Convert horizontal rules --- or === to a blank line
        text = text.replaceAll("(?m)^[-=]{3,}\\s*$", "");

        // Convert markdown bullet points - item -> • item
        text = text.replaceAll("(?m)^\\s*[-*]\\s+", "  • ");

        // Convert numbered lists
        text = text.replaceAll("(?m)^\\s*(\\d+)\\.\\s+", "  $1. ");

        // Remove markdown headers # ## ### -> just the text
        text = text.replaceAll("(?m)^#{1,6}\\s+", "");

        // Remove backtick code formatting
        text = text.replaceAll("`(.+?)`", "$1");

        // Remove links [text](url) -> text
        text = text.replaceAll("\\[(.+?)\\]\\(.+?\\)", "$1");

        return text;
    }

    private static List<String> splitIntoLines(String text) {
        List<String> result = new ArrayList<>();
        int maxCharsPerLine = 90;
        for (String paragraph : text.split("\\r?\\n")) {
            String trimmed = paragraph.trim();
            if (trimmed.isEmpty()) {
                result.add("");
                continue;
            }
            for (String line : wordWrap(trimmed, maxCharsPerLine)) {
                result.add(line);
            }
        }
        return result;
    }

    private static List<String> wordWrap(String s, int maxLen) {
        List<String> lines = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String word : s.split("\\s+")) {
            if (current.length() + word.length() + 1 > maxLen && current.length() > 0) {
                lines.add(current.toString());
                current.setLength(0);
            }
            if (current.length() > 0) current.append(' ');
            current.append(word);
        }
        if (current.length() > 0) lines.add(current.toString());
        return lines;
    }

    private static String sanitizeForPdf(String s) {
        if (s == null) return "";
        // Remove non-latin1 characters that PDFBox standard fonts can't handle
        return s.replace("\r", "").replace("\n", " ")
                .replaceAll("[^\\x00-\\xFF]", "");
    }
}
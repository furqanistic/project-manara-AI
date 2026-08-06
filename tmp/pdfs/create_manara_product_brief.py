from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "manara-app-features.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
INK = HexColor("#171717")
MUTED = HexColor("#64615D")
BRAND = HexColor("#8D775E")
BRAND_DARK = HexColor("#5F4D3C")
PAPER = HexColor("#FAF8F6")
WHITE = HexColor("#FFFFFF")
LINE = HexColor("#DED7CF")
SOFT = HexColor("#F1ECE6")


def register_fonts():
    candidates = {
        "ManaraSans": [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/Library/Fonts/Arial.ttf",
        ],
        "ManaraSansBold": [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
        ],
    }
    for name, paths in candidates.items():
        for path in paths:
            if Path(path).exists():
                pdfmetrics.registerFont(TTFont(name, path))
                break
    return (
        "ManaraSans" if "ManaraSans" in pdfmetrics.getRegisteredFontNames() else "Helvetica",
        "ManaraSansBold" if "ManaraSansBold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold",
    )


FONT, FONT_BOLD = register_fonts()


styles = {
    "eyebrow": ParagraphStyle(
        "eyebrow", fontName=FONT_BOLD, fontSize=8, leading=11,
        textColor=BRAND, spaceAfter=5, letterSpacing=1.5,
    ),
    "title": ParagraphStyle(
        "title", fontName=FONT_BOLD, fontSize=33, leading=37,
        textColor=INK, spaceAfter=12,
    ),
    "subtitle": ParagraphStyle(
        "subtitle", fontName=FONT, fontSize=13, leading=20,
        textColor=MUTED, spaceAfter=18,
    ),
    "section": ParagraphStyle(
        "section", fontName=FONT_BOLD, fontSize=20, leading=24,
        textColor=INK, spaceAfter=8,
    ),
    "card_title": ParagraphStyle(
        "card_title", fontName=FONT_BOLD, fontSize=13, leading=16,
        textColor=INK, spaceAfter=5,
    ),
    "body": ParagraphStyle(
        "body", fontName=FONT, fontSize=10.2, leading=15.2,
        textColor=MUTED,
    ),
    "body_dark": ParagraphStyle(
        "body_dark", fontName=FONT, fontSize=10.2, leading=15.2,
        textColor=INK,
    ),
    "number": ParagraphStyle(
        "number", fontName=FONT_BOLD, fontSize=24, leading=26,
        textColor=BRAND,
    ),
    "footer": ParagraphStyle(
        "footer", fontName=FONT, fontSize=7.5, leading=9,
        textColor=MUTED,
    ),
    "closing": ParagraphStyle(
        "closing", fontName=FONT_BOLD, fontSize=18, leading=24,
        textColor=WHITE, alignment=TA_CENTER,
    ),
}


def page_art(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(BRAND)
    canvas.rect(0, PAGE_H - 4 * mm, PAGE_W, 4 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, PAGE_W - 18 * mm, 14 * mm)
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9 * mm, "MANARA  /  PRODUCT FEATURE BRIEF")
    canvas.drawRightString(PAGE_W - 18 * mm, 9 * mm, f"{doc.page}")
    canvas.restoreState()


def card(number, title, text, width):
    number_cell = Paragraph(number, styles["number"])
    copy = [Paragraph(title, styles["card_title"]), Paragraph(text, styles["body"])]
    table = Table([[number_cell, copy]], colWidths=[18 * mm, width - 18 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 6 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6 * mm),
    ]))
    return table


def feature_block(kicker, title, intro, bullets):
    bullet_rows = []
    for item in bullets:
        bullet_rows.append([
            Paragraph("•", styles["card_title"]),
            Paragraph(item, styles["body_dark"]),
        ])
    bullet_table = Table(bullet_rows, colWidths=[5 * mm, 151 * mm])
    bullet_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("TEXTCOLOR", (0, 0), (0, -1), BRAND),
    ]))
    return KeepTogether([
        Paragraph(kicker.upper(), styles["eyebrow"]),
        Paragraph(title, styles["section"]),
        Paragraph(intro, styles["body"]),
        Spacer(1, 4 * mm),
        bullet_table,
    ])


doc = BaseDocTemplate(
    str(OUT),
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=18 * mm,
    bottomMargin=20 * mm,
    title="What Manara Does",
    author="Manara",
    subject="Manara product feature brief",
)
frame = Frame(
    doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
)
doc.addPageTemplates([PageTemplate(id="Manara", frames=[frame], onPage=page_art)])

story = []
story += [
    Spacer(1, 9 * mm),
    Paragraph("MANARA DESIGN STUDIO", styles["eyebrow"]),
    Paragraph("From an idea to a<br/>designed space.", styles["title"]),
    Paragraph(
        "Manara is an AI-powered architectural and interior design workspace. "
        "It helps a user shape a floor plan, visualize it as a polished 3D render "
        "and interactive model, and develop the interior direction as a complete AI design concept.",
        styles["subtitle"],
    ),
    Spacer(1, 4 * mm),
]

usable = doc.width
story += [
    card("01", "Floor Plans", "Generate a new layout or upload a reference, then refine the plan through written design requests.", usable),
    Spacer(1, 3 * mm),
    card("02", "3D Renders", "Transform a floor plan into styled isometric visuals and an interactive 3D model.", usable),
    Spacer(1, 3 * mm),
    card("03", "AI Designs", "Build an interior concept from the room type, style, palette, requirements, budget, and atmosphere - with visual and written specifications.", usable),
]
story += [
    Spacer(1, 14 * mm),
    Paragraph("THE CONNECTED WORKFLOW", styles["eyebrow"]),
    Paragraph("One project can move through all three Studio tools.", styles["section"]),
]
workflow = Table(
    [[
        Paragraph("<b>Plan</b><br/><font color='#64615D'>Create or refine the spatial layout.</font>", styles["body_dark"]),
        Paragraph("→", styles["number"]),
        Paragraph("<b>Visualize</b><br/><font color='#64615D'>Generate styled 3D renders and a model.</font>", styles["body_dark"]),
        Paragraph("→", styles["number"]),
        Paragraph("<b>Design</b><br/><font color='#64615D'>Define the interior look, materials and furniture.</font>", styles["body_dark"]),
    ]],
    colWidths=[46 * mm, 8 * mm, 52 * mm, 8 * mm, 46 * mm],
)
workflow.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), SOFT),
    ("BOX", (0,0), (-1,-1), 0.6, LINE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("ALIGN", (1,0), (1,0), "CENTER"),
    ("ALIGN", (3,0), (3,0), "CENTER"),
    ("LEFTPADDING", (0,0), (-1,-1), 2 * mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 2 * mm),
    ("TOPPADDING", (0,0), (-1,-1), 5 * mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5 * mm),
]))
story += [workflow]

story += [
    Spacer(1, 8 * mm),
    feature_block(
        "Studio 01",
        "Floor Plans",
        "The Floor Plan Studio turns a brief or reference image into a usable visual layout, then lets the user keep improving it conversationally.",
        [
            "<b>Generate from requirements:</b> choose the building type, size or bedroom scale, and presentation style, then describe the desired layout.",
            "<b>Work from a reference:</b> upload an existing plan or image as the starting point.",
            "<b>Revise with natural language:</b> request changes to the generated layout without restarting the project.",
            "<b>Preserve project rules:</b> carry floor-plan guardrails and requirements into later stages.",
            "<b>Export and continue:</b> download the result or send the approved plan directly into the 3D workflow.",
        ],
    ),
    Spacer(1, 11 * mm),
    feature_block(
        "Studio 02",
        "3D Renders",
        "The 3D Studio converts a floor plan into a realistic architectural visualization, with style variants, iterative refinement, and a true interactive model.",
        [
            "<b>Plan-to-render generation:</b> upload a floor plan and create an isometric, dollhouse-style interior render with depth and volume.",
            "<b>Style variants:</b> generate and switch between visual directions while keeping the plan as the structural source.",
            "<b>Targeted refinement:</b> use presets or written instructions to correct wall alignment, room proportions, circulation, structure, or styling.",
            "<b>Compare and iterate:</b> review versions and compare the source plan with the generated result.",
            "<b>Interactive 3D conversion:</b> convert the render into a model that can be rotated, zoomed, panned, viewed from preset angles, and inspected with viewer controls.",
            "<b>Download deliverables:</b> save the rendered image and export the 3D model as a GLB file.",
        ],
    ),
]

story += [
    Spacer(1, 8 * mm),
    feature_block(
        "Studio 03",
        "AI Designs",
        "The AI Design Studio creates a complete interior direction - not only an inspiration image. It combines the visual concept with the design information needed to understand and refine it.",
        [
            "<b>Define the space:</b> select the room type, interior style, and color palette.",
            "<b>Describe the brief:</b> enter the functional and aesthetic requirements in plain language.",
            "<b>Add practical constraints:</b> refine the concept with budget range, style preference, lighting mood, and color preference.",
            "<b>Generate the concept:</b> receive a composed AI design image tailored to the selected direction.",
            "<b>Receive design intelligence:</b> the result can include a design narrative, mood and feeling, color palette, material recommendations, furniture and hero pieces.",
            "<b>Refine selectively:</b> regenerate the whole concept or focus a revision on a specific element while preserving the overall composition.",
            "<b>Save and export:</b> revisit design history, download the image, and export the design as a PDF.",
        ],
    ),
    Spacer(1, 12 * mm),
]

closing = Table(
    [[Paragraph(
        "Manara compresses the early design process into one workspace:<br/>"
        "plan the space, see it in 3D, and define how it should feel.",
        styles["closing"],
    )]],
    colWidths=[doc.width],
)
closing.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), BRAND_DARK),
    ("BOX", (0,0), (-1,-1), 0, BRAND_DARK),
    ("LEFTPADDING", (0,0), (-1,-1), 12 * mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 12 * mm),
    ("TOPPADDING", (0,0), (-1,-1), 10 * mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 10 * mm),
]))
story += [closing]

doc.build(story)
print(OUT)

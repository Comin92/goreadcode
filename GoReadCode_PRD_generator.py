"""
GoReadCode — Master Product Book
PDF Generator
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table,
    TableStyle, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import datetime

# ── Palette ──────────────────────────────────────────────────────────────────
C_BG       = HexColor("#0D1117")   # dark background (cover only)
C_ACCENT   = HexColor("#388BFD")   # electric blue
C_ACCENT2  = HexColor("#58A6FF")   # lighter blue
C_GREEN    = HexColor("#3FB950")   # success green
C_ORANGE   = HexColor("#F0883E")   # warning orange
C_RED      = HexColor("#FF7B72")   # danger red
C_MUTED    = HexColor("#7D8590")   # muted text
C_BORDER   = HexColor("#30363D")   # borders
C_TEXT     = HexColor("#1A1A2E")   # body text (dark mode on white bg)
C_HEADING  = HexColor("#0D1117")   # headings
C_WHITE    = HexColor("#FFFFFF")
C_PANEL    = HexColor("#F6F8FA")   # light panel background

PAGE_W, PAGE_H = A4


# ── Number-of-pages canvas ────────────────────────────────────────────────────
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_page_number(num_pages)
            super().showPage()
        super().save()

    def _draw_page_number(self, page_count):
        page_num = self._saved_page_states.index(
            {k: v for k, v in self.__dict__.items() if k in self._saved_page_states[0]}
        ) if self.__dict__ in self._saved_page_states else 0
        # simpler approach:
        pass


# ── Cover page ────────────────────────────────────────────────────────────────
def draw_cover(c, doc):
    w, h = PAGE_W, PAGE_H

    # Dark background
    c.setFillColor(C_BG)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Blue accent stripe left
    c.setFillColor(C_ACCENT)
    c.rect(0, 0, 6*mm, h, fill=1, stroke=0)

    # Top right corner accent
    c.setFillColor(C_ACCENT)
    c.setStrokeColor(C_ACCENT)
    c.setLineWidth(1)
    c.rect(w - 40*mm, h - 6*mm, 40*mm, 6*mm, fill=1, stroke=0)

    # Version badge
    c.setFillColor(C_ACCENT)
    c.roundRect(w - 60*mm, h - 26*mm, 50*mm, 12*mm, 3*mm, fill=1, stroke=0)
    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(w - 35*mm, h - 21.5*mm, "VERSION 1.0  •  2026")

    # Main title block
    title_y = h * 0.62
    c.setFillColor(C_ACCENT2)
    c.setFont("Helvetica", 11)
    c.drawString(18*mm, title_y + 30*mm, "MASTER PRODUCT BOOK")

    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 48)
    c.drawString(18*mm, title_y, "GoReadCode")

    # Divider line
    c.setStrokeColor(C_ACCENT)
    c.setLineWidth(2)
    c.line(18*mm, title_y - 8*mm, w - 18*mm, title_y - 8*mm)

    c.setFillColor(C_MUTED)
    c.setFont("Helvetica", 13)
    c.drawString(18*mm, title_y - 18*mm,
                 "Plataforma Inteligente de Compreensao, Engenharia Reversa")
    c.drawString(18*mm, title_y - 26*mm,
                 "e Inteligencia de Software")

    # Tagline
    c.setFillColor(C_ACCENT2)
    c.setFont("Helvetica-Oblique", 14)
    c.drawString(18*mm, title_y - 42*mm, "Understand Any Code. Anywhere.")

    # Info block bottom
    info_y = 40*mm
    c.setStrokeColor(C_BORDER)
    c.setLineWidth(0.5)
    c.line(18*mm, info_y + 14*mm, w - 18*mm, info_y + 14*mm)

    labels = [
        ("STATUS",   "Em Planejamento"),
        ("TIPO",     "SaaS + Desktop + IDE Extensions"),
        ("CATEGORIA","Engenharia de Software  |  IA  |  Educacao"),
        ("DATA",     datetime.date.today().strftime("%B %Y")),
    ]
    col_x = [18*mm, 50*mm]
    row_h = 7*mm
    for i, (lbl, val) in enumerate(labels):
        y = info_y + (len(labels) - 1 - i) * row_h
        c.setFillColor(C_MUTED)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(col_x[0], y, lbl)
        c.setFillColor(C_WHITE)
        c.setFont("Helvetica", 9)
        c.drawString(col_x[1], y, val)

    # Confidential footer
    c.setFillColor(C_MUTED)
    c.setFont("Helvetica", 7)
    c.drawCentredString(w / 2, 12*mm,
        "CONFIDENCIAL  —  Documento de uso interno  —  Todos os direitos reservados")


# ── Header / Footer on normal pages ───────────────────────────────────────────
class PageTemplate:
    def __init__(self, section_title=""):
        self.section_title = section_title
        self._page_num = [0]

    def __call__(self, c, doc):
        c.saveState()
        w, h = PAGE_W, PAGE_H

        # Header
        c.setFillColor(C_ACCENT)
        c.rect(0, h - 10*mm, 6*mm, 10*mm, fill=1, stroke=0)
        c.setFillColor(C_PANEL)
        c.rect(6*mm, h - 10*mm, w - 6*mm, 10*mm, fill=1, stroke=0)

        c.setFillColor(C_ACCENT)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(12*mm, h - 6.5*mm, "GoReadCode")

        if self.section_title:
            c.setFillColor(C_MUTED)
            c.setFont("Helvetica", 8)
            c.drawString(55*mm, h - 6.5*mm, self.section_title)

        c.setFillColor(C_MUTED)
        c.setFont("Helvetica", 8)
        c.drawRightString(w - 10*mm, h - 6.5*mm,
                          f"Pagina {doc.page}")

        # Footer
        c.setStrokeColor(C_BORDER)
        c.setLineWidth(0.5)
        c.line(10*mm, 12*mm, w - 10*mm, 12*mm)

        c.setFillColor(C_MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(10*mm, 8*mm, "GoReadCode — Master Product Book v1.0")
        c.drawRightString(w - 10*mm, 8*mm, "CONFIDENCIAL")

        c.restoreState()


# ── Style definitions ─────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()

    def S(name, **kw):
        return ParagraphStyle(name, **kw)

    styles = {
        "part_label": S("part_label",
            fontName="Helvetica-Bold", fontSize=10,
            textColor=C_ACCENT, spaceAfter=4,
            alignment=TA_CENTER),

        "part_title": S("part_title",
            fontName="Helvetica-Bold", fontSize=28,
            textColor=C_HEADING, spaceAfter=6,
            alignment=TA_CENTER),

        "part_sub": S("part_sub",
            fontName="Helvetica-Oblique", fontSize=13,
            textColor=C_MUTED, spaceAfter=0,
            alignment=TA_CENTER),

        "chapter_label": S("chapter_label",
            fontName="Helvetica-Bold", fontSize=8,
            textColor=C_ACCENT, spaceBefore=6, spaceAfter=2),

        "h1": S("h1",
            fontName="Helvetica-Bold", fontSize=20,
            textColor=C_HEADING, spaceBefore=14, spaceAfter=6,
            borderPad=0),

        "h2": S("h2",
            fontName="Helvetica-Bold", fontSize=14,
            textColor=C_HEADING, spaceBefore=12, spaceAfter=4),

        "h3": S("h3",
            fontName="Helvetica-Bold", fontSize=11,
            textColor=C_ACCENT, spaceBefore=8, spaceAfter=3),

        "h4": S("h4",
            fontName="Helvetica-Bold", fontSize=10,
            textColor=C_MUTED, spaceBefore=6, spaceAfter=2),

        "body": S("body",
            fontName="Helvetica", fontSize=10,
            textColor=C_TEXT, leading=16,
            spaceBefore=3, spaceAfter=3,
            alignment=TA_JUSTIFY),

        "body_bold": S("body_bold",
            fontName="Helvetica-Bold", fontSize=10,
            textColor=C_TEXT, leading=16),

        "bullet": S("bullet",
            fontName="Helvetica", fontSize=10,
            textColor=C_TEXT, leading=15,
            leftIndent=14, spaceBefore=2, spaceAfter=2,
            bulletIndent=4),

        "bullet2": S("bullet2",
            fontName="Helvetica", fontSize=9.5,
            textColor=C_TEXT, leading=14,
            leftIndent=28, spaceBefore=1, spaceAfter=1,
            bulletIndent=18),

        "code": S("code",
            fontName="Courier", fontSize=8.5,
            textColor=HexColor("#f0883e"), leading=13,
            backColor=HexColor("#1c2128"),
            borderColor=C_BORDER, borderWidth=0.5,
            borderPad=6, leftIndent=8, spaceBefore=4, spaceAfter=4),

        "tag": S("tag",
            fontName="Helvetica-Bold", fontSize=8,
            textColor=C_WHITE, backColor=C_ACCENT,
            borderPad=3, spaceAfter=6),

        "caption": S("caption",
            fontName="Helvetica-Oblique", fontSize=8,
            textColor=C_MUTED, alignment=TA_CENTER, spaceAfter=6),

        "toc_part": S("toc_part",
            fontName="Helvetica-Bold", fontSize=11,
            textColor=C_ACCENT, spaceBefore=8, spaceAfter=2),

        "toc_ch": S("toc_ch",
            fontName="Helvetica-Bold", fontSize=10,
            textColor=C_HEADING, spaceBefore=4, spaceAfter=1,
            leftIndent=8),

        "toc_sec": S("toc_sec",
            fontName="Helvetica", fontSize=9,
            textColor=C_MUTED, spaceBefore=1, spaceAfter=0,
            leftIndent=20),

        "callout": S("callout",
            fontName="Helvetica", fontSize=9.5,
            textColor=HexColor("#1A3A5C"),
            backColor=HexColor("#EBF4FF"),
            borderColor=C_ACCENT, borderWidth=1,
            borderPad=8, leftIndent=4,
            spaceBefore=6, spaceAfter=6,
            leading=15),

        "callout_warn": S("callout_warn",
            fontName="Helvetica", fontSize=9.5,
            textColor=HexColor("#5A3300"),
            backColor=HexColor("#FFF3E0"),
            borderColor=C_ORANGE, borderWidth=1,
            borderPad=8, leftIndent=4,
            spaceBefore=6, spaceAfter=6,
            leading=15),
    }
    return styles


# ── Helper builders ───────────────────────────────────────────────────────────
def hr(color=C_BORDER, width=1, space_before=4, space_after=8):
    return HRFlowable(width="100%", thickness=width,
                      color=color, spaceAfter=space_after,
                      spaceBefore=space_before)


def part_divider(story, st, num, title, subtitle=""):
    story.append(PageBreak())
    story.append(Spacer(1, 60*mm))
    story.append(Paragraph(f"PARTE {num}", st["part_label"]))
    story.append(Paragraph(title, st["part_title"]))
    if subtitle:
        story.append(Paragraph(subtitle, st["part_sub"]))
    story.append(Spacer(1, 8*mm))
    story.append(hr(C_ACCENT, 2))
    story.append(PageBreak())


def chapter_header(story, st, num, title, description=""):
    story.append(Paragraph(f"CAPÍTULO {num}", st["chapter_label"]))
    story.append(Paragraph(title, st["h1"]))
    story.append(hr(C_ACCENT, 1.5, 0, 6))
    if description:
        story.append(Paragraph(description, st["callout"]))


def section(story, st, title):
    story.append(Paragraph(title, st["h2"]))
    story.append(hr(C_BORDER, 0.5, 0, 4))


def subsection(story, st, title):
    story.append(Paragraph(title, st["h3"]))


def subsubsection(story, st, title):
    story.append(Paragraph(title, st["h4"]))


def para(story, st, text):
    story.append(Paragraph(text, st["body"]))


def bullets(story, st, items, level=1):
    key = "bullet" if level == 1 else "bullet2"
    for item in items:
        story.append(Paragraph(f"• {item}", st[key]))


def two_col_table(story, items_left, items_right, col_headers=None):
    col_w = [90*mm, 90*mm]
    data = []
    if col_headers:
        data.append(col_headers)
    max_len = max(len(items_left), len(items_right))
    for i in range(max_len):
        l = items_left[i] if i < len(items_left) else ""
        r = items_right[i] if i < len(items_right) else ""
        data.append([l, r])

    tbl = Table(data, colWidths=col_w)
    style = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), C_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('BACKGROUND', (0, 0), (-1, 0), C_PANEL),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_PANEL]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]
    if col_headers:
        style += [
            ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
            ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ]
    tbl.setStyle(TableStyle(style))
    story.append(tbl)
    story.append(Spacer(1, 6))


def kv_table(story, rows, header=None):
    """rows: list of (key, value)"""
    col_w = [55*mm, 125*mm]
    data = []
    if header:
        data.append(header)
    for k, v in rows:
        data.append([k, v])
    tbl = Table(data, colWidths=col_w)
    style_list = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), C_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [C_WHITE, C_PANEL]),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 0), (0, -1), C_HEADING),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]
    if header:
        style_list += [
            ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
            ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ]
    tbl.setStyle(TableStyle(style_list))
    story.append(tbl)
    story.append(Spacer(1, 6))


def flow_table(story, steps):
    """Renders a vertical flow diagram."""
    col_w = [170*mm]
    data = []
    for i, step in enumerate(steps):
        data.append([step])
        if i < len(steps) - 1:
            data.append(["↓"])
    tbl = Table(data, colWidths=col_w)
    style_list = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(0, len(data), 2):
        bg = C_ACCENT if i == 0 else HexColor("#EBF4FF")
        fc = C_WHITE if i == 0 else C_TEXT
        fn = 'Helvetica-Bold'
        style_list += [
            ('BACKGROUND', (0, i), (-1, i), bg),
            ('TEXTCOLOR', (0, i), (-1, i), fc),
            ('FONTNAME', (0, i), (-1, i), fn),
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ]
    for i in range(1, len(data), 2):
        style_list += [
            ('TEXTCOLOR', (0, i), (-1, i), C_MUTED),
            ('FONTSIZE', (0, i), (-1, i), 14),
        ]
    tbl.setStyle(TableStyle(style_list))
    story.append(tbl)
    story.append(Spacer(1, 6))


# ══════════════════════════════════════════════════════════════════════════════
#  CONTENT
# ══════════════════════════════════════════════════════════════════════════════
def build_toc(story, st):
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("SUMÁRIO", st["part_label"]))
    story.append(hr(C_ACCENT, 2, 2, 8))

    toc_data = [
        ("PARTE I — PRODUTO", None, [
            ("Cap. 1",  "Visão e Missão"),
            ("Cap. 2",  "Mercado e Público-Alvo"),
            ("Cap. 3",  "Problema e Solução"),
            ("Cap. 4",  "Posicionamento e Diferenciais"),
            ("Cap. 5",  "Onde o GoReadCode Pode Ser Utilizado"),
            ("Cap. 6",  "Fontes de Entrada Suportadas"),
            ("Cap. 7",  "Funcionalidades"),
            ("Cap. 8",  "Requisitos Funcionais e Não Funcionais"),
            ("Cap. 9",  "Fluxo do Usuário"),
            ("Cap. 10", "Roadmap"),
            ("Cap. 11", "Métricas de Sucesso"),
            ("Cap. 12", "Monetização"),
            ("Cap. 13", "Riscos"),
            ("Cap. 14", "Constituição do Produto"),
        ]),
        ("PARTE II — ARQUITETURA DE SOFTWARE", None, [
            ("Cap. A",  "Princípios Arquiteturais"),
            ("Cap. B",  "Modelo de Domínio (DDD)"),
            ("Cap. C",  "Stack Tecnológica"),
            ("Cap. D",  "Arquitetura Modular"),
            ("Cap. E",  "Engine de Análise e Indexação"),
            ("Cap. F",  "Eventos de Domínio"),
            ("Cap. G",  "Infraestrutura e DevOps"),
        ]),
        ("PARTE III — INTELIGÊNCIA ARTIFICIAL", None, [
            ("Cap. A",  "Arquitetura da IA"),
            ("Cap. B",  "Agentes Especializados"),
            ("Cap. C",  "RAG e Banco Vetorial"),
            ("Cap. D",  "Memória e Contexto"),
            ("Cap. E",  "Prompt Engine e Reasoning"),
        ]),
        ("PARTE IV — VISUALIZAÇÃO INTELIGENTE", None, [
            ("Cap. A",  "Intelligent Visualization Engine"),
            ("Cap. B",  "Preview e Sandbox"),
            ("Cap. C",  "Diagramas e Fluxos"),
        ]),
        ("PARTE V — ESPECIFICAÇÃO TÉCNICA", None, [
            ("Cap. A",  "Banco de Dados"),
            ("Cap. B",  "APIs REST e GraphQL"),
            ("Cap. C",  "Segurança"),
        ]),
        ("PARTE VI — UX/UI", None, [
            ("Cap. A",  "Identidade Visual"),
            ("Cap. B",  "Telas e Componentes"),
            ("Cap. C",  "Acessibilidade e Responsividade"),
        ]),
        ("PARTE VII — MANUAIS E ANEXOS", None, [
            ("Anexo A", "Comparativo Competitivo"),
            ("Anexo B", "Glossário"),
            ("Anexo C", "Visão de Longo Prazo (5–10 anos)"),
        ]),
    ]

    for part_title, _, chapters in toc_data:
        story.append(Paragraph(part_title, st["toc_part"]))
        for num, title in chapters:
            story.append(Paragraph(f"    {num}  —  {title}", st["toc_ch"]))
        story.append(Spacer(1, 2))

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE I — PRODUTO
# ─────────────────────────────────────────────────────────────────────────────
def parte_i(story, st):
    part_divider(story, st, "I", "PRODUTO",
                 "Visão, Mercado, Funcionalidades, Roadmap e Estratégia")

    # ── Cap 1 ──
    chapter_header(story, st, "1", "Visão e Missão",
        "O GoReadCode é uma plataforma inteligente de compreensão, análise, documentação, "
        "aprendizado e depuração de código-fonte. Seu principal diferencial é que ela nunca "
        "tenta alterar um código antes de compreendê-lo completamente.")

    section(story, st, "1.1  O que é o GoReadCode?")
    para(story, st,
        "O GoReadCode é uma plataforma de Code Intelligence que combina análise estática, "
        "engenharia reversa automatizada e Inteligência Artificial para transformar qualquer "
        "base de código em conhecimento estruturado e acessível. Ao receber um projeto, a "
        "plataforma executa uma análise profunda para construir conhecimento completo sobre "
        "arquitetura, regras de negócio, dependências, qualidade, segurança, testes e "
        "performance — e somente então atua como assistente de desenvolvimento, "
        "documentação, debugging e ensino.")

    section(story, st, "1.2  Missão")
    story.append(Paragraph(
        "<b>Democratizar a compreensão de software complexo através de Inteligência Artificial, "
        "transformando qualquer código em conhecimento acessível.</b>",
        st["callout"]))

    section(story, st, "1.3  Visão")
    story.append(Paragraph(
        "<b>Ser a principal plataforma mundial de leitura inteligente de código-fonte, "
        "tornando qualquer projeto compreensível independentemente da linguagem, "
        "framework ou arquitetura.</b>",
        st["callout"]))

    section(story, st, "1.4  Tagline")
    story.append(Paragraph(
        "<b><i>Understand Any Code. Anywhere.</i></b>",
        ParagraphStyle("tagline", fontName="Helvetica-BoldOblique",
                       fontSize=16, textColor=C_ACCENT,
                       alignment=TA_CENTER, spaceBefore=6, spaceAfter=6)))

    story.append(PageBreak())

    # ── Cap 2 ──
    chapter_header(story, st, "2", "Mercado e Público-Alvo",
        "O GoReadCode atende diferentes perfis profissionais, do estudante ao arquiteto sênior.")

    section(story, st, "2.1  Personas")
    kv_table(story, [
        ("Lucas — Dev Júnior",   "Quer aprender programação utilizando projetos reais como material didático."),
        ("Ana — Tech Lead",      "Precisa compreender rapidamente bases de código desconhecidas ao assumir novos projetos."),
        ("Pedro — Arquiteto",    "Audita sistemas corporativos antes de propor mudanças arquiteturais."),
        ("Mariana — QA",         "Precisa compreender funcionalidades e fluxos antes de criar planos de teste."),
        ("João — Professor",     "Usa o GoReadCode durante aulas para demonstrar código real a alunos."),
        ("Bruno — DevOps",       "Entende pipelines, scripts de infraestrutura e arquitetura de deploy."),
        ("Clara — Segurança",    "Realiza auditorias de vulnerabilidades em sistemas legados."),
        ("Diego — Estudante",    "Aprende desenvolvimento de software através da leitura guiada de projetos open source."),
    ], header=["Persona", "Necessidade Principal"])

    section(story, st, "2.2  Segmentos de Mercado")
    bullets(story, st, [
        "Desenvolvedores individuais (freemium / Pro)",
        "Equipes de desenvolvimento (plano Teams)",
        "Empresas corporativas (plano Enterprise)",
        "Instituições de ensino (plano Educação)",
        "Comunidade open source",
    ])

    story.append(PageBreak())

    # ── Cap 3 ──
    chapter_header(story, st, "3", "Problema e Solução",
        "Compreender software legado ou desconhecido é um dos maiores custos "
        "invisíveis da engenharia de software.")

    section(story, st, "3.1  O Problema")
    para(story, st,
        "Projetos de médio e grande porte possuem milhares de arquivos, centenas de "
        "dependências, documentação desatualizada, regras de negócio implícitas e "
        "arquiteturas de difícil compreensão. Um desenvolvedor gasta em média dias — "
        "às vezes semanas — tentando entender um sistema antes de conseguir modificá-lo "
        "com segurança. Esse tempo tem custo direto para times e empresas.")

    bullets(story, st, [
        "Onboarding técnico lento e custoso",
        "Documentação ausente ou desatualizada",
        "Regras de negócio implícitas no código",
        "Medo de alterar sistemas legados sem entendê-los",
        "Dificuldade em ensinar programação com projetos reais",
        "Auditorias de segurança manuais e imprecisas",
    ])

    section(story, st, "3.2  A Solução")
    para(story, st,
        "O GoReadCode reduz o tempo de compreensão de dias para minutos. A plataforma "
        "analisa automaticamente o projeto completo e constrói um mapa de conhecimento "
        "que permite ao desenvolvedor entender qualquer parte do sistema — do panorama "
        "arquitetural até a explicação linha a linha — com precisão e rastreabilidade.")

    flow_table(story, [
        "Importar projeto",
        "Indexação e parsing automático",
        "Análise profunda (arquitetura, dependências, qualidade, segurança)",
        "Construção do mapa de conhecimento",
        "Interface conversacional com IA especializada",
        "Explicação, documentação, debug e ensino",
    ])

    story.append(PageBreak())

    # ── Cap 4 ──
    chapter_header(story, st, "4", "Posicionamento e Diferenciais Competitivos")

    section(story, st, "4.1  Diferenciais")
    kv_table(story, [
        ("Compreensão antes da ação",
         "O GoReadCode nunca modifica código sem antes construir contexto completo sobre o sistema."),
        ("Explicações em múltiplos níveis",
         "Do panorama arquitetural (C4, diagramas) até a análise linha a linha."),
        ("Foco em ensino",
         "Transforma bases de código complexas em material didático interativo."),
        ("Análise unificada",
         "Arquitetura, qualidade, segurança, testes, performance e documentação em uma única plataforma."),
        ("Rastreabilidade total",
         "Toda conclusão é ligada à sua evidência no código-fonte."),
        ("Extensibilidade",
         "Preparada para integração com IDEs, repositórios Git e agentes especializados por terceiros."),
        ("Multi-LLM e Multi-Fonte",
         "Suporte a diferentes provedores de IA e diferentes origens de código."),
    ], header=["Diferencial", "Descrição"])

    section(story, st, "4.2  Comparativo com o Mercado")
    subsection(story, st, "Principais concorrentes e ferramentas adjacentes")
    bullets(story, st, [
        "GitHub Copilot — foco em geração de código, não em compreensão",
        "Cursor / Windsurf — IDEs com IA, sem análise arquitetural profunda",
        "Sourcegraph — busca e navegação de código sem análise semântica ampla",
        "SonarQube — qualidade e segurança, sem explicação didática",
        "CodeScene — análise comportamental, sem modo professor ou documentação automática",
        "ChatGPT / Claude — análise de trechos isolados, sem indexação do projeto completo",
    ])
    para(story, st,
        "O GoReadCode ocupa um espaço único: plataforma completa de Code Intelligence "
        "com foco em compreensão, ensino, auditoria e documentação — não em geração automática de código.")

    story.append(PageBreak())

    # ── Cap 5 ──
    chapter_header(story, st, "5", "Onde o GoReadCode Pode Ser Utilizado",
        "A plataforma foi projetada para acompanhar o usuário em qualquer contexto.")

    bullets(story, st, [
        "Em casa — para estudos, projetos pessoais e aprendizado autodidata",
        "Em escolas, universidades, cursos técnicos e bootcamps como ferramenta de ensino",
        "Em ambientes corporativos — para onboarding, auditoria, manutenção e evolução de sistemas",
        "Em equipes de desenvolvimento — para revisão de código e compartilhamento de conhecimento",
        "Em pesquisas acadêmicas e científicas",
        "Em projetos Open Source",
        "Em startups em fase de crescimento acelerado",
        "Em grandes empresas com sistemas legados complexos",
    ])

    story.append(PageBreak())

    # ── Cap 6 ──
    chapter_header(story, st, "6", "Fontes de Entrada Suportadas",
        "O GoReadCode analisa software a partir de diferentes origens, "
        "oferecendo flexibilidade para qualquer cenário.")

    section(story, st, "6.1  Repositórios Git")
    bullets(story, st, [
        "GitHub (público e privado mediante autenticação)",
        "GitLab",
        "Bitbucket",
        "Azure DevOps",
        "Gitea",
        "Servidores Git corporativos e self-hosted",
    ])

    section(story, st, "6.2  Código-Fonte Direto")
    bullets(story, st, [
        "Upload de arquivos individuais",
        "Upload de pastas compactadas (.zip, .tar, .rar)",
        "Projetos completos via arrastar e soltar (Drag & Drop)",
        "Cole diretamente na interface (modo paste)",
    ])

    section(story, st, "6.3  Análise por URL de Aplicação")
    para(story, st,
        "O usuário poderá informar apenas o endereço de uma aplicação web. O sistema "
        "realizará análise inteligente das informações públicas acessíveis, identificando:")
    bullets(story, st, [
        "Frameworks de frontend detectáveis",
        "Bibliotecas JavaScript expostas",
        "Headers HTTP e certificados",
        "APIs públicas expostas",
        "Padrões de arquitetura observáveis",
        "Desempenho inicial (Core Web Vitals)",
        "SEO e acessibilidade",
        "Segurança básica (CSP, HSTS, CORS, etc.)",
    ])
    story.append(Paragraph(
        "<b>Nota:</b> quando houver acesso apenas à URL, a análise será limitada às informações "
        "expostas publicamente. O código-fonte interno requer integração via repositório.",
        st["callout_warn"]))

    section(story, st, "6.4  Integrações Futuras com IDEs")
    bullets(story, st, [
        "Visual Studio Code",
        "JetBrains (IntelliJ IDEA, PyCharm, WebStorm, Rider, etc.)",
        "Visual Studio",
        "Neovim",
        "Eclipse",
    ])

    section(story, st, "6.5  APIs e Serviços")
    bullets(story, st, [
        "APIs REST — análise de contratos e endpoints",
        "GraphQL — análise de schemas e resolvers",
        "gRPC — análise de protobufs",
        "WebSocket — análise de eventos e mensagens",
    ])

    story.append(PageBreak())

    # ── Cap 7 ──
    chapter_header(story, st, "7", "Funcionalidades",
        "Conjunto completo de capacidades da plataforma, organizadas por módulo.")

    features = [
        ("7.1  Leitura Inteligente", [
            "Detecção automática de linguagens, frameworks e bibliotecas",
            "Identificação de ORMs, bancos de dados, ferramentas de build",
            "Reconhecimento de Docker, CI/CD, cloud e containers",
            "Detecção de package managers e configurações de projeto",
        ]),
        ("7.2  Indexação e Mapeamento", [
            "Leitura recursiva completa do projeto",
            "Construção de mapa de módulos e dependências",
            "Mapa de chamadas entre funções e serviços",
            "Mapa de responsabilidades por componente",
            "Grafo de dependências com visualização",
        ]),
        ("7.3  Engenharia Reversa", [
            "Reconstrução automática da arquitetura",
            "Geração de diagramas C4 (contexto, container, componente, código)",
            "Diagramas UML (classes, sequência, estado, atividades, componentes)",
            "Diagramas de banco de dados e relacionamentos",
            "Mapeamento de APIs e fluxos de integração",
        ]),
        ("7.4  Ensino e Explicação", [
            "Explicação do projeto completo em linguagem natural",
            "Explicação de pasta, arquivo, classe, interface",
            "Explicação de método, função, variável e linha individual",
            "Modo professor com analogias e exemplos didáticos",
            "Trilhas de aprendizado baseadas no projeto",
        ]),
        ("7.5  Debug Assistido", [
            "Compreensão do contexto antes de qualquer diagnóstico",
            "Localização da origem do problema",
            "Explicação da causa raiz",
            "Análise do impacto da falha",
            "Sugestão e comparação de soluções",
        ]),
        ("7.6  Análise de Qualidade", [
            "Detecção de código morto e duplicações",
            "Identificação de acoplamento excessivo e alta complexidade ciclomática",
            "Code Smells, violações de SOLID e Clean Code",
            "Padrões de DDD e arquitetura",
        ]),
        ("7.7  Auditoria de Segurança", [
            "SQL Injection, XSS, CSRF, SSRF",
            "Segredos, tokens e senhas expostas no código",
            "Dependências com vulnerabilidades conhecidas (CVEs)",
            "OWASP Top 10",
        ]),
        ("7.8  Análise de Testes", [
            "Identificação de testes unitários, de integração e E2E",
            "Estimativa de cobertura de testes",
            "Detecção de mocks, fixtures e frameworks utilizados",
            "Geração de estratégia e exemplos de testes",
        ]),
        ("7.9  Análise de Performance", [
            "Identificação de loops ineficientes e consultas lentas",
            "Detecção de vazamentos de memória e N+1 queries",
            "Análise de uso de cache e complexidade algorítmica",
        ]),
        ("7.10  Documentação Automática", [
            "Geração de README completo e atualizado",
            "Wiki técnica do projeto",
            "Documentação de endpoints e contratos de API",
            "Documentação de schema de banco de dados",
            "Geração de diagramas e fluxos em múltiplos formatos",
        ]),
    ]

    for title, items in features:
        subsection(story, st, title)
        bullets(story, st, items)
        story.append(Spacer(1, 3))

    story.append(PageBreak())

    # ── Cap 8 ──
    chapter_header(story, st, "8", "Requisitos Funcionais e Não Funcionais")

    section(story, st, "8.1  Requisitos Funcionais")
    rf_data = [
        ["ID", "Requisito"],
        ["RF-001", "Ler e indexar projetos completos de forma recursiva"],
        ["RF-002", "Identificar linguagens, frameworks e bibliotecas automaticamente"],
        ["RF-003", "Identificar e reconstruir a arquitetura do projeto"],
        ["RF-004", "Explicar código em qualquer nível de granularidade"],
        ["RF-005", "Gerar documentação automática em múltiplos formatos"],
        ["RF-006", "Detectar bugs, vulnerabilidades e code smells"],
        ["RF-007", "Sugerir melhorias sem alterar arquivos automaticamente"],
        ["RF-008", "Funcionar como ferramenta de ensino interativo"],
        ["RF-009", "Suportar múltiplas fontes de entrada de código"],
        ["RF-010", "Gerar diagramas e visualizações automáticas"],
    ]
    tbl = Table(rf_data, colWidths=[30*mm, 150*mm])
    tbl.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_PANEL]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), C_ACCENT),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8))

    section(story, st, "8.2  Requisitos Não Funcionais")
    bullets(story, st, [
        "Performance — respostas rápidas mesmo em projetos com milhares de arquivos",
        "Escalabilidade — suporte a múltiplos usuários e projetos simultâneos",
        "Segurança — código-fonte do usuário isolado e protegido por padrão",
        "Modularidade — novos analisadores e agentes podem ser adicionados sem alterar o núcleo",
        "Extensibilidade — suporte a novas linguagens e frameworks via plugins",
        "Observabilidade — logs, métricas e rastreamento em todas as operações críticas",
        "Disponibilidade — objetivo de 99.9% de uptime (SLA Enterprise)",
        "Multilíngue — interface e análises disponíveis em múltiplos idiomas",
        "Offline (futuro) — versão desktop com processamento local",
        "Privacidade por padrão — nenhum dado do usuário compartilhado sem consentimento explícito",
    ])

    section(story, st, "8.3  Fora do Escopo — V1")
    story.append(Paragraph(
        "As funcionalidades abaixo estão <b>explicitamente fora</b> do escopo da versão inicial:",
        st["callout_warn"]))
    bullets(story, st, [
        "Escrita automática de código sem solicitação explícita do usuário",
        "Deploy automático de aplicações",
        "Refatoração automática sem aprovação do usuário",
        "Execução remota de código do projeto analisado",
        "Alteração direta de arquivos sem confirmação explícita",
    ])

    story.append(PageBreak())

    # ── Cap 9 ──
    chapter_header(story, st, "9", "Fluxo do Usuário",
        "Jornada completa desde a importação até a entrega de valor.")

    flow_table(story, [
        "1. Importar projeto (repositório, upload ou paste)",
        "2. Indexação automática de todos os arquivos",
        "3. Análise profunda (arquitetura, qualidade, segurança, testes, performance)",
        "4. Construção do mapa de conhecimento",
        "5. Dashboard com visão geral do projeto",
        "6. Interface conversacional com a IA",
        "7. Explicação, documentação e debug sob demanda",
        "8. Geração de relatórios e artefatos",
        "9. Sugestões de melhoria apresentadas ao usuário",
        "10. Aprovação explícita para qualquer alteração",
    ])

    story.append(PageBreak())

    # ── Cap 10 ──
    chapter_header(story, st, "10", "Roadmap",
        "Evolução planejada da plataforma em cinco fases.")

    roadmap = [
        ("Fase 1 — MVP", [
            "Leitura recursiva de projetos",
            "Indexação e identificação de linguagens e frameworks",
            "Explicação de arquivos e funções via IA",
            "Geração inicial de documentação (README e Wiki)",
            "Suporte a upload de arquivos e repositórios GitHub",
        ]),
        ("Fase 2 — Core Features", [
            "Diagramas automáticos (C4, UML, dependências)",
            "Grafo de dependências interativo",
            "Modo Professor com trilhas de aprendizado",
            "Modo Debug com análise de impacto",
            "Auditoria de qualidade (SOLID, Clean Code, Code Smells)",
        ]),
        ("Fase 3 — Segurança e Performance", [
            "Auditoria de segurança (OWASP Top 10, CVEs)",
            "Análise de performance (N+1, memory leaks, complexidade)",
            "Análise de cobertura de testes",
            "Plugins para IDEs (VS Code, JetBrains)",
        ]),
        ("Fase 4 — Colaboração e Integração", [
            "Colaboração em equipe com histórico compartilhado",
            "Integração completa com GitHub, GitLab e Bitbucket",
            "Comparação entre versões e branches",
            "Sugestões assistidas por IA com rastreabilidade",
        ]),
        ("Fase 5 — Plataforma Completa", [
            "Agentes especializados de terceiros (marketplace)",
            "Aprendizado contínuo por projeto",
            "Suporte a múltiplos repositórios simultâneos",
            "Aplicativo Desktop (Electron)",
            "Plataforma SaaS Enterprise completa",
        ]),
    ]

    for phase, items in roadmap:
        subsection(story, st, phase)
        bullets(story, st, items)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ── Cap 11 ──
    chapter_header(story, st, "11", "Métricas de Sucesso (KPIs)")

    kv_table(story, [
        ("Tempo de indexação",          "Tempo médio para indexar um projeto de tamanho típico"),
        ("Tempo de resposta da IA",     "Latência média para responder perguntas sobre o código"),
        ("Precisão de detecção",        "Acurácia na identificação de linguagens, frameworks e dependências"),
        ("Qualidade da documentação",   "Avaliação humana e automatizada dos artefatos gerados"),
        ("Satisfação do usuário",       "NPS e CSAT coletados pós-análise"),
        ("Redução de onboarding",       "Tempo médio reduzido para compreender um projeto desconhecido"),
        ("Cobertura de explicações",    "% do projeto coberto com explicações do projeto à linha"),
        ("Detecção de vulnerabilidades","Acurácia e recall na detecção de issues de segurança"),
        ("Engajamento",                 "DAU/MAU, sessões por usuário, retenção em 30 dias"),
        ("Conversão freemium → pago",   "Taxa de upgrade de plano gratuito para pago"),
    ], header=["KPI", "Definição"])

    story.append(PageBreak())

    # ── Cap 12 ──
    chapter_header(story, st, "12", "Modelo de Monetização")

    kv_table(story, [
        ("Plano Free",       "Projetos públicos, análise básica, limite de arquivos por análise"),
        ("Plano Pro",        "Projetos privados, análise completa, histórico, exportação PDF"),
        ("Plano Teams",      "Multi-usuário, colaboração, integrações Git, suporte prioritário"),
        ("Plano Enterprise", "SSO, SAML, SLA, on-premise, agentes customizados, SLA 99.9%"),
        ("Plano Educação",   "Desconto institucional, turmas, modo professor, relatórios de progresso"),
        ("Marketplace",      "Agentes e extensões de terceiros com revenue share"),
        ("API Pública",      "Acesso programático pago por uso (pay-per-call)"),
    ], header=["Plano / Canal", "Descrição"])

    story.append(PageBreak())

    # ── Cap 13 ──
    chapter_header(story, st, "13", "Riscos")

    kv_table(story, [
        ("Privacidade do código-fonte",   "Alto — mitigado com isolamento por tenant, criptografia e políticas claras"),
        ("Alucinações da IA",             "Alto — mitigado com RAG, citação de evidências e indicação de confiança"),
        ("Custo de tokens de LLM",        "Médio — mitigado com caching, chunking inteligente e modelos locais"),
        ("Suporte a linguagens exóticas", "Médio — mitigado com arquitetura extensível de parsers"),
        ("Competição de grandes players", "Médio — mitigado com foco em nicho de compreensão e ensino"),
        ("Latência em projetos grandes",  "Médio — mitigado com indexação incremental e processamento assíncrono"),
    ], header=["Risco", "Nível e Mitigação"])

    story.append(PageBreak())

    # ── Cap 14 ──
    chapter_header(story, st, "14", "Constituição do Produto",
        "Princípios invioláveis que orientam todas as decisões de produto e engenharia do GoReadCode.")

    section(story, st, "14.1  O que o GoReadCode NUNCA deve fazer")
    bullets(story, st, [
        "Modificar código do usuário sem solicitação e confirmação explícita",
        "Inventar respostas quando não houver evidências suficientes no código analisado",
        "Esconder limitações da análise — toda incerteza deve ser comunicada claramente",
        "Expor código confidencial de um projeto para outros usuários",
        "Priorizar velocidade de resposta em detrimento da precisão e rastreabilidade",
        "Armazenar código-fonte do usuário além do período necessário para a análise, sem consentimento",
    ])

    section(story, st, "14.2  O que o GoReadCode SEMPRE deve fazer")
    bullets(story, st, [
        "Explicar o raciocínio quando solicitado — todo diagnóstico deve ser auditável",
        "Preservar a rastreabilidade entre conclusões e evidências no código",
        "Respeitar as políticas de privacidade definidas pelo usuário e pela organização",
        "Indicar o nível de confiança de cada análise gerada",
        "Apresentar alternativas quando múltiplas interpretações são possíveis",
        "Colocar o contexto antes da ação — compreender sempre antes de agir",
    ])

    section(story, st, "14.3  Princípio Fundamental")
    story.append(Paragraph(
        "A IA é um apoio à inteligência humana, não uma substituição. Decisões críticas "
        "permanecem transparentes, auditáveis e sob controle do usuário. O GoReadCode "
        "amplifica a capacidade do desenvolvedor; não a substitui.",
        st["callout"]))

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE II — ARQUITETURA DE SOFTWARE
# ─────────────────────────────────────────────────────────────────────────────
def parte_ii(story, st):
    part_divider(story, st, "II", "ARQUITETURA DE SOFTWARE",
                 "Domínio, Stack, Módulos, Eventos e Infraestrutura")

    chapter_header(story, st, "A", "Princípios Arquiteturais",
        "Toda a implementação do GoReadCode deve respeitar estes princípios.")

    bullets(story, st, [
        "Domain-Driven Design (DDD) — organizado em domínios de negócio, não em tecnologias",
        "Clean Architecture — separação clara entre domínio, aplicação e infraestrutura",
        "SOLID — princípios de design aplicados em toda a base de código",
        "API First — contratos definidos antes da implementação",
        "AI First — IA como cidadã de primeira classe, não como add-on",
        "Event-Driven — comunicação assíncrona entre domínios via eventos",
        "Contexto antes da ação — nenhum módulo atua sem contexto suficiente",
        "Observabilidade — todas operações relevantes geram eventos, métricas e logs",
        "Segurança por padrão — proteção de dados e código-fonte desde a concepção",
        "Rastreabilidade — toda conclusão ligada às suas evidências no código",
    ])

    story.append(PageBreak())

    chapter_header(story, st, "B", "Modelo de Domínio (DDD)",
        "O sistema é dividido em Bounded Contexts independentes com contratos bem definidos.")

    section(story, st, "B.1  Bounded Contexts")
    two_col_table(story,
        ["Workspace Context", "Project Context", "Code Analysis Context",
         "Reverse Engineering Context", "AI Context", "Documentation Context"],
        ["Learning Context", "Debug Context", "Visualization Context",
         "Collaboration Context", "Administration Context", "Security Context"],
        col_headers=["Contexto (Coluna 1)", "Contexto (Coluna 2)"])

    section(story, st, "B.2  Entidades Principais")
    kv_table(story, [
        ("Workspace",    "id, nome, proprietário, organizações, configurações, projetos, histórico"),
        ("Projeto",      "id, nome, origem, linguagem principal, frameworks, status, arquitetura"),
        ("Análise",      "id, projeto, data, versão, duração, status, métricas, riscos"),
        ("Arquivo",      "caminho, hash, linguagem, tamanho, módulo, dependências, símbolos"),
        ("Classe",       "nome, namespace, métodos, propriedades, interfaces, heranças"),
        ("Método",       "assinatura, parâmetros, retorno, complexidade, chamadas, exceções"),
        ("Dependência",  "origem, destino, tipo (arquivo/classe/API/biblioteca), peso"),
        ("Agente IA",    "nome, especialidade, modelo, capacidades, prioridade, nível de confiança"),
        ("Conversa",     "usuário, projeto, mensagens, contexto, memória, sessão"),
        ("Documento",    "tipo (README/Wiki/PDF), projeto, versão, conteúdo, data de geração"),
    ], header=["Entidade", "Campos Principais"])

    section(story, st, "B.3  Eventos de Domínio")
    bullets(story, st, [
        "ProjetoImportado, ProjetoAtualizado, ProjetoAnalisado",
        "ArquivoIndexado, ArquiteturaReconstruída",
        "DependênciaDetectada, APIMapeada",
        "DiagramaGerado, DocumentaçãoAtualizada",
        "AnáliseConcluída, BugDetectado, SugestãoCriada",
        "ProjetoCompartilhado, ExportaçãoGerada",
    ])

    story.append(PageBreak())

    chapter_header(story, st, "C", "Stack Tecnológica")

    kv_table(story, [
        ("Frontend",        "Next.js 14+, React 18, TypeScript, TailwindCSS, Shadcn UI"),
        ("Backend",         "NestJS, TypeScript, Python (análise estática e IA)"),
        ("Banco Relacional","PostgreSQL com migrações versionadas"),
        ("Cache / Filas",   "Redis (cache, sessões, filas de processamento)"),
        ("Banco Vetorial",  "pgvector (PostgreSQL) ou Qdrant para embeddings"),
        ("IA / LLMs",       "Multi-provider: Anthropic, OpenAI, Groq, Ollama (local)"),
        ("Análise Estática","Tree-sitter (parsing multi-linguagem), AST generators"),
        ("Containerização", "Docker e Docker Compose (desenvolvimento e produção)"),
        ("Orquestração",    "Kubernetes (produção / fase Enterprise)"),
        ("CI/CD",           "GitHub Actions, testes automatizados, deploy contínuo"),
        ("Observabilidade", "OpenTelemetry, logs estruturados, métricas de negócio"),
        ("Autenticação",    "OAuth 2.0, SAML 2.0 (Enterprise), JWT"),
    ], header=["Camada", "Tecnologias"])

    story.append(PageBreak())

    chapter_header(story, st, "D", "Arquitetura Modular",
        "Módulos principais e suas responsabilidades.")

    kv_table(story, [
        ("Ingestão de Projeto",    "Conectores de repositório, upload, validação e normalização"),
        ("Parser & AST Engine",    "Parsing multi-linguagem com Tree-sitter, geração de AST"),
        ("Motor de Indexação",     "Indexação incremental, controle de versão de artefatos"),
        ("Grafo de Dependências",  "Construção e manutenção do grafo de relações entre entidades"),
        ("Banco Vetorial",         "Geração e armazenamento de embeddings para RAG"),
        ("Motor de IA",            "Orquestrador de agentes, gerenciamento de contexto e memória"),
        ("Documentador",           "Geração de README, Wiki, diagramas e relatórios"),
        ("Debugger Assistido",     "Diagnóstico de falhas com análise de impacto e rastreabilidade"),
        ("Módulo de Ensino",       "Trilhas, quizzes, flashcards e modo professor interativo"),
        ("Visualization Engine",   "Preview, diagramas, sandbox e comparação visual"),
        ("Interface Conversacional","Chat com IA, histórico de sessão e memória de projeto"),
    ], header=["Módulo", "Responsabilidade"])

    story.append(PageBreak())

    chapter_header(story, st, "E", "Engine de Análise e Indexação",
        "Fluxo interno da análise desde a importação até o mapa de conhecimento.")

    flow_table(story, [
        "Importação (repositório / upload / paste)",
        "Normalização e filtro de arquivos ignorados",
        "Parser multi-linguagem com Tree-sitter",
        "Geração de AST por arquivo",
        "Extração de símbolos (classes, funções, variáveis, imports)",
        "Indexação no banco relacional",
        "Geração de embeddings semânticos",
        "Armazenamento no banco vetorial",
        "Construção do grafo de dependências",
        "Análise de arquitetura e padrões",
        "Evento AnáliseConcluída disparado",
        "Dashboard atualizado para o usuário",
    ])

    story.append(PageBreak())

    chapter_header(story, st, "F", "Infraestrutura e DevOps")

    bullets(story, st, [
        "Ambientes: desenvolvimento (Docker Compose), staging, produção (Kubernetes)",
        "Deploy contínuo via GitHub Actions com gates de qualidade",
        "Multi-tenant com isolamento de dados por organização",
        "Backups automatizados com retenção configurável",
        "Disaster Recovery com RTO < 4h e RPO < 1h (Enterprise)",
        "Monitoramento com alertas proativos via OpenTelemetry",
        "Rate limiting e proteção contra abuso por API key",
        "Escalabilidade horizontal dos serviços de análise",
    ])

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE III — INTELIGÊNCIA ARTIFICIAL
# ─────────────────────────────────────────────────────────────────────────────
def parte_iii(story, st):
    part_divider(story, st, "III", "INTELIGÊNCIA ARTIFICIAL",
                 "Agentes, RAG, Memória, Prompt Engine e Reasoning")

    chapter_header(story, st, "A", "Arquitetura da IA",
        "O sistema de IA do GoReadCode é multi-agente, com orquestrador central "
        "e especialistas independentes por domínio.")

    para(story, st,
        "A IA do GoReadCode não é um único modelo respondendo perguntas genéricas. "
        "É um sistema orquestrado de agentes especializados, cada um com acesso ao "
        "contexto construído durante a análise do projeto. O orquestrador decide "
        "qual agente (ou combinação de agentes) é mais adequado para cada solicitação, "
        "com base no tipo de pergunta e no contexto disponível.")

    story.append(PageBreak())

    chapter_header(story, st, "B", "Agentes Especializados")

    kv_table(story, [
        ("Arquiteto",               "Analisa e explica a arquitetura do projeto, padrões e decisões de design"),
        ("Professor",               "Explica código de forma didática, com analogias e exemplos progressivos"),
        ("Debugger",                "Diagnostica falhas, identifica causas raiz e analisa impacto de mudanças"),
        ("Documentador",            "Gera README, Wiki, docstrings e documentação técnica estruturada"),
        ("Segurança",               "Detecta vulnerabilidades OWASP, segredos expostos e dependências inseguras"),
        ("Performance",             "Identifica gargalos, N+1 queries, memory leaks e ineficiências"),
        ("Qualidade",               "Detecta code smells, violações de SOLID, duplicações e acoplamento"),
        ("Testador",                "Analisa cobertura existente e gera estratégia e exemplos de testes"),
        ("Engenheiro Reverso",      "Reconstrói arquitetura, fluxos e diagramas a partir do código"),
        ("Orquestrador",            "Seleciona e coordena agentes, gerencia contexto e memória de sessão"),
    ], header=["Agente", "Especialidade"])

    story.append(PageBreak())

    chapter_header(story, st, "C", "RAG e Banco Vetorial",
        "Retrieval-Augmented Generation garante respostas precisas e rastreáveis.")

    para(story, st,
        "O RAG (Retrieval-Augmented Generation) é o mecanismo que permite aos agentes "
        "responder sobre o código específico do usuário sem precisar enviar o projeto "
        "inteiro ao LLM a cada consulta. Funciona em três etapas:")

    flow_table(story, [
        "1. Indexação — código fragmentado em chunks semânticos e convertido em embeddings",
        "2. Recuperação — busca por similaridade vetorial dos chunks mais relevantes à pergunta",
        "3. Geração — LLM recebe a pergunta + chunks relevantes + contexto do projeto",
    ])

    bullets(story, st, [
        "Embeddings gerados com modelos de código especializados",
        "Banco vetorial com busca híbrida (semântica + keyword)",
        "Reranking dos resultados para maior precisão",
        "Cache de embeddings para reutilização em consultas subsequentes",
        "Toda resposta cita as evidências do código que embasam a conclusão",
    ])

    story.append(PageBreak())

    chapter_header(story, st, "D", "Memória e Contexto")

    kv_table(story, [
        ("Memória de Sessão",   "Histórico da conversa atual, perguntas e respostas anteriores"),
        ("Memória de Projeto",  "Contexto acumulado do projeto: arquitetura, decisões, análises"),
        ("Memória de Usuário",  "Preferências, nível de experiência, áreas de interesse"),
        ("Contexto de Arquivo", "Análise do arquivo atual e seus relacionamentos"),
        ("Contexto Global",     "Mapa completo do projeto para referências cruzadas"),
    ], header=["Tipo de Memória", "Descrição"])

    story.append(PageBreak())

    chapter_header(story, st, "E", "Prompt Engine e Reasoning")

    bullets(story, st, [
        "Templates de prompt por tipo de análise e por agente especializado",
        "Injeção dinâmica de contexto relevante (RAG + memória)",
        "Chain-of-Thought para diagnósticos complexos",
        "Indicação explícita do nível de confiança por afirmação",
        "Fallback gracioso quando o contexto é insuficiente",
        "Controle de alucinações via grounding em evidências do código",
        "Suporte a múltiplos provedores de LLM (Anthropic, OpenAI, Groq, Ollama)",
        "Seleção dinâmica de modelo por custo-benefício e tipo de tarefa",
    ])

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE IV — VISUALIZAÇÃO INTELIGENTE
# ─────────────────────────────────────────────────────────────────────────────
def parte_iv(story, st):
    part_divider(story, st, "IV", "VISUALIZAÇÃO INTELIGENTE",
                 "Intelligent Visualization Engine — Preview, Sandbox e Diagramas")

    chapter_header(story, st, "A", "Intelligent Visualization Engine",
        "Sempre que uma informação puder ser compreendida mais rapidamente por meio de "
        "uma representação visual, o GoReadCode deverá oferecer essa visualização.")

    para(story, st,
        "A Visualization Engine é responsável por representar visualmente tudo aquilo "
        "que puder ser melhor compreendido por meio de elementos gráficos, simulações "
        "e pré-visualizações. Seu objetivo é reduzir a necessidade de interpretar apenas "
        "código ou texto, oferecendo compreensão imediata do impacto de alterações e "
        "do comportamento da aplicação.")

    section(story, st, "A.1  Objetivos da Engine")
    bullets(story, st, [
        "Visualizar alterações antes da aplicação em produção",
        "Demonstrar impactos em tempo real",
        "Representar fluxos arquiteturais graficamente",
        "Simular interfaces de usuário",
        "Exibir diferenças lado a lado entre versões",
        "Facilitar análises arquiteturais com diagramas interativos",
        "Apoiar aprendizado e debugging com ilustrações contextuais",
    ])

    story.append(PageBreak())

    chapter_header(story, st, "B", "Preview Inteligente e Sandbox")

    section(story, st, "B.1  Preview de Interface")
    para(story, st,
        "Quando tecnicamente viável, o GoReadCode gera pré-visualização de componentes "
        "e telas sem necessidade de compilar o projeto completo.")

    kv_table(story, [
        ("React / Next.js",    "Preview automático do componente alterado"),
        ("Vue / Angular",      "Preview da página ou componente afetado"),
        ("HTML / CSS",         "Renderização imediata do markup e estilos"),
        ("Flutter",            "Simulação da tela mobile"),
        ("React Native",       "Preview do componente nativo"),
    ], header=["Framework", "Tipo de Preview"])

    section(story, st, "B.2  Sandbox Seguro")
    para(story, st,
        "A plataforma executa alterações em um ambiente isolado, permitindo que o usuário "
        "experimente mudanças, compare resultados e descarte alterações sem risco. "
        "Nenhum arquivo original é modificado até a confirmação explícita do usuário.")

    section(story, st, "B.3  Comparação Visual")
    para(story, st,
        "O usuário visualiza lado a lado o estado anterior e o estado após a alteração "
        "proposta, para diferentes tipos de artefatos: interfaces, componentes, páginas, "
        "diagramas, APIs, banco de dados e documentação.")

    story.append(PageBreak())

    chapter_header(story, st, "C", "Diagramas e Análise de Impacto")

    section(story, st, "C.1  Tipos de Diagramas Gerados")
    two_col_table(story,
        ["C4 Nível 1 — Contexto", "C4 Nível 2 — Containers",
         "C4 Nível 3 — Componentes", "C4 Nível 4 — Código",
         "UML — Classes", "UML — Sequência"],
        ["UML — Estados", "UML — Atividades",
         "Grafo de Dependências", "DER (Banco de Dados)",
         "Fluxo de APIs", "Arquitetura de Infraestrutura"],
        col_headers=["Diagrama", "Diagrama"])

    section(story, st, "C.2  Visualização de Impacto de Alterações")
    para(story, st,
        "Antes de modificar qualquer arquivo, a plataforma responde visualmente:")
    bullets(story, st, [
        "Quais arquivos e módulos serão afetados",
        "Quais telas e componentes de UI dependem da mudança",
        "Quais APIs e contratos poderão ser impactados",
        "Quais testes deverão ser revisados ou criados",
        "Estimativa de complexidade da mudança",
    ])

    section(story, st, "C.3  Linha do Tempo de Alterações")
    para(story, st,
        "O usuário navega pela evolução do projeto como uma timeline visual, "
        "comparando versões, releases e branches lado a lado.")

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE V — ESPECIFICAÇÃO TÉCNICA
# ─────────────────────────────────────────────────────────────────────────────
def parte_v(story, st):
    part_divider(story, st, "V", "ESPECIFICAÇÃO TÉCNICA",
                 "Banco de Dados, APIs e Segurança")

    chapter_header(story, st, "A", "Banco de Dados",
        "Modelagem das principais entidades persistidas.")

    section(story, st, "A.1  Princípios")
    bullets(story, st, [
        "PostgreSQL como banco principal (relacional + vetorial via pgvector)",
        "Redis para cache de sessões, embeddings frequentes e filas",
        "Todas as entidades possuem UUID como identificador primário",
        "Todos os artefatos são versionados (created_at, updated_at, version)",
        "Isolamento por tenant em todas as tabelas de dados de usuário",
        "Soft delete preferido ao hard delete para auditoria",
        "Migrações versionadas e reversíveis",
    ])

    section(story, st, "A.2  Tabelas Principais")
    kv_table(story, [
        ("workspaces",       "id, name, owner_id, settings, created_at, updated_at"),
        ("users",            "id, email, name, plan, preferences, created_at"),
        ("projects",         "id, workspace_id, name, origin, status, language, created_at"),
        ("project_analyses", "id, project_id, version, status, duration, metrics, created_at"),
        ("files",            "id, project_id, path, language, hash, size, content_ref"),
        ("symbols",          "id, file_id, type, name, signature, line_start, line_end"),
        ("dependencies",     "id, project_id, source_id, target_id, dep_type, weight"),
        ("embeddings",       "id, symbol_id, vector, model, created_at"),
        ("conversations",    "id, user_id, project_id, created_at, context"),
        ("messages",         "id, conversation_id, role, content, agent, created_at"),
        ("documents",        "id, project_id, type, version, content, format, created_at"),
        ("diagrams",         "id, project_id, type, data, layout, version, created_at"),
    ], header=["Tabela", "Campos Principais"])

    story.append(PageBreak())

    chapter_header(story, st, "B", "APIs",
        "Contratos REST principais da plataforma.")

    section(story, st, "B.1  Endpoints Principais")
    api_data = [
        ["Método", "Endpoint", "Descrição"],
        ["POST", "/api/projects/import", "Importa um projeto (repositório, upload ou paste)"],
        ["GET",  "/api/projects/:id", "Retorna dados e status do projeto"],
        ["GET",  "/api/projects/:id/analysis", "Retorna análise mais recente do projeto"],
        ["GET",  "/api/projects/:id/files", "Lista todos os arquivos indexados"],
        ["GET",  "/api/projects/:id/files/:fileId", "Retorna conteúdo e análise de um arquivo"],
        ["POST", "/api/projects/:id/chat", "Envia mensagem para a IA no contexto do projeto"],
        ["GET",  "/api/projects/:id/diagrams", "Lista diagramas gerados"],
        ["POST", "/api/projects/:id/documents/generate", "Solicita geração de documentação"],
        ["GET",  "/api/projects/:id/security", "Retorna relatório de segurança"],
        ["GET",  "/api/projects/:id/quality", "Retorna relatório de qualidade"],
        ["GET",  "/api/projects/:id/performance", "Retorna relatório de performance"],
        ["POST", "/api/projects/:id/explain", "Solicita explicação de arquivo, função ou linha"],
    ]
    tbl = Table(api_data, colWidths=[18*mm, 70*mm, 92*mm])
    tbl.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_PANEL]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), C_GREEN),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8))

    section(story, st, "B.2  Padrões de API")
    bullets(story, st, [
        "Autenticação via Bearer Token (JWT) em todos os endpoints protegidos",
        "Respostas paginadas com cursor para listas grandes",
        "Streaming via Server-Sent Events para respostas longas da IA",
        "Rate limiting por API key e por plano de usuário",
        "Versioning via header (Accept-Version) ou path (/api/v2/...)",
        "Erros padronizados com código, mensagem e campo problemático",
        "GraphQL disponível como alternativa ao REST para consultas complexas",
    ])

    story.append(PageBreak())

    chapter_header(story, st, "C", "Segurança",
        "Segurança é um requisito não funcional de primeira classe no GoReadCode.")

    bullets(story, st, [
        "Isolamento total de dados por tenant — nenhum dado de um projeto vaza para outro",
        "Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)",
        "API keys nunca armazenadas em texto plano — apenas hashes",
        "Tokens de repositório (GitHub, GitLab) criptografados com chave de tenant",
        "OWASP Top 10 aplicado à própria plataforma",
        "Logs de auditoria imutáveis para todas as operações sensíveis",
        "CSP, HSTS, X-Frame-Options e demais security headers configurados",
        "Varredura automática de dependências da plataforma (Dependabot)",
        "Pentesting periódico e disclosure responsável de vulnerabilidades",
    ])

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE VI — UX/UI
# ─────────────────────────────────────────────────────────────────────────────
def parte_vi(story, st):
    part_divider(story, st, "VI", "UX / UI",
                 "Identidade Visual, Telas e Acessibilidade")

    chapter_header(story, st, "A", "Identidade Visual")

    section(story, st, "A.1  Paleta de Cores")
    palette_data = [
        ["Token", "Hex", "Uso"],
        ["--accent",     "#388BFD", "Ações primárias, links, bordas de destaque"],
        ["--accent-2",   "#58A6FF", "Versão mais clara do accent para hover"],
        ["--bg",         "#0D1117", "Background principal da aplicação"],
        ["--sidebar",    "#161B22", "Background de sidebars e painéis secundários"],
        ["--panel",      "#1C2128", "Background de painéis e modais"],
        ["--border",     "#30363D", "Bordas, divisórias, separadores"],
        ["--text",       "#E6EDF3", "Texto principal"],
        ["--muted",      "#7D8590", "Texto secundário, placeholders, rótulos"],
        ["--green",      "#3FB950", "Sucesso, status positivo, testes passando"],
        ["--orange",     "#F0883E", "Aviso, atenção, itens pendentes"],
        ["--red",        "#FF7B72", "Erro, falha, código problemático, keywords"],
    ]
    tbl = Table(palette_data, colWidths=[40*mm, 30*mm, 110*mm])
    tbl.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_PANEL]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 6))

    section(story, st, "A.2  Tipografia")
    kv_table(story, [
        ("Interface (UI)",     "Inter — sans-serif moderno para textos de interface"),
        ("Código",             "JetBrains Mono / Fira Code — mono espaçado para código"),
        ("Tamanhos",           "10px (micro), 12px (caption), 14px (body), 16px (sub), 20px (h2), 28px (h1)"),
    ], header=["Família", "Uso"])

    story.append(PageBreak())

    chapter_header(story, st, "B", "Telas Principais")

    telas = [
        ("Landing Page",        "Hero com tagline, demonstração animada, CTAs, planos e depoimentos"),
        ("Onboarding",          "Fluxo de configuração do LLM, importação do primeiro projeto, tour guiado"),
        ("Dashboard",           "Lista de projetos, status de análise, atividade recente, atalhos"),
        ("Workspace",           "Sidebar com árvore de arquivos, viewer de código central, painel de análise"),
        ("Chat IA",             "Interface conversacional com histórico, sugestões de perguntas, contexto ativo"),
        ("Visualizador de Código", "Código com syntax highlight, linhas clicáveis, busca, minimap"),
        ("Diagramas",           "Visualização interativa de diagramas C4, UML, dependências e banco"),
        ("Relatório de Segurança", "Lista de vulnerabilidades com severidade, evidências e sugestões"),
        ("Relatório de Qualidade", "Code smells, métricas, acoplamento, complexidade ciclomática"),
        ("Modo Professor",      "Explicação progressiva com blocos didáticos, quizzes e trilha"),
        ("Modo Debug",          "Diagnóstico com causa raiz, impacto, comparação de soluções"),
        ("Documentação Gerada", "Preview do README/Wiki, opções de exportação (MD, PDF, HTML)"),
        ("Configurações",       "Perfil, LLM provider, API keys, preferências, plano"),
        ("Admin Enterprise",    "Gestão de usuários, times, projetos, uso e faturamento"),
    ]
    kv_table(story, telas, header=["Tela", "Conteúdo Principal"])

    story.append(PageBreak())

    chapter_header(story, st, "C", "Acessibilidade e Responsividade")

    bullets(story, st, [
        "WCAG 2.1 nível AA como padrão mínimo de acessibilidade",
        "Suporte completo a navegação por teclado",
        "Screen readers (ARIA labels e roles em todos os componentes)",
        "Contraste mínimo de 4.5:1 para texto normal",
        "Layout responsivo: desktop (prioridade), tablet e mobile (consulta)",
        "Temas claro e escuro (dark mode como padrão)",
        "Redução de movimento respeitada (prefers-reduced-motion)",
        "Internacionalização (i18n) preparada desde o início",
    ])

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────────────────────
#  PARTE VII — MANUAIS E ANEXOS
# ─────────────────────────────────────────────────────────────────────────────
def parte_vii(story, st):
    part_divider(story, st, "VII", "MANUAIS E ANEXOS",
                 "Comparativo Competitivo, Glossário e Visão de Longo Prazo")

    chapter_header(story, st, "A", "Comparativo Competitivo")

    comp_data = [
        ["Funcionalidade",             "GoReadCode", "Copilot", "Cursor", "Sourcegraph", "SonarQube"],
        ["Análise arquitetural",        "✓ Completa",  "✗",       "Parcial", "Parcial",    "✗"],
        ["Explicação linha a linha",    "✓",           "Parcial", "✓",      "✗",          "✗"],
        ["Modo Professor / Ensino",     "✓",           "✗",       "✗",      "✗",          "✗"],
        ["Engenharia Reversa",          "✓",           "✗",       "✗",      "Parcial",    "✗"],
        ["Auditoria de Segurança",      "✓",           "✗",       "✗",      "✗",          "✓"],
        ["Geração de Documentação",     "✓ Completa",  "Parcial", "Parcial","✗",          "✗"],
        ["Multi-LLM",                   "✓",           "✗",       "✓",      "✗",          "✗"],
        ["Suporte a múltiplas fontes",  "✓",           "✗",       "✗",      "✓",          "✗"],
        ["Diagramas automáticos",       "✓",           "✗",       "✗",      "Parcial",    "✗"],
        ["Análise de Performance",      "✓",           "✗",       "✗",      "✗",          "Parcial"],
        ["Sandbox Visual",              "✓",           "✗",       "✗",      "✗",          "✗"],
    ]
    tbl = Table(comp_data, colWidths=[52*mm, 28*mm, 22*mm, 22*mm, 30*mm, 26*mm])
    tbl.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), C_ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_PANEL]),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        # GoReadCode column highlight
        ('BACKGROUND', (1, 1), (1, -1), HexColor("#EBF4FF")),
        ('TEXTCOLOR', (1, 1), (1, -1), HexColor("#0D5BBE")),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 6))

    story.append(PageBreak())

    chapter_header(story, st, "B", "Glossário")

    kv_table(story, [
        ("AST",             "Abstract Syntax Tree — representação estruturada do código após parsing"),
        ("Bounded Context", "Limite explícito de um domínio no DDD, com modelo próprio"),
        ("Code Intelligence","Conjunto de capacidades de análise semântica de código-fonte por IA"),
        ("Code Smell",      "Padrão no código que indica possível problema de design"),
        ("Embedding",       "Representação vetorial numérica de texto ou código para busca semântica"),
        ("Grafo de Dependências","Estrutura que mapeia as relações entre módulos, arquivos e funções"),
        ("LLM",             "Large Language Model — modelo de linguagem de grande escala"),
        ("MCP",             "Model Context Protocol — protocolo para comunicação entre agentes e ferramentas"),
        ("N+1 Query",       "Anti-padrão onde N consultas extras são geradas para cada item de uma lista"),
        ("OWASP Top 10",    "Lista das 10 vulnerabilidades mais críticas em aplicações web"),
        ("Parser",          "Componente que lê código-fonte e o transforma em estrutura analisável"),
        ("RAG",             "Retrieval-Augmented Generation — geração aumentada por recuperação de contexto"),
        ("Tenant",          "Cliente ou organização isolada dentro de uma plataforma multi-inquilino"),
        ("Tree-sitter",     "Parser multi-linguagem incremental usado para análise de código"),
        ("Vector DB",       "Banco de dados otimizado para armazenar e consultar vetores de embedding"),
    ], header=["Termo", "Definição"])

    story.append(PageBreak())

    chapter_header(story, st, "C", "Visão de Longo Prazo (5–10 anos)",
        "Estratégia de evolução e novas fronteiras do GoReadCode.")

    section(story, st, "C.1  Evolução da Plataforma")
    bullets(story, st, [
        "Análise contínua de software com detecção proativa de regressões",
        "Preservação e transferência de conhecimento organizacional sobre sistemas",
        "Marketplace de agentes especializados desenvolvidos por terceiros",
        "Colaboração em tempo real entre múltiplos desenvolvedores no mesmo projeto",
        "Suporte a paradigmas emergentes (computação quântica, edge computing, WebAssembly)",
        "Integração com ecossistemas corporativos (Jira, Confluence, ServiceNow, SAP)",
        "Agentes com memória de longo prazo e aprendizado contínuo por organização",
    ])

    section(story, st, "C.2  Áreas de Expansão")
    bullets(story, st, [
        "GoReadCode for Education — plataforma dedicada ao ensino superior e técnico",
        "GoReadCode Enterprise On-Premise — versão completamente local para setores regulados",
        "GoReadCode CLI — ferramenta de linha de comando para integração em pipelines CI/CD",
        "GoReadCode Mobile — versão para revisão de código e consulta em dispositivos móveis",
        "GoReadCode for Open Source — tier gratuito expandido para projetos open source",
    ])

    section(story, st, "C.3  Tendências Incorporadas")
    bullets(story, st, [
        "Modelos de IA especializados em código com raciocínio (reasoning models)",
        "Análise multimodal — diagramas, wireframes e código em conjunto",
        "Agentes autônomos com supervisão humana para tarefas repetitivas de qualidade",
        "Plataforma de Code Intelligence como standard na engenharia de software",
    ])

    story.append(PageBreak())


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    output_path = "/sessions/adoring-festive-bohr/mnt/ReadCode/GoReadCode_PRD_v1.0.pdf"

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=18*mm, leftMargin=18*mm,
        topMargin=18*mm, bottomMargin=20*mm,
        title="GoReadCode — Master Product Book v1.0",
        author="GoReadCode Team",
        subject="Product Requirements Document",
    )

    st = build_styles()
    story = []
    page_tmpl = PageTemplate()

    # ── COVER (drawn directly on canvas, not via story) ──────────────────────
    # We use onFirstPage / onLaterPages
    def first_page(c, doc):
        draw_cover(c, doc)

    def later_pages(c, doc):
        page_tmpl(c, doc)

    # ── Build story ───────────────────────────────────────────────────────────
    # After cover, first real page starts with a blank page break
    story.append(PageBreak())

    # TOC
    build_toc(story, st)

    # Parts
    parte_i(story, st)
    parte_ii(story, st)
    parte_iii(story, st)
    parte_iv(story, st)
    parte_v(story, st)
    parte_vi(story, st)
    parte_vii(story, st)

    # Build PDF
    doc.build(story,
              onFirstPage=first_page,
              onLaterPages=later_pages)

    print(f"PDF gerado: {output_path}")


if __name__ == "__main__":
    main()

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from PIL import Image


NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

BOOK_KEYS = {
    "传说、历史与未竟之事": ("legends", "chronicles"),
    "归来、逝去与英雄史诗": ("heroic", "chronicles"),
    "已知世界的记载": ("known-world", "chronicles"),
    "忒诺亚Tierialand": ("tierialand", "geography"),
    "荒州WasteMarches": ("waste-marches", "geography"),
    "香料地SpiceLands": ("spice-lands", "geography"),
    "九州Nine Realms": ("nine-realms", "geography"),
    "拉尔斯尼亚Larsina": ("larsina", "geography"),
    "文兰Vinland": ("vinland", "geography"),
    "巴洛卢瑟Baloluth": ("baloluth", "geography"),
    "翡翠群岛Emerald Isles": ("emerald-isles", "geography"),
    "翠月The Jade": ("the-jade", "geography"),
}

BOOK_INTROS = {
    "legends": "圣树、诸神、世界与凡人的开端，在未竟之事中留下第一缕回声。",
    "heroic": "诸王归来，古史逝去，英雄与时代仍在回响。",
    "known-world": "文字、节日、神祇、种族、货币与典籍，构成已知世界的知识典藏。",
    "tierialand": "帝国、北方王国与百湖地，在古老王座与大河之间展开。",
    "waste-marches": "荒原、群山、矿峰与长城，记下边境诸国的坚韧与离散。",
    "spice-lands": "大漠、圣香、王冠与绿洲，汇成香料地的财富与信仰。",
    "nine-realms": "辽阔九州以山川与国度为轴，展开东方大地的秩序。",
    "larsina": "泰坦、山脉与远西海风，托起古老诸王的传承。",
    "vinland": "财富、未知与远西之地，写在开拓者海岸之外。",
    "baloluth": "晦朔、流离与黑豹守望，留存旧日王座的回忆。",
    "emerald-isles": "翡翠群岛的家园与国度，沉在岛屿、森林与海雾之间。",
    "the-jade": "翠月的荒原、宁静与永恒，像星图一样留在长夜。",
}


@dataclass
class Counters:
    book: int = 0
    section: int = 0
    article: int = 0
    heading: int = 0
    image: int = 0


@dataclass
class Leaf:
    id: str
    title: str
    blocks: list[dict] = field(default_factory=list)
    subheadings: list[dict] = field(default_factory=list)


def stable_part(value: str) -> str:
    ascii_part = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return ascii_part[:40] or "entry"


def paragraph_text(paragraph: ET.Element) -> str:
    return "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()


def paragraph_style(paragraph: ET.Element) -> str | None:
    props = paragraph.find("w:pPr", NS)
    if props is None:
        return None
    style = props.find("w:pStyle", NS)
    if style is None:
        return None
    return style.get(f"{{{NS['w']}}}val")


def heading_level(style: str | None) -> int | None:
    if not style or not style.isdigit():
        return None
    value = int(style)
    if 2 <= value <= 6:
        return value - 1
    return None


def image_targets(paragraph: ET.Element, rels: dict[str, str]) -> list[str]:
    targets: list[str] = []
    for blip in paragraph.findall(".//a:blip", NS):
        rel_id = blip.get(f"{{{NS['r']}}}embed") or blip.get(f"{{{NS['r']}}}link")
        if rel_id and rel_id in rels:
            targets.append(rels[rel_id])
    return targets


def read_relationships(docx: ZipFile) -> dict[str, str]:
    rel_root = ET.fromstring(docx.read("word/_rels/document.xml.rels"))
    rels: dict[str, str] = {}
    for rel in rel_root:
        rel_id = rel.attrib.get("Id")
        target = rel.attrib.get("Target")
        if rel_id and target:
            rels[rel_id] = target
    return rels


def book_preface_leaf(book: dict) -> Leaf:
    return Leaf(
        f"{book['key']}-preface",
        book["title"],
        book.setdefault("prefaceBlocks", []),
        [],
    )


def append_block(target: Leaf, block: dict) -> None:
    target.blocks.append(block)


def write_media(docx: ZipFile, target: str, media_dir: Path, copied: dict[str, dict]) -> dict:
    media_path = "word/" + target.lstrip("/")
    file_name = Path(target).name
    output_path = media_dir / file_name
    if target not in copied:
        payload = docx.read(media_path)
        output_path.write_bytes(payload)
        with Image.open(BytesIO(payload)) as image:
            copied[target] = {
                "fileName": file_name,
                "width": image.width,
                "height": image.height,
            }
    return copied[target]


def export_docx(docx_path: Path, media_dir: Path) -> tuple[list[dict], dict]:
    if media_dir.exists():
        shutil.rmtree(media_dir)
    media_dir.mkdir(parents=True, exist_ok=True)

    counters = Counters()
    style_counts: dict[str, int] = {}
    books: list[dict] = []
    current_book: dict | None = None
    current_section: dict | None = None
    current_article: dict | None = None
    copied_media: dict[str, dict] = {}

    def current_leaf() -> Leaf | None:
        if current_article is not None:
            return Leaf(
                current_article["id"],
                current_article["title"],
                current_article["blocks"],
                current_article["subheadings"],
            )
        if current_section is not None:
            return Leaf(
                current_section["id"],
                current_section["title"],
                current_section["blocks"],
                current_section.setdefault("subheadings", []),
            )
        if current_book is not None:
            return book_preface_leaf(current_book)
        return None

    with ZipFile(docx_path) as docx:
        rels = read_relationships(docx)
        root = ET.fromstring(docx.read("word/document.xml"))
        body = root.find(".//w:body", NS)
        if body is None:
            raise RuntimeError("Could not find document body")

        for child in body:
            if child.tag.split("}")[-1] != "p":
                continue

            text = paragraph_text(child)
            style = paragraph_style(child)
            level = heading_level(style)
            targets = image_targets(child, rels)

            if level is not None:
                style_counts[style or ""] = style_counts.get(style or "", 0) + 1

            if level == 1 and text:
                counters.book += 1
                key, category = BOOK_KEYS.get(text, (f"book-{counters.book:02d}", "geography"))
                current_book = {
                    "key": key,
                    "title": text,
                    "category": category,
                    "intro": BOOK_INTROS.get(key, ""),
                    "prefaceBlocks": [],
                    "rootArticles": [],
                    "sections": [],
                }
                books.append(current_book)
                current_section = None
                current_article = None
                continue

            if current_book is None:
                continue

            if level == 2 and text:
                counters.section += 1
                current_section = {
                    "id": f"{current_book['key']}-s{counters.section:03d}-{stable_part(text)}",
                    "title": text,
                    "blocks": [],
                    "articles": [],
                }
                current_book["sections"].append(current_section)
                current_article = None
                continue

            if level == 3 and text:
                if current_section is None:
                    counters.article += 1
                    current_article = {
                        "id": f"{current_book['key']}-a{counters.article:03d}-{stable_part(text)}",
                        "title": text,
                        "blocks": [],
                        "subheadings": [],
                    }
                    current_book["rootArticles"].append(current_article)
                    continue
                counters.article += 1
                current_article = {
                    "id": f"{current_book['key']}-a{counters.article:03d}-{stable_part(text)}",
                    "title": text,
                    "blocks": [],
                    "subheadings": [],
                }
                current_section["articles"].append(current_article)
                continue

            if level in (4, 5) and text:
                leaf = current_leaf()
                if leaf is None:
                    continue
                counters.heading += 1
                heading = {
                    "id": f"{leaf.id}-h{counters.heading:03d}-{stable_part(text)}",
                    "title": text,
                    "level": level,
                }
                leaf.subheadings.append(heading)
                append_block(leaf, {"type": "heading", **heading})
                continue

            leaf = current_leaf()
            if leaf is None:
                continue

            if text:
                append_block(leaf, {"type": "paragraph", "text": text})

            for target in targets:
                counters.image += 1
                media = write_media(docx, target, media_dir, copied_media)
                append_block(
                    leaf,
                    {
                        "type": "image",
                        "src": f"/docx-media/{media['fileName']}",
                        "width": media["width"],
                        "height": media["height"],
                        "alt": f"{current_book['title']} / {leaf.title} 插图",
                    },
                )

    stats = {
        "books": len(books),
        "sections": style_counts.get("3", 0),
        "articles": style_counts.get("4", 0),
        "deepHeadings": style_counts.get("5", 0) + style_counts.get("6", 0),
        "imageBlocks": counters.image,
        "imageFiles": len(copied_media),
        "styleCounts": style_counts,
    }
    return books, stats


def write_typescript(books: list[dict], stats: dict, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    books_json = json.dumps(books, ensure_ascii=False, indent=2)
    stats_json = json.dumps(stats, ensure_ascii=False, indent=2)
    output_path.write_text(
        "\n".join(
            [
                "export type ContentBlock =",
                "  | { type: 'paragraph'; text: string }",
                "  | { type: 'image'; src: string; width: number; height: number; alt: string }",
                "  | { type: 'heading'; id: string; title: string; level: number };",
                "",
                "export type SubheadingRef = {",
                "  id: string;",
                "  title: string;",
                "  level: number;",
                "};",
                "",
                "export type ContentArticle = {",
                "  id: string;",
                "  title: string;",
                "  blocks: ContentBlock[];",
                "  subheadings: SubheadingRef[];",
                "};",
                "",
                "export type ContentSection = {",
                "  id: string;",
                "  title: string;",
                "  blocks: ContentBlock[];",
                "  articles: ContentArticle[];",
                "  subheadings?: SubheadingRef[];",
                "};",
                "",
                "export type BookContent = {",
                "  key: string;",
                "  title: string;",
                "  category: 'chronicles' | 'geography';",
                "  intro: string;",
                "  prefaceBlocks: ContentBlock[];",
                "  rootArticles: ContentArticle[];",
                "  sections: ContentSection[];",
                "};",
                "",
                f"export const tieriaBooks = {books_json} satisfies BookContent[];",
                "",
                f"export const tieriaContentStats = {stats_json} as const;",
                "",
            ]
        ),
        encoding="utf-8",
    )


def default_docx_path() -> Path:
    title = "\u8bd7\u4eba\u65f6\u4ee3\u7684\u56de\u58f0"
    return Path("C:/Users/sqy20/Desktop") / title / f"{title}3.2.docx"


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract TIERIA content from the source DOCX.")
    parser.add_argument("--docx", type=Path, default=default_docx_path())
    parser.add_argument("--media-dir", type=Path, default=Path("public/docx-media"))
    parser.add_argument("--out", type=Path, default=Path("src/data/tieriaContent.ts"))
    args = parser.parse_args()

    if not args.docx.exists():
        print(f"Source DOCX not found: {args.docx}", file=sys.stderr)
        return 1

    books, stats = export_docx(args.docx, args.media_dir)
    write_typescript(books, stats, args.out)
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

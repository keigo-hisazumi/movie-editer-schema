"""movie-editer とビューアがやりとりするデータの形（JSON Schema）と、その検査。

正本は同じフォルダの schema.json。名前（"VideoDoc" など）は schema.json の definitions のキー。

    from movie_editer_schema import SCHEMA_VERSION, validate
    validate("VideoData", data)   # 形が違えば jsonschema.ValidationError
"""
from __future__ import annotations

import json
from functools import cache
from importlib import resources
from typing import Any

SCHEMA_VERSION = 2  # data の形式の版（movie-editer の publish.py の SCHEMA・ビューアの SCHEMA と同じ）


@cache
def schema() -> dict[str, Any]:
    """schema.json の中身。"""
    return json.loads(resources.files(__package__).joinpath("schema.json").read_text(encoding="utf-8"))


def names() -> list[str]:
    """検査できる形の名前の一覧。"""
    return sorted(schema()["definitions"])


@cache
def validator(name: str):
    """name の形を検査する jsonschema の Validator。"""
    from jsonschema import Draft7Validator

    s = schema()
    if name not in s["definitions"]:
        raise KeyError(f"schema.json に {name} がありません（あるもの：{', '.join(names())}）")
    root = {"$schema": s["$schema"], "$ref": f"#/definitions/{name}", "definitions": s["definitions"]}
    return Draft7Validator(root, format_checker=Draft7Validator.FORMAT_CHECKER)


def _leaf(e):
    """anyOf（「null か オブジェクト」など）の誤りは、中のいちばん深い誤りにする（どこが違うか分かるように）。"""
    while e.context:
        e = max(e.context, key=lambda c: len(c.absolute_path))
    return e


def errors(name: str, obj: Any) -> list[str]:
    """obj が name の形と違う所（無ければ空）。場所は VideoData.topic_cuts[0].cut.start のように書く。"""
    out = []
    found = [_leaf(e) for e in validator(name).iter_errors(obj)]
    for e in sorted(found, key=lambda e: list(map(str, e.absolute_path))):
        where = "".join(f"[{p}]" if isinstance(p, int) else f".{p}" for p in e.absolute_path)
        out.append(f"{name}{where}: {e.message}")
    return out


def validate(name: str, obj: Any) -> None:
    """obj が name の形と違えば jsonschema.ValidationError（いちばん分かりやすい1つ）。"""
    from jsonschema.exceptions import best_match

    err = best_match(validator(name).iter_errors(obj))
    if err is not None:
        raise _leaf(err)


def validate_video_doc(doc: dict[str, Any]) -> None:
    """Firestore の videos/{動画名} のドキュメントを、中の data（JSON 文字列）まで検査する。"""
    validate("VideoDoc", doc)
    validate("VideoData", json.loads(doc["data"]))


def validate_sources_doc(doc: dict[str, Any]) -> None:
    """Firestore の sources/all のドキュメントを、中の data（JSON 文字列）まで検査する。"""
    validate("SourcesDoc", doc)
    validate("SourceItems", json.loads(doc["data"]))

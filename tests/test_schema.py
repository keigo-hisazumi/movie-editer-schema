"""schema.json そのものと、見本（examples/）の検査。"""
from __future__ import annotations

import copy
import json
import re
from pathlib import Path

import pytest
from jsonschema import Draft7Validator, ValidationError

import movie_editer_schema as mes

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = {
    "video-doc": "VideoDoc",
    "video-data": "VideoData",
    "sources-doc": "SourcesDoc",
    "source-items": "SourceItems",
    "request-doc": "RequestDoc",
    "learning-doc": "LearningDoc",
}


def example(name: str):
    return json.loads((ROOT / "examples" / f"{name}.json").read_text(encoding="utf-8"))


def test_schema_is_valid():
    Draft7Validator.check_schema(mes.schema())


def test_refs_resolve():
    text = json.dumps(mes.schema())
    for ref in set(re.findall(r'"#/definitions/(\w+)"', text)):
        assert ref in mes.schema()["definitions"], ref


@pytest.mark.parametrize("file,name", EXAMPLES.items())
def test_examples_valid(file, name):
    assert mes.errors(name, example(file)) == []


def test_video_doc_with_data():
    mes.validate_video_doc(example("video-doc"))


def test_sources_doc_with_data():
    mes.validate_sources_doc(example("sources-doc"))


def test_unknown_field_rejected():
    """パイプラインがフィールドを足したら、schema.json も直さないと通らない（ずれに気付くため）。"""
    d = example("video-data")
    d["new_field"] = 1
    assert any("new_field" in e for e in mes.errors("VideoData", d))


def test_missing_field_rejected():
    d = example("video-data")
    del d["topic_cuts"][0]["files"]
    with pytest.raises(ValidationError):
        mes.validate("VideoData", d)


def test_error_location():
    d = example("video-data")
    d["topic_cuts"][0]["cut"]["start"] = "6:12"
    (msg,) = mes.errors("VideoData", d)
    assert msg.startswith("VideoData.topic_cuts[0].cut.start:")


def test_request_action_enum():
    r = copy.deepcopy(example("request-doc"))
    r["action"] = "make"
    with pytest.raises(ValidationError):
        mes.validate("RequestDoc", r)


def test_unknown_name():
    with pytest.raises(KeyError):
        mes.validate("Nope", {})


def test_versions_agree():
    """版が SCHEMA_VERSION・ts/index.ts・package.json・pyproject.toml でそろう（パッケージの版の major が形式の版）。"""
    ts = (ROOT / "ts" / "index.ts").read_text(encoding="utf-8")
    assert re.search(r"SCHEMA_VERSION = (\d+);", ts).group(1) == str(mes.SCHEMA_VERSION)
    pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    py = re.search(r'^version = "([^"]+)"', (ROOT / "pyproject.toml").read_text(encoding="utf-8"), re.M).group(1)
    assert pkg == py
    assert pkg.split(".")[0] == str(mes.SCHEMA_VERSION)

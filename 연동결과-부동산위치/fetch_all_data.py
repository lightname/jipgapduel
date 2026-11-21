"""연동결과-부동산위치 데이터 일괄 수집 스크립트."""

from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
sys.path.insert(0, str(ROOT))

from realestate_location_client import GroupAPIError, RealEstateLocationClient  # noqa: E402

KST = timezone(timedelta(hours=9))


def save_json(path: Path, data: Any) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return path.stat().st_size


def save_csv(path: Path, rows: list[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8-sig")
        return path.stat().st_size
    keys: list[str] = []
    seen: set[str] = set()
    for r in rows:
        for k in r:
            if k not in seen:
                seen.add(k)
                keys.append(k)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in keys})
    return path.stat().st_size


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    client = RealEstateLocationClient()
    started = datetime.now(KST).isoformat()
    results: list[dict[str, Any]] = []

    molit_jobs = [
        (106, "국토교통부_아파트 매매 실거래가 자료", "106_apt_trade", client.get_apt_trade),
        (44, "국토교통부_아파트 전월세 실거래가 자료", "044_apt_rent", client.get_apt_rent),
        (107, "국토교통부_오피스텔 전월세 실거래가 자료", "107_officetel_rent", client.get_officetel_rent),
    ]
    for api_id, title, stem, fn in molit_jobs:
        try:
            res = fn("11680", "202610", 50)
            b = save_json(DATA_DIR / f"{stem}.json", res) + save_csv(DATA_DIR / f"{stem}.csv", res["items"])
            results.append({"api_id": api_id, "title": title, "status": "SUCCESS", "http_status": 200, "records": len(res["items"]), "total_count": res["total_count"], "files": [f"data/{stem}.json", f"data/{stem}.csv"], "bytes": b})
        except GroupAPIError as exc:
            b = save_json(DATA_DIR / f"{stem}.json", {"api_id": api_id, "title": title, "status": "ERROR", "http_status": exc.status_code, "message": str(exc), "payload": exc.payload})
            results.append({"api_id": api_id, "title": title, "status": "ERROR", "http_status": exc.status_code, "records": 0, "message": str(exc), "files": [f"data/{stem}.json"], "bytes": b})

    try:
        res = client.get_legal_dong_code(1, 20)
        b = save_json(DATA_DIR / "046_legal_dong_code.json", res["raw"])
        results.append({"api_id": 46, "title": "행정안전부_행정표준코드_법정동코드", "status": "SUCCESS", "http_status": 200, "records": 20, "files": ["data/046_legal_dong_code.json"], "bytes": b})
    except GroupAPIError as exc:
        b = save_json(DATA_DIR / "046_legal_dong_code.json", {"api_id": 46, "status": "AUTH_OR_KEY_ERROR", "http_status": exc.status_code, "message": str(exc), "payload": exc.payload})
        results.append({"api_id": 46, "title": "행정안전부_행정표준코드_법정동코드", "status": "AUTH_OR_KEY_ERROR", "http_status": exc.status_code, "records": 0, "message": str(exc), "files": ["data/046_legal_dong_code.json"], "bytes": b})

    try:
        res = client.search_kakao_local("강남역")
        docs = res["raw"].get("documents", [])
        b = save_json(DATA_DIR / "018_kakao_local.json", res["raw"]) + save_csv(DATA_DIR / "018_kakao_local.csv", docs)
        results.append({"api_id": 18, "title": "카카오 로컬 REST API", "status": "SUCCESS", "http_status": 200, "records": len(docs), "files": ["data/018_kakao_local.json", "data/018_kakao_local.csv"], "bytes": b})
    except GroupAPIError as exc:
        b = save_json(DATA_DIR / "018_kakao_local.json", {"api_id": 18, "status": "MISSING_KEY", "http_status": exc.status_code, "message": str(exc)})
        results.append({"api_id": 18, "title": "카카오 로컬 REST API", "status": "MISSING_KEY", "http_status": exc.status_code, "records": 0, "message": str(exc), "files": ["data/018_kakao_local.json"], "bytes": b})

    summary = {"folder": "연동결과-부동산위치", "related_ideas": ["1 집값 맞히기 데일리", "6 자치구 리그", "11 오시는 길 한 장", "20 네가 태어난 날"], "started_at": started, "finished_at": datetime.now(KST).isoformat(), "targets_executed": len(results), "success_count": sum(1 for r in results if r["status"] == "SUCCESS"), "error_count": sum(1 for r in results if r["status"] != "SUCCESS"), "results": results}
    save_json(DATA_DIR / "collection_summary.json", summary)
    print(f"연동결과-부동산위치: 성공 {summary['success_count']} / 미수집 {summary['error_count']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""부동산 실거래가(행 6, 45, 46, 107, 108, 109) + 연관 법정동코드 일괄 수집 스크립트.

실행:
    python 부동산실거래/fetch_all_data.py
"""

from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
sys.path.insert(0, str(ROOT))

from real_estate_client import RealEstateAPIError, RealEstateClient  # noqa: E402

KST = timezone(timedelta(hours=9))
DEAL_YMD = "202610"
TARGET_DISTRICTS: list[tuple[str, str]] = [
    ("11680", "서울특별시 강남구"),
    ("11650", "서울특별시 서초구"),
    ("11710", "서울특별시 송파구"),
    ("11440", "서울특별시 마포구"),
    ("11110", "서울특별시 종로구"),
]


def save_json(path: Path, data: Any) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2)
    path.write_text(text, encoding="utf-8")
    return path.stat().st_size


def save_csv(path: Path, rows: list[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8-sig")
        return path.stat().st_size

    fieldnames: list[str] = []
    seen: set[str] = set()
    for row in rows:
        for k in row.keys():
            if k not in seen:
                seen.add(k)
                fieldnames.append(k)

    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})
    return path.stat().st_size


def collect_molit_api(
    excel_row: int,
    api_id: int,
    title: str,
    file_stem: str,
    fetcher: Callable[[str, str, int, int], dict[str, Any]],
) -> dict[str, Any]:
    all_items: list[dict[str, Any]] = []
    district_stats: list[dict[str, Any]] = []
    total_available = 0

    for lawd_cd, district_name in TARGET_DISTRICTS:
        try:
            res = fetcher(lawd_cd, DEAL_YMD, 1, 100)
        except RealEstateAPIError as exc:
            err_path = DATA_DIR / f"{file_stem}.json"
            err_bytes = save_json(
                err_path,
                {
                    "excel_row": excel_row,
                    "api_id": api_id,
                    "title": title,
                    "deal_ymd": DEAL_YMD,
                    "status": "AUTH_OR_KEY_ERROR",
                    "http_status": exc.status_code,
                    "message": str(exc),
                    "payload": exc.payload,
                },
            )
            return {
                "excel_row": excel_row,
                "api_id": api_id,
                "title": title,
                "status": "AUTH_OR_KEY_ERROR",
                "http_status": exc.status_code,
                "records": 0,
                "message": str(exc),
                "files": [f"data/{file_stem}.json"],
                "bytes": err_bytes,
            }

        items = res["items"]
        total_available += res["total_count"]
        for item in items:
            enriched = {"_lawd_cd": lawd_cd, "_district": district_name, "_deal_ymd": DEAL_YMD}
            enriched.update(item)
            all_items.append(enriched)

        district_stats.append(
            {
                "lawd_cd": lawd_cd,
                "district": district_name,
                "fetched": len(items),
                "total_count": res["total_count"],
            }
        )

    json_path = DATA_DIR / f"{file_stem}.json"
    csv_path = DATA_DIR / f"{file_stem}.csv"
    b_json = save_json(
        json_path,
        {
            "excel_row": excel_row,
            "api_id": api_id,
            "title": title,
            "deal_ymd": DEAL_YMD,
            "district_stats": district_stats,
            "fetched_count": len(all_items),
            "total_available": total_available,
            "items": all_items,
        },
    )
    b_csv = save_csv(csv_path, all_items)

    return {
        "excel_row": excel_row,
        "api_id": api_id,
        "title": title,
        "status": "SUCCESS",
        "http_status": 200,
        "records": len(all_items),
        "total_available": total_available,
        "district_stats": district_stats,
        "files": [f"data/{file_stem}.json", f"data/{file_stem}.csv"],
        "bytes": b_json + b_csv,
    }


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    client = RealEstateClient()
    started_at = datetime.now(KST).isoformat()

    targets: list[tuple[int, int, str, str, Callable[[str, str, int, int], dict[str, Any]]]] = [
        (6, 5, "국토교통부_아파트매매 실거래 상세 자료", "005_apt_trade_dev", client.get_apt_trade_dev),
        (45, 44, "국토교통부_아파트 전월세 실거래가 자료", "044_apt_rent", client.get_apt_rent),
        (46, 45, "국토교통부_연립다세대 전월세 실거래가 자료", "045_rowhouse_rent", client.get_rowhouse_rent),
        (107, 106, "국토교통부_아파트 매매 실거래가 자료", "106_apt_trade", client.get_apt_trade),
        (108, 107, "국토교통부_오피스텔 전월세 실거래가 자료", "107_officetel_rent", client.get_officetel_rent),
        (109, 108, "국토교통부_단독/다가구 전월세 실거래가 자료", "108_house_rent", client.get_house_rent),
    ]

    results: list[dict[str, Any]] = []
    for idx, (excel_row, api_id, title, stem, fn) in enumerate(targets, start=1):
        print(f"[{idx}/7] 행 {excel_row} (순번 {api_id}) {title} 조회 중 (DEAL_YMD={DEAL_YMD}, 서울 5개구)...")
        res = collect_molit_api(excel_row, api_id, title, stem, fn)
        results.append(res)
        if res["status"] == "SUCCESS":
            print(f"  -> 성공: {res['records']}건 수집 (5개구 전체 모수 {res['total_available']}건)")
        else:
            print(f"  -> 인증/권한 오류(HTTP {res['http_status']}): {res['message']}")

    # [연관] 행 47 (순번 46) 행정안전부_행정표준코드_법정동코드
    print("[7/7] [연관] 행 47 (순번 46) 행정안전부_행정표준코드_법정동코드 조회 중...")
    try:
        dong_res = client.get_legal_dong_code(page_no=1, num_of_rows=100, resp_type="json")
        b_dong = save_json(DATA_DIR / "046_legal_dong_code.json", dong_res["raw"])
        results.append(
            {
                "excel_row": 47,
                "api_id": 46,
                "title": "[연관] 행정안전부_행정표준코드_법정동코드",
                "status": "SUCCESS",
                "http_status": dong_res["http_status"],
                "records": len(dong_res["raw"].get("StanReginCd", [{}])[1].get("row", []))
                if isinstance(dong_res["raw"].get("StanReginCd"), list)
                else 0,
                "files": ["data/046_legal_dong_code.json"],
                "bytes": b_dong,
            }
        )
        print("  -> 성공")
    except RealEstateAPIError as exc:
        b_dong = save_json(
            DATA_DIR / "046_legal_dong_code.json",
            {
                "excel_row": 47,
                "api_id": 46,
                "title": "[연관] 행정안전부_행정표준코드_법정동코드",
                "status": "AUTH_OR_KEY_ERROR",
                "http_status": exc.status_code,
                "message": str(exc),
                "payload": exc.payload,
            },
        )
        results.append(
            {
                "excel_row": 47,
                "api_id": 46,
                "title": "[연관] 행정안전부_행정표준코드_법정동코드",
                "status": "AUTH_OR_KEY_ERROR",
                "http_status": exc.status_code,
                "records": 0,
                "message": str(exc),
                "files": ["data/046_legal_dong_code.json"],
                "bytes": b_dong,
            }
        )
        print(f"  -> 인증/권한 오류(HTTP {exc.status_code}): {exc}")

    finished_at = datetime.now(KST).isoformat()
    success_count = sum(1 for r in results if r["status"] == "SUCCESS")
    error_count = len(results) - success_count

    summary = {
        "folder": "부동산실거래",
        "deal_ymd": DEAL_YMD,
        "districts": [{"lawd_cd": code, "name": name} for code, name in TARGET_DISTRICTS],
        "started_at": started_at,
        "finished_at": finished_at,
        "targets_executed": len(results),
        "success_count": success_count,
        "error_count": error_count,
        "results": results,
    }
    save_json(DATA_DIR / "collection_summary.json", summary)
    print(f"\n완료: 성공 {success_count}건 / 인증오류 {error_count}건 (요약: 부동산실거래/data/collection_summary.json)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""연동결과-부동산위치 통합 API 클라이언트.

대상 API (Spark_데이터API.xlsx 순번):
- 106: 국토교통부_아파트 매매 실거래가 자료
- 44 : 국토교통부_아파트 전월세 실거래가 자료
- 107: 국토교통부_오피스텔 전월세 실거래가 자료
- 46 : 행정안전부_행정표준코드_법정동코드
- 18 : 카카오 로컬 REST API (KAKAO_REST_API_KEY 필요)
"""

from __future__ import annotations

import os
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_CERT_KEY = (
    "7hRZOo6SOTp4miWPxgjvv3TFD%2BnbxDtQwR%2BDX4RwSLnSb5oSmykX3ELBX3xbbinpBpjbN%2Bgh3hGPi%2FrWyOJ2GA%3D%3D"
)
DEFAULT_KAKAO_KEY = "d17618bb4a38405cacdfeeb0319f52d7"


class GroupAPIError(RuntimeError):
    def __init__(self, message: str, status_code: int | None = None, payload: Any = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


class RealEstateLocationClient:
    def __init__(self, cert_key: str | None = None, kakao_key: str | None = None, timeout: int = 30) -> None:
        self.cert_key = cert_key or os.getenv("DATA_GO_KR_KEY") or DEFAULT_CERT_KEY
        self.kakao_key = kakao_key or os.getenv("KAKAO_REST_API_KEY") or DEFAULT_KAKAO_KEY
        self.timeout = timeout
        self.session = self._build_session()

    @staticmethod
    def _build_session() -> requests.Session:
        session = requests.Session()
        retry = Retry(total=3, backoff_factor=0.5, status_forcelist=(429, 500, 502, 503, 504), allowed_methods=("GET",))
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def _encoded_key(self) -> str:
        return self.cert_key if "%" in self.cert_key else urllib.parse.quote(self.cert_key, safe="")

    def _molit_xml(self, path: str, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 50) -> dict[str, Any]:
        qs = urllib.parse.urlencode({"LAWD_CD": lawd_cd, "DEAL_YMD": deal_ymd, "pageNo": page_no, "numOfRows": num_of_rows})
        url = f"https://apis.data.go.kr{path}?serviceKey={self._encoded_key()}&{qs}"
        resp = self.session.get(url, timeout=self.timeout)
        if resp.status_code >= 400:
            raise GroupAPIError(f"HTTP {resp.status_code}", resp.status_code, resp.text)
        root = ET.fromstring(resp.text)
        if root.tag == "OpenAPI_ServiceResponse":
            raise GroupAPIError(root.findtext(".//errMsg") or "OPENAPI_ERROR", resp.status_code, resp.text)
        code = (root.findtext(".//header/resultCode") or "").strip()
        if code not in ("00", "0", "000", ""):
            raise GroupAPIError(f"[{code}] {root.findtext('.//header/resultMsg')}", resp.status_code, resp.text)
        items = [{c.tag: (c.text or "").strip() for c in it} for it in root.findall(".//body/items/item")]
        total = root.findtext(".//body/totalCount") or str(len(items))
        return {"http_status": resp.status_code, "total_count": int(total) if total.isdigit() else len(items), "items": items}

    def get_apt_trade(self, lawd_cd: str = "11680", deal_ymd: str = "202610", num_of_rows: int = 50) -> dict[str, Any]:
        return self._molit_xml("/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade", lawd_cd, deal_ymd, 1, num_of_rows)

    def get_apt_rent(self, lawd_cd: str = "11680", deal_ymd: str = "202610", num_of_rows: int = 50) -> dict[str, Any]:
        return self._molit_xml("/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent", lawd_cd, deal_ymd, 1, num_of_rows)

    def get_officetel_rent(self, lawd_cd: str = "11680", deal_ymd: str = "202610", num_of_rows: int = 50) -> dict[str, Any]:
        return self._molit_xml("/1613000/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent", lawd_cd, deal_ymd, 1, num_of_rows)

    def get_legal_dong_code(self, page_no: int = 1, num_of_rows: int = 20) -> dict[str, Any]:
        qs = urllib.parse.urlencode({"pageNo": page_no, "numOfRows": num_of_rows, "type": "json"})
        url = f"https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList?ServiceKey={self._encoded_key()}&{qs}"
        resp = self.session.get(url, timeout=self.timeout)
        if resp.status_code >= 400:
            raise GroupAPIError(f"HTTP {resp.status_code}", resp.status_code, resp.text)
        return {"http_status": resp.status_code, "raw": resp.json()}

    def search_kakao_local(self, query: str = "강남역") -> dict[str, Any]:
        if not self.kakao_key:
            raise GroupAPIError("KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.", 401, None)
        url = "https://dapi.kakao.com/v2/local/search/keyword.json"
        resp = self.session.get(url, params={"query": query, "size": 5, "page": 1}, headers={"Authorization": f"KakaoAK {self.kakao_key}"}, timeout=self.timeout)
        if resp.status_code >= 400:
            raise GroupAPIError(f"HTTP {resp.status_code}", resp.status_code, resp.text)
        return {"http_status": resp.status_code, "raw": resp.json()}

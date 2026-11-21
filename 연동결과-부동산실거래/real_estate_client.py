"""국토교통부 부동산 실거래가(매매·전월세) 및 연관 법정동코드 통합 API 클라이언트.

대상 API (엑셀 행 번호 / 순번 기준):
- 행 6   (순번 5)  : 국토교통부_아파트매매 실거래 상세 자료 (RTMSDataSvcAptTradeDev)
- 행 45  (순번 44) : 국토교통부_아파트 전월세 실거래가 자료 (RTMSDataSvcAptRent)
- 행 46  (순번 45) : 국토교통부_연립다세대 전월세 실거래가 자료 (RTMSDataSvcRHRent)
- 행 107 (순번 106): 국토교통부_아파트 매매 실거래가 자료 (RTMSDataSvcAptTrade)
- 행 108 (순번 107): 국토교통부_오피스텔 전월세 실거래가 자료 (RTMSDataSvcOffiRent)
- 행 109 (순번 108): 국토교통부_단독/다가구 전월세 실거래가 자료 (RTMSDataSvcSHRent)
- [연관] 행 47 (순번 46): 행정안전부_행정표준코드_법정동코드 (StanReginCd)
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
BASE_URL = "https://apis.data.go.kr"


class RealEstateAPIError(RuntimeError):
    """부동산 실거래가 API 호출 실패 시 발생하는 예외."""

    def __init__(self, message: str, status_code: int | None = None, payload: Any = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


class RealEstateClient:
    """국토교통부 부동산 실거래가 및 행정안전부 법정동코드 통합 클라이언트."""

    def __init__(self, cert_key: str | None = None, timeout: int = 30) -> None:
        self.cert_key = cert_key or os.getenv("REAL_ESTATE_CERT_KEY") or DEFAULT_CERT_KEY
        self.timeout = timeout
        self.session = self._build_session()

    @staticmethod
    def _build_session() -> requests.Session:
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.6,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET",),
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.headers.update({"User-Agent": "SparkDataAPI-RealEstate/1.0"})
        return session

    def _encoded_key(self) -> str:
        """이미 URL 인코딩된 인증키는 이중 인코딩하지 않고 그대로 반환한다."""
        if "%" in self.cert_key:
            return self.cert_key
        return urllib.parse.quote(self.cert_key, safe="")

    def _build_url(self, path: str, params: dict[str, Any], key_param: str = "serviceKey") -> str:
        encoded_params = urllib.parse.urlencode(
            {k: v for k, v in params.items() if v is not None},
            doseq=True,
        )
        base = f"{BASE_URL}{path}?{key_param}={self._encoded_key()}"
        return f"{base}&{encoded_params}" if encoded_params else base

    @staticmethod
    def _element_to_dict(elem: ET.Element) -> dict[str, str]:
        return {child.tag: (child.text or "").strip() for child in elem}

    def _request_molit_xml(self, path: str, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        """국토교통부 실거래가 XML API 공통 요청 및 파싱."""
        url = self._build_url(
            path,
            {
                "LAWD_CD": lawd_cd,
                "DEAL_YMD": deal_ymd,
                "pageNo": page_no,
                "numOfRows": num_of_rows,
            },
            key_param="serviceKey",
        )
        resp = self.session.get(url, timeout=self.timeout)
        text = resp.text

        if resp.status_code >= 400:
            raise RealEstateAPIError(
                f"HTTP {resp.status_code} ({BASE_URL}{path})",
                status_code=resp.status_code,
                payload=text,
            )

        try:
            root = ET.fromstring(text)
        except ET.ParseError as exc:
            raise RealEstateAPIError(f"XML 파싱 실패: {exc}", status_code=resp.status_code, payload=text) from exc

        # OpenAPI 게이트웨이 공통 에러 처리
        if root.tag == "OpenAPI_ServiceResponse":
            err_msg = root.findtext(".//errMsg") or "UNKNOWN_ERROR"
            auth_msg = root.findtext(".//returnAuthMsg") or ""
            raise RealEstateAPIError(
                f"{err_msg}: {auth_msg}".strip(": "),
                status_code=resp.status_code,
                payload=text,
            )

        result_code = (root.findtext(".//header/resultCode") or "").strip()
        result_msg = (root.findtext(".//header/resultMsg") or "").strip()
        if result_code not in ("00", "0", "000", ""):
            raise RealEstateAPIError(
                f"API 오류 [{result_code}]: {result_msg}",
                status_code=resp.status_code,
                payload=text,
            )

        items = [self._element_to_dict(item) for item in root.findall(".//body/items/item")]
        total_count_text = (root.findtext(".//body/totalCount") or "0").strip()
        total_count = int(total_count_text) if total_count_text.isdigit() else len(items)

        return {
            "http_status": resp.status_code,
            "result_code": result_code,
            "result_msg": result_msg,
            "total_count": total_count,
            "page_no": page_no,
            "num_of_rows": num_of_rows,
            "items": items,
        }

    # 1. 행 6 (순번 5): 국토교통부_아파트매매 실거래 상세 자료
    def get_apt_trade_dev(self, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        return self._request_molit_xml(
            "/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev",
            lawd_cd=lawd_cd,
            deal_ymd=deal_ymd,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )

    # 2. 행 45 (순번 44): 국토교통부_아파트 전월세 실거래가 자료
    def get_apt_rent(self, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        return self._request_molit_xml(
            "/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent",
            lawd_cd=lawd_cd,
            deal_ymd=deal_ymd,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )

    # 3. 행 46 (순번 45): 국토교통부_연립다세대 전월세 실거래가 자료
    def get_rowhouse_rent(self, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        return self._request_molit_xml(
            "/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent",
            lawd_cd=lawd_cd,
            deal_ymd=deal_ymd,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )

    # 4. 행 107 (순번 106): 국토교통부_아파트 매매 실거래가 자료
    def get_apt_trade(self, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        return self._request_molit_xml(
            "/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade",
            lawd_cd=lawd_cd,
            deal_ymd=deal_ymd,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )

    # 5. 행 108 (순번 107): 국토교통부_오피스텔 전월세 실거래가 자료
    def get_officetel_rent(self, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        return self._request_molit_xml(
            "/1613000/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent",
            lawd_cd=lawd_cd,
            deal_ymd=deal_ymd,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )

    # 6. 행 109 (순번 108): 국토교통부_단독/다가구 전월세 실거래가 자료
    def get_house_rent(self, lawd_cd: str, deal_ymd: str, page_no: int = 1, num_of_rows: int = 100) -> dict[str, Any]:
        return self._request_molit_xml(
            "/1613000/RTMSDataSvcSHRent/getRTMSDataSvcSHRent",
            lawd_cd=lawd_cd,
            deal_ymd=deal_ymd,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )

    # [연관] 행 47 (순번 46): 행정안전부_행정표준코드_법정동코드
    def get_legal_dong_code(
        self,
        page_no: int = 1,
        num_of_rows: int = 100,
        resp_type: str = "json",
        locatadd_nm: str | None = None,
    ) -> dict[str, Any]:
        path = "/1741000/StanReginCd/getStanReginCdList"
        params: dict[str, Any] = {
            "pageNo": page_no,
            "numOfRows": num_of_rows,
            "type": resp_type,
        }
        if locatadd_nm:
            params["locatadd_nm"] = locatadd_nm
        url = self._build_url(path, params, key_param="ServiceKey")
        resp = self.session.get(url, timeout=self.timeout)
        if resp.status_code >= 400:
            raise RealEstateAPIError(
                f"HTTP {resp.status_code} ({BASE_URL}{path})",
                status_code=resp.status_code,
                payload=resp.text,
            )
        if resp_type == "xml":
            return {"http_status": resp.status_code, "raw": resp.text}
        data = resp.json()
        if "OpenAPI_ServiceResponse" in data:
            hdr = data["OpenAPI_ServiceResponse"].get("cmmMsgHeader", {})
            raise RealEstateAPIError(
                f"{hdr.get('errMsg', 'ERROR')}: {hdr.get('returnAuthMsg', '')}".strip(": "),
                status_code=resp.status_code,
                payload=data,
            )
        return {"http_status": resp.status_code, "raw": data}

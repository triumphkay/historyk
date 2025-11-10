#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test.txt 파일을 파싱하여 각 왕의 시기를 JSON으로 구조화
"""

import json
import re

def parse_date(year_str, month_str=None, day_str=None):
    """날짜 문자열을 "YYYY", "YYYY-MM", "YYYY-MM-DD" 형식의 문자열로 변환 (있는 정보만 표시)"""
    def safe_int(value):
        """안전하게 정수로 변환 (특수 값 처리)"""
        if not value or not value.strip():
            return None
        value = value.strip()
        # TRUE, FALSE 같은 특수 값은 None으로 처리
        if value.upper() in ['TRUE', 'FALSE', '???']:
            return None
        try:
            return int(value)
        except ValueError:
            return None
    
    year = safe_int(year_str) if year_str else None
    month = safe_int(month_str) if month_str else None
    day = safe_int(day_str) if day_str else None
    
    # 날짜가 없으면 None 반환
    if year is None:
        return None
    
    # year는 그대로 사용 (음수도 포함)
    year_str = str(year)
    
    # day가 있으면 "YYYY-MM-DD" 형식
    if day is not None:
        month_str = f"{month:02d}" if month is not None else "01"
        day_str = f"{day:02d}"
        return f"{year_str}-{month_str}-{day_str}"
    
    # month가 있으면 "YYYY-MM" 형식
    if month is not None:
        month_str = f"{month:02d}"
        return f"{year_str}-{month_str}"
    
    # year만 있으면 "YYYY" 형식
    return year_str

def parse_line(line):
    """한 줄을 파싱하여 정보 추출"""
    # 탭으로 분리
    parts = line.split('\t')
    parts = [p.strip() for p in parts if p.strip()]
    
    if len(parts) < 1:
        return None
    
    # 들여쓰기 레벨 계산 (탭 개수)
    indent_level = len(line) - len(line.lstrip('\t'))
    
    # 첫 번째 컬럼은 항상 이름
    name = parts[0]
    
    # 숫자 패턴 찾기 (음수 포함)
    numbers = []
    king_name = None
    
    for i, part in enumerate(parts[1:], 1):
        # 숫자로 시작하는지 확인 (음수 포함)
        if part and (part[0].isdigit() or (part.startswith('-') and len(part) > 1 and part[1].isdigit())):
            numbers.append(part)
        elif part and not king_name and i == 1:
            # 첫 번째 비숫자 컬럼은 왕 이름일 가능성이 높음
            king_name = part
    
    # 날짜 정보 추출 (숫자 개수에 따라 다르게 해석)
    # 항상 시작 정보가 먼저 오고 종료 정보가 나중에 옵니다
    num_count = len(numbers)
    
    if num_count == 0:
        start_year = start_month = start_day = end_year = end_month = end_day = None
    elif num_count == 1:
        # 시작년만 있음
        start_year = numbers[0]
        start_month = start_day = end_year = end_month = end_day = None
    elif num_count == 2:
        # 시작년, 종료년
        start_year = numbers[0]
        end_year = numbers[1]
        start_month = start_day = end_month = end_day = None
    elif num_count == 3:
        # 시작년, 시작월, 종료년
        start_year = numbers[0]
        start_month = numbers[1]
        end_year = numbers[2]
        start_day = end_month = end_day = None
    elif num_count == 4:
        # 시작년, 시작월, 종료년, 종료월
        start_year = numbers[0]
        start_month = numbers[1]
        end_year = numbers[2]
        end_month = numbers[3]
        start_day = end_day = None
    elif num_count == 5:
        # 시작년, 시작월, 종료년, 종료월, 종료일 (시작일이 없는 경우가 많음)
        start_year = numbers[0]
        start_month = numbers[1]
        end_year = numbers[2]
        end_month = numbers[3]
        end_day = numbers[4]
        start_day = None
    else:  # num_count >= 6
        # 시작년, 시작월, 시작일, 종료년, 종료월, 종료일
        start_year = numbers[0]
        start_month = numbers[1]
        start_day = numbers[2]
        end_year = numbers[3]
        end_month = numbers[4]
        end_day = numbers[5]
    
    result = {
        "indent_level": indent_level,
        "name": name,
        "from": parse_date(start_year, start_month, start_day) if start_year else None,
        "to": parse_date(end_year, end_month, end_day) if end_year else None
    }
    
    if king_name:
        result["king_name"] = king_name
    
    return result

def extract_kings(hierarchy):
    """계층 구조에서 각 국가별로 왕들의 리스트 추출"""
    result = []
    
    for nation_item in hierarchy:
        nation_name = nation_item["name"]
        kings_list = []
        
        # 재귀적으로 왕들을 추출하는 함수
        def collect_kings(item, parent_king_name=None):
            # 왕 이름 결정: king_name이 있으면 그것을, 없으면 name을 사용
            king_name = item.get("king_name") or item.get("name")
            
            # 시기가 있는 경우에만 리스트에 추가 (왕의 이름과 시기만)
            if item.get("from") or item.get("to"):
                king_entry = {
                    "name": king_name
                }
                if item.get("from"):
                    king_entry["from"] = item["from"]
                if item.get("to"):
                    king_entry["to"] = item["to"]
                kings_list.append(king_entry)
            
            # 하위 항목들도 재귀적으로 처리
            if "children" in item:
                for child in item["children"]:
                    collect_kings(child, king_name)
        
        # 국가의 하위 항목들을 순회하며 왕들을 수집
        if "children" in nation_item:
            for child in nation_item["children"]:
                collect_kings(child)
        
        # 국가 자체에 시기가 있고 왕 이름이 있으면 추가
        if (nation_item.get("from") or nation_item.get("to")) and nation_item.get("king_name"):
            king_entry = {
                "name": nation_item["king_name"]
            }
            if nation_item.get("from"):
                king_entry["from"] = nation_item["from"]
            if nation_item.get("to"):
                king_entry["to"] = nation_item["to"]
            kings_list.append(king_entry)
        
        # 국가 정보 생성
        nation_data = {
            "nation": nation_name
        }
        # 왕이 있는 경우에만 list 추가
        if kings_list:
            nation_data["list"] = kings_list
        result.append(nation_data)
    
    return result

def build_hierarchy(lines_data):
    """들여쓰기 레벨에 따라 계층 구조 생성"""
    result = []
    stack = []  # 각 레벨의 현재 부모를 추적
    
    for item in lines_data:
        if item is None:
            continue
            
        level = item["indent_level"]
        
        # 현재 항목 생성
        current = {
            "name": item["name"],
            "from": item["from"],
            "to": item["to"]
        }
        
        # 왕 이름이 있으면 추가
        if "king_name" in item:
            current["king_name"] = item["king_name"]
        
        # 스택을 현재 레벨에 맞게 조정 (부모 찾기)
        while len(stack) > level:
            stack.pop()
        
        # 부모 찾기
        if level == 0:
            # 최상위 레벨
            result.append(current)
        else:
            # 부모가 있어야 함
            if len(stack) > 0:
                parent = stack[-1]
                if "children" not in parent:
                    parent["children"] = []
                parent["children"].append(current)
        
        # 스택에 현재 항목 추가 (다음 레벨의 부모가 됨)
        while len(stack) <= level:
            stack.append(None)
        stack[level] = current
    
    return result

def main():
    # sources/test 파일 읽기
    input_file = "/Users/trmp/Desktop/historyk/sources/test"
    output_file = "/Users/trmp/Desktop/historyk/database/kings_periods.json"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 각 줄 파싱
    lines_data = []
    for line in lines:
        parsed = parse_line(line)
        if parsed:
            lines_data.append(parsed)
    
    # 계층 구조 생성
    hierarchy = build_hierarchy(lines_data)
    
    # 각 국가별로 왕들의 리스트 추출
    nations_data = extract_kings(hierarchy)
    
    # JSON으로 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(nations_data, f, ensure_ascii=False, indent=2)
    
    print(f"JSON 파일이 생성되었습니다: {output_file}")
    print(f"총 {len(nations_data)}개의 국가가 처리되었습니다.")

if __name__ == "__main__":
    main()


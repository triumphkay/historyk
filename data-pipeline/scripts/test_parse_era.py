
import json
from pathlib import Path

# Mock data based on file contents seen previously
AGE_LIST = [
    "박정희 정부",
    "대한민국 박정희 정부",
    "대한민국"
]

KEY_AGE_MAP = {
    "대한민국": [
        "이승만 정부",
        "박정희 정부",
        "전두환 정부"
    ]
}

SUB_ERAS = {
    "전기", "중기", "후기", "말기",
    "상대", "중대", "하대",
    "무신집권기", "원간섭기", "세도정치기", "개항기",
    "무단통치기", "문화통치기", "민족말살기"
}

def parse_era(text, age_list, key_age_map, sub_eras):
    # Find longest match
    best_match = ""
    for age in age_list:
        if text.startswith(age):
            if len(age) > len(best_match):
                best_match = age
    
    print(f"DEBUG: text='{text}', best_match='{best_match}'")

    if not best_match:
        # Check special case: Republic of Korea rulers without '대한민국' prefix
        # key_age_map["대한민국"] contains list of rulers/govts
        kr_rulers = key_age_map.get("대한민국", [])
        for ruler in kr_rulers:
            if text.startswith(ruler):
                # Found a KR ruler
                if len(ruler) > len(best_match):
                    best_match = ruler
        
        if best_match:
            # It matched a KR ruler directly
            # Per instruction: det_era should be "OOO 정부" (full name), era "대한민국"
            print("DEBUG: Matched KR ruler directly")
            return ("대한민국", "", best_match), text[len(best_match):].strip()
            
        # Check for missing nation prefix (Point 2)
        for nation, rulers in key_age_map.items():
            if nation == "대한민국": continue
            for ruler in rulers:
                if text.startswith(ruler):
                    return None, f"MISSING_NATION_PREFIX: {ruler} (found in {nation})"
        
        # Point 1: Unknown Era
        return None, f"UNKNOWN_ERA: {text}"

    remaining = text[len(best_match):].strip()
    parts = best_match.split()
    
    era = ""
    sub_era = ""
    det_era = ""
    
    found_nation = None
    for nation in key_age_map.keys():
        if best_match.startswith(nation):
            if found_nation is None or len(nation) > len(found_nation):
                found_nation = nation
    
    if found_nation:
        era = found_nation
        suffix = best_match[len(found_nation):].strip()
        others = suffix.split() if suffix else []
    else:
        era = parts[0]
        others = parts[1:]

    if others:
        if others[0] in sub_eras:
            sub_era = others[0]
            if len(others) > 1:
                det_era = " ".join(others[1:])
        else:
            det_era = " ".join(others)
            
    # Special handling for "정부" suffix (e.g. "이승만 정부")
    # If det_era ends with "정부", it implies Era is "대한민국"
    # And per instruction: det_era should contain the full government name
    if det_era.endswith("정부"):
        if not era or era == "대한민국":
            era = "대한민국"
        era = "대한민국"
        # We keep det_era as is (e.g. "이승만 정부")
            
    return (era, sub_era, det_era), remaining

# Test cases
test_inputs = [
    "박정희 정부 1968년",
    "대한민국 박정희 정부 1972년",
    "이승만 정부 1960년"
]

for inp in test_inputs:
    print(f"--- Testing: {inp} ---")
    result, rem = parse_era(inp, AGE_LIST, KEY_AGE_MAP, SUB_ERAS)
    print(f"Result: {result}, Remaining: {rem}\n")

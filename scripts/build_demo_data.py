#!/opt/anaconda3/bin/python3
"""Build browser-friendly demo data from repo-backed artifacts."""

from __future__ import annotations

import json
import math
import os
import sys
import tempfile
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
TEMP_FLIGHT_DIR = ROOT / "temp_flight"
TEMP_AIRBNB_DIR = ROOT / "temp_airbnb"
TEMP_CRASH_DIR = ROOT / "temp_crash"
DOODLE_MODEL_URL = "https://raw.githubusercontent.com/VinChan2001/doodle-digit-app/main/models/digits_knn.pkl"


@dataclass(frozen=True)
class Airport:
    airport_id: int
    code: str
    city: str
    state: str
    state_name: str
    lat: float
    lon: float
    altitude: int
    timezone: str


AIRPORTS = {
    "ATL": Airport(10397, "ATL", "Atlanta", "GA", "Georgia", 33.6367, -84.4281, 1026, "America/New_York"),
    "DFW": Airport(11298, "DFW", "Dallas/Fort Worth", "TX", "Texas", 32.8968, -97.0380, 603, "America/Chicago"),
    "ORD": Airport(13930, "ORD", "Chicago", "IL", "Illinois", 41.9786, -87.9048, 668, "America/Chicago"),
    "LAX": Airport(12892, "LAX", "Los Angeles", "CA", "California", 33.9425, -118.4081, 125, "America/Los_Angeles"),
    "DEN": Airport(11292, "DEN", "Denver", "CO", "Colorado", 39.8617, -104.6732, 5431, "America/Denver"),
    "JFK": Airport(12478, "JFK", "New York", "NY", "New York", 40.6399, -73.7787, 13, "America/New_York"),
}

ROUTES = [
    ("atl-jfk", "ATL", "JFK"),
    ("atl-ord", "ATL", "ORD"),
    ("dfw-den", "DFW", "DEN"),
    ("dfw-jfk", "DFW", "JFK"),
    ("ord-lax", "ORD", "LAX"),
    ("lax-jfk", "LAX", "JFK"),
]

AIRLINES = {
    "AA": "American Airlines",
    "DL": "Delta Air Lines",
    "UA": "United Airlines",
    "WN": "Southwest Airlines",
    "NK": "Spirit Airlines",
}

TIME_BANDS = {
    "morning_rush": {"label": "Morning Rush", "dep": 730},
    "midday": {"label": "Midday", "dep": 1300},
    "evening_rush": {"label": "Evening Rush", "dep": 1800},
    "redeye": {"label": "Red-eye", "dep": 2330},
}

SEASONS = {
    "winter": {"label": "Winter", "date": "2025-01-15", "holiday_date": "2025-12-24", "holiday_name": "Christmas"},
    "spring": {"label": "Spring", "date": "2025-04-10", "holiday_date": "2025-04-20", "holiday_name": "Easter"},
    "summer": {"label": "Summer", "date": "2025-07-10", "holiday_date": "2025-07-03", "holiday_name": "Independence Day"},
    "fall": {"label": "Fall", "date": "2025-10-10", "holiday_date": "2025-11-26", "holiday_name": "Thanksgiving"},
}

WEATHER_PRESETS = {
    "clear": {"label": "Clear", "severity": 0},
    "rain": {"label": "Rain", "severity": 4},
    "storm": {"label": "Thunderstorms", "severity": 8},
}

CRASH_TIME_BANDS = [
    ("Overnight", -1, 5),
    ("Morning commute", 5, 11),
    ("Midday", 11, 16),
    ("Evening commute", 16, 20),
    ("Night", 20, 24),
]

CRASH_LANE_BANDS = [
    ("0 closed", -1, 0),
    ("1 closed", 0, 1),
    ("2 closed", 1, 2),
    ("3+ closed", 2, 99),
]

CRASH_VEHICLE_BANDS = [
    ("1 vehicle", -1, 1),
    ("2 vehicles", 1, 2),
    ("3-4 vehicles", 2, 4),
    ("5+ vehicles", 4, 999),
]


def ensure_output_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def percentile(series: pd.Series, value: float) -> float:
    below_or_equal = float((series <= value).sum())
    return round(below_or_equal / len(series), 4)


def round_stat(series: pd.Series, quantile: float) -> float:
    return round(float(series.quantile(quantile)), 4)


def assign_band(value: float, ranges: list[tuple[str, float, float]]) -> str:
    for label, lower, upper in ranges:
        if lower < value <= upper:
            return label
    return ranges[-1][0]


def export_doodle_data() -> None:
    temp_path = Path(tempfile.mkstemp(suffix=".pkl")[1])
    urllib.request.urlretrieve(DOODLE_MODEL_URL, temp_path)

    try:
        model = joblib.load(temp_path)
    finally:
        temp_path.unlink(missing_ok=True)

    payload = {
        "sourceRepo": "https://github.com/VinChan2001/doodle-digit-app",
        "notes": "Exported from models/digits_knn.pkl used by app.py",
        "nNeighbors": int(model.n_neighbors),
        "metric": model.metric,
        "weights": model.weights,
        "vectors": [[int(round(value)) for value in row] for row in model._fit_X],
        "labels": [int(label) for label in model._y],
    }

    with (DATA_DIR / "doodle_knn.json").open("w") as handle:
        json.dump(payload, handle, separators=(",", ":"))


def export_airbnb_data() -> None:
    scores = pd.read_csv(TEMP_AIRBNB_DIR / "high_booking_rate_group15.csv")["x"].astype(float)
    thresholds = [0.1, 0.15, 0.25, 0.5, 0.75, 0.9]

    payload = {
        "sourceRepo": "https://github.com/VinChan2001/Predicting-High-Booking-Rate-Airbnb-Listings",
        "notes": (
            "Built from high_booking_rate_group15.csv and the reported metrics in submission_final.ipynb. "
            "The repo publishes the scored output, so the browser interaction focuses on shortlist tuning."
        ),
        "metrics": {
            "testAuc": 0.9166,
            "testAccuracy": 0.8730,
            "crossValAuc": 0.9141,
            "crossValAccuracy": 0.8697,
            "trainingRows": 92067,
            "featureCount": 978,
            "submissionRows": int(len(scores)),
            "placement": "3rd / 20+ teams",
        },
        "drivers": [
            "Review quality",
            "Host response rate",
            "Pricing ratios",
            "Amenities vectors",
            "Host tenure",
        ],
        "scoreSummary": {
            "min": round(float(scores.min()), 6),
            "mean": round(float(scores.mean()), 6),
            "median": round_stat(scores, 0.5),
            "p75": round_stat(scores, 0.75),
            "p90": round_stat(scores, 0.9),
            "p95": round_stat(scores, 0.95),
            "p99": round_stat(scores, 0.99),
            "max": round(float(scores.max()), 6),
        },
        "thresholdSnapshots": [
            {
                "threshold": threshold,
                "selectedCount": int((scores >= threshold).sum()),
                "selectedShare": round(float((scores >= threshold).mean()), 4),
                "averageSelectedScore": round(float(scores[scores >= threshold].mean()), 4),
                "percentileCut": percentile(scores, threshold),
            }
            for threshold in thresholds
        ],
        "scores": [round(float(score), 6) for score in scores.tolist()],
    }

    with (DATA_DIR / "airbnb_booking_scores.json").open("w") as handle:
        json.dump(payload, handle, separators=(",", ":"))


def haversine(left: Airport, right: Airport) -> int:
    radius_miles = 3958.8
    phi1 = math.radians(left.lat)
    phi2 = math.radians(right.lat)
    delta_phi = math.radians(right.lat - left.lat)
    delta_lambda = math.radians(right.lon - left.lon)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    return round(2 * radius_miles * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def distance_group(distance: int) -> int:
    thresholds = [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250]
    for index, threshold in enumerate(thresholds, start=1):
        if distance < threshold:
            return index
    return 10


def add_minutes(hhmm: int, minutes: int) -> int:
    hour = hhmm // 100
    minute = hhmm % 100
    total_minutes = (hour * 60 + minute + minutes) % (24 * 60)
    return (total_minutes // 60) * 100 + (total_minutes % 60)


def risk_factors(inputs: dict) -> list[str]:
    factors = []
    hour = int(str(inputs["DEP_TIME"]).zfill(4)[:2])

    if 6 <= hour <= 9:
        factors.append("Morning rush hour flight")
    elif 16 <= hour <= 19:
        factors.append("Evening rush hour flight")
    elif hour >= 23 or hour <= 5:
        factors.append("Red-eye flight")
    else:
        factors.append("Mid-day flight")

    max_severity = inputs["MAX_WEATHER_SEVERITY"]
    if max_severity >= 7:
        factors.append(f"Severe weather ({max_severity}/10)")
    elif max_severity >= 4:
        factors.append(f"Moderate weather ({max_severity}/10)")

    month = datetime.strptime(inputs["FL_DATE"], "%Y-%m-%d").month
    if month in [11, 12]:
        factors.append("Holiday season")
    elif month in [6, 7, 8]:
        factors.append("Summer travel season")
    elif month in [3, 4]:
        factors.append("Spring break period")

    if inputs["IS_HOLIDAY"] and inputs["HOLIDAY_TRAVEL_PERIOD"]:
        factors.append("Peak holiday travel period")

    if inputs["DAY_OF_WEEK"] in [5, 7]:
        factors.append("Weekend travel day")

    distance = inputs["DISTANCE"]
    if distance < 300:
        factors.append("Short flight")
    elif distance > 2000:
        factors.append("Long-haul flight")

    return factors


def export_flight_data() -> None:
    os.chdir(TEMP_FLIGHT_DIR)
    sys.path.insert(0, str(TEMP_FLIGHT_DIR))
    import predictor  # type: ignore

    model, scaler = predictor.load_model()

    route_metadata = []
    scenarios = {}

    for route_id, origin_code, dest_code in ROUTES:
        origin = AIRPORTS[origin_code]
        destination = AIRPORTS[dest_code]
        distance = haversine(origin, destination)
        route_metadata.append(
            {
                "id": route_id,
                "origin": origin.code,
                "destination": destination.code,
                "originCity": origin.city,
                "destinationCity": destination.city,
                "distance": distance,
            }
        )

        block_minutes = max(90, round(distance / 500 * 60) + 60)

        for airline_code, airline_name in AIRLINES.items():
            for time_band_id, time_band in TIME_BANDS.items():
                for season_id, season in SEASONS.items():
                    for holiday_flag in [0, 1]:
                        date_string = season["holiday_date"] if holiday_flag else season["date"]
                        holiday_name = season["holiday_name"] if holiday_flag else ""
                        flight_date = datetime.strptime(date_string, "%Y-%m-%d")
                        arrival_time = add_minutes(time_band["dep"], block_minutes)

                        for origin_weather_id, origin_weather in WEATHER_PRESETS.items():
                            for dest_weather_id, dest_weather in WEATHER_PRESETS.items():
                                inputs = {
                                    "YEAR": flight_date.year,
                                    "MONTH": flight_date.month,
                                    "FL_DATE": date_string,
                                    "OP_UNIQUE_CARRIER": airline_code,
                                    "OP_CARRIER": airline_name,
                                    "OP_CARRIER_FL_NUM": 100,
                                    "ORIGIN_AIRPORT_ID": origin.airport_id,
                                    "ORIGIN": origin.code,
                                    "ORIGIN_CITY_NAME": origin.city,
                                    "ORIGIN_STATE_ABR": origin.state,
                                    "ORIGIN_STATE_NM": origin.state_name,
                                    "DEST_AIRPORT_ID": destination.airport_id,
                                    "DEST": destination.code,
                                    "DEST_CITY_NAME": destination.city,
                                    "DEST_STATE_ABR": destination.state,
                                    "DEST_STATE_NM": destination.state_name,
                                    "DEP_TIME": time_band["dep"],
                                    "CRS_DEP_TIME": time_band["dep"],
                                    "CRS_ARR_TIME": arrival_time,
                                    "FLIGHTS": 1,
                                    "DISTANCE": distance,
                                    "DISTANCE_GROUP": distance_group(distance),
                                    "SOURCE_FILE": "Repo Demo Grid",
                                    "ORIGIN_LATITUDE_x": origin.lat,
                                    "ORIGIN_LONGITUDE_x": origin.lon,
                                    "ORIGIN_ALTITUDE": origin.altitude,
                                    "ORIGIN_TIMEZONE": origin.timezone,
                                    "DEST_LATITUDE_x": destination.lat,
                                    "DEST_LONGITUDE_x": destination.lon,
                                    "DEST_ALTITUDE": destination.altitude,
                                    "DEST_TIMEZONE": destination.timezone,
                                    "ORIGIN_CONDITIONS": origin_weather["label"],
                                    "ORIGIN_WEATHER_SEVERITY": origin_weather["severity"],
                                    "DEST_CONDITIONS": dest_weather["label"],
                                    "DEST_WEATHER_SEVERITY": dest_weather["severity"],
                                    "MAX_WEATHER_SEVERITY": max(origin_weather["severity"], dest_weather["severity"]),
                                    "ORIGIN_EXTREME_WEATHER": 1 if origin_weather["severity"] >= 7 else 0,
                                    "DEST_EXTREME_WEATHER": 1 if dest_weather["severity"] >= 7 else 0,
                                    "WEATHER_IMPACT_SCORE": (origin_weather["severity"] + dest_weather["severity"]) / 2,
                                    "IS_HOLIDAY": holiday_flag,
                                    "HOLIDAY_NAME": holiday_name,
                                    "HOLIDAY_TRAVEL_PERIOD": holiday_flag,
                                    "DAY_OF_MONTH": flight_date.day,
                                    "DAY_OF_WEEK": flight_date.weekday() + 1,
                                    "IS_WEEKEND": 1 if flight_date.weekday() >= 5 else 0,
                                    "WEEK_OF_YEAR": flight_date.isocalendar()[1],
                                    "SEASON": season["label"],
                                }

                                processed = predictor.preprocess_inputs(inputs)
                                prediction, probability, threshold = predictor.predict_delay(processed, model, scaler)
                                confidence = probability if prediction == 1 else 1 - probability

                                scenario_key = "|".join(
                                    [
                                        route_id,
                                        airline_code,
                                        time_band_id,
                                        season_id,
                                        str(holiday_flag),
                                        origin_weather_id,
                                        dest_weather_id,
                                    ]
                                )

                                scenarios[scenario_key] = {
                                    "probability": round(float(probability), 4),
                                    "prediction": int(prediction),
                                    "threshold": float(threshold),
                                    "confidence": round(float(confidence), 4),
                                    "holidayName": holiday_name,
                                    "riskFactors": risk_factors(inputs),
                                }

    payload = {
        "sourceRepo": "https://github.com/VinChan2001/Flight-Delay-Prediction-Pipeline",
        "notes": "Generated from predictor.py using flight_delay_xgboost_model.json and flight_delay_xgboost_scaler.pkl",
        "routes": route_metadata,
        "airlines": [{"code": code, "name": name} for code, name in AIRLINES.items()],
        "timeBands": [{"id": key, "label": value["label"], "dep": value["dep"]} for key, value in TIME_BANDS.items()],
        "seasons": [{"id": key, "label": value["label"]} for key, value in SEASONS.items()],
        "weatherPresets": [
            {"id": key, "label": value["label"], "severity": value["severity"]}
            for key, value in WEATHER_PRESETS.items()
        ],
        "scenarioCount": len(scenarios),
        "scenarios": scenarios,
    }

    with (DATA_DIR / "flight_scenarios.json").open("w") as handle:
        json.dump(payload, handle, separators=(",", ":"))


def export_crash_data() -> None:
    crash = pd.read_csv(TEMP_CRASH_DIR / "crash_info.csv")
    segments = pd.read_csv(TEMP_CRASH_DIR / "segment_info.csv")

    crash["start_tstamp"] = pd.to_datetime(crash["start_tstamp"], utc=True, errors="coerce")
    crash["closed_tstamp"] = pd.to_datetime(crash["closed_tstamp"], utc=True, errors="coerce")
    crash["duration_minutes"] = (
        crash["closed_tstamp"] - crash["start_tstamp"]
    ).dt.total_seconds() / 60

    crash = crash[(crash["duration_minutes"].notna()) & (crash["duration_minutes"] >= 0)].copy()
    duration_cap = float(crash["duration_minutes"].quantile(0.99))
    crash = crash[crash["duration_minutes"] <= duration_cap].copy()
    crash = crash.merge(segments, on="segment_id", how="left")

    crash["event_subtype"] = crash["event_subtype"].fillna("Unknown")
    crash["road_class"] = crash["road_class"].fillna("Unknown")
    crash["weather"] = crash["precipitation_flag"].replace({"No Percipitation": "Dry"}).fillna("Unknown")
    crash["lane_band"] = crash["closed_lanes"].fillna(0).map(lambda value: assign_band(float(value), CRASH_LANE_BANDS))
    crash["vehicle_band"] = crash["vehicle_count"].fillna(0).map(
        lambda value: assign_band(float(value), CRASH_VEHICLE_BANDS)
    )
    crash["time_band"] = crash["start_tstamp"].dt.hour.map(
        lambda hour: next(label for label, lower, upper in CRASH_TIME_BANDS if lower < hour <= upper)
    )

    payload = {
        "sourceRepo": "https://github.com/VinChan2001/Crash-Duration-Prediction",
        "notes": (
            "Built from crash_info.csv + segment_info.csv using the notebook's crash_duration_minutes target "
            "and the same 99th-percentile trim used to reduce extreme-duration noise."
        ),
        "modelMetrics": {
            "baselineLinearR2": 0.05,
            "tunedRandomForestR2": 0.28,
            "gradientBoostingR2": 0.30,
            "xgboostR2": 0.30,
        },
        "overall": {
            "count": int(len(crash)),
            "median": round_stat(crash["duration_minutes"], 0.5),
            "p90": round_stat(crash["duration_minutes"], 0.9),
            "p95": round_stat(crash["duration_minutes"], 0.95),
        },
        "options": {
            "eventSubtypes": sorted(crash["event_subtype"].dropna().unique().tolist()),
            "roadClasses": sorted(crash["road_class"].dropna().unique().tolist()),
            "weather": ["Dry", "Rain", "Snow"],
            "laneBands": [label for label, _, _ in CRASH_LANE_BANDS],
            "vehicleBands": [label for label, _, _ in CRASH_VEHICLE_BANDS],
            "timeBands": [label for label, _, _ in CRASH_TIME_BANDS],
        },
        "records": [
            {
                "eventSubtype": row.event_subtype,
                "roadClass": row.road_class,
                "weather": row.weather,
                "laneBand": row.lane_band,
                "vehicleBand": row.vehicle_band,
                "timeBand": row.time_band,
                "durationMinutes": round(float(row.duration_minutes), 2),
            }
            for row in crash.itertuples(index=False)
        ],
    }

    with (DATA_DIR / "crash_clearance_rows.json").open("w") as handle:
        json.dump(payload, handle, separators=(",", ":"))


def main() -> None:
    ensure_output_dir()
    export_doodle_data()
    export_airbnb_data()
    export_flight_data()
    export_crash_data()


if __name__ == "__main__":
    main()

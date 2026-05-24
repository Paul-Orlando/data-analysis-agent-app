import io
import json
import pandas as pd


def parse_file(file_bytes: bytes, filename: str) -> tuple[dict, pd.DataFrame]:
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif ext in ("xlsx", "xls"):
        df = pd.read_excel(io.BytesIO(file_bytes))
    elif ext == "json":
        df = pd.read_json(io.BytesIO(file_bytes))
    else:
        raise ValueError(f"Unsupported file type: .{ext}")

    row_count = len(df)
    col_count = len(df.columns)
    duplicate_row_count = int(df.duplicated().sum())

    columns = []
    total_null_pct = 0.0
    for col in df.columns:
        null_pct = round(df[col].isna().mean() * 100, 2)
        total_null_pct += null_pct
        sample = df[col].dropna().head(3).tolist()
        columns.append({
            "name": col,
            "dtype": str(df[col].dtype),
            "null_pct": null_pct,
            "sample_values": [str(v) for v in sample],
        })

    avg_null_pct = total_null_pct / col_count if col_count else 0
    dup_pct = (duplicate_row_count / row_count * 100) if row_count else 0
    data_quality_score = max(0, round(100 - avg_null_pct - dup_pct))

    numeric_cols = df.select_dtypes(include="number")
    numeric_summary = {}
    if not numeric_cols.empty:
        desc = numeric_cols.describe().round(4)
        numeric_summary = json.loads(desc.to_json())

    preview_rows = df.head(10).fillna("").to_dict(orient="records")
    preview_rows = [
        {k: str(v) if not isinstance(v, (int, float, bool, str)) else v for k, v in row.items()}
        for row in preview_rows
    ]

    # Pre-aggregate full dataset: group each low-cardinality column by each numeric column
    numeric_col_names = numeric_cols.columns.tolist() if not numeric_cols.empty else []
    categorical_col_names = [
        col for col in df.columns
        if not pd.api.types.is_numeric_dtype(df[col])
        and not pd.api.types.is_datetime64_any_dtype(df[col])
        and 1 < df[col].nunique() <= 50
    ]
    chart_aggregations: dict = {}
    for cat_col in categorical_col_names:
        cat_agg: dict = {}
        for num_col in numeric_col_names:
            grouped = (
                df.groupby(cat_col, sort=False)[num_col]
                .sum()
                .reset_index()
                .sort_values(num_col, ascending=False)
                .head(20)
            )
            cat_agg[num_col] = [
                {"name": str(row[cat_col]), "value": round(float(row[num_col]), 4)}
                for _, row in grouped.iterrows()
            ]
        count_grouped = (
            df.groupby(cat_col, sort=False)
            .size()
            .reset_index(name="__count__")
            .sort_values("__count__", ascending=False)
            .head(20)
        )
        cat_agg["__count__"] = [
            {"name": str(row[cat_col]), "value": int(row["__count__"])}
            for _, row in count_grouped.iterrows()
        ]
        chart_aggregations[cat_col] = cat_agg

    summary = {
        "row_count": row_count,
        "col_count": col_count,
        "duplicate_row_count": duplicate_row_count,
        "data_quality_score": data_quality_score,
        "columns": columns,
        "numeric_summary": numeric_summary,
        "preview_rows": preview_rows,
        "chart_aggregations": chart_aggregations,
    }

    return summary, df

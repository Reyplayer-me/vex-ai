"""Fail closed on SARIF security results; never print source snippets or values."""
import json
from pathlib import Path
import sys


def evaluate(directory):
    reports = list(Path(directory).glob("*.sarif"))
    if not reports:
        raise ValueError("No CodeQL reports available")
    count = 0
    for report in reports:
        data = json.loads(report.read_text())
        runs = data.get("runs")
        if not isinstance(runs, list) or not runs:
            raise ValueError("Invalid CodeQL report")
        for run in runs:
            for invocation in run.get("invocations", []):
                if invocation.get("executionSuccessful") is False:
                    raise ValueError("CodeQL scan failed")
            results = run.get("results", [])
            if not isinstance(results, list):
                raise ValueError("Invalid CodeQL results")
            count += len(results)
    return count


if __name__ == "__main__":
    try:
        findings = evaluate(sys.argv[1])
        print(f"Code security scan: {findings} findings.")
        sys.exit(1 if findings else 0)
    except Exception:
        print("Code security scan: blocked because results are missing or invalid.")
        sys.exit(1)
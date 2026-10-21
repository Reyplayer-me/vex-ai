import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("codeql_gate", Path(__file__).with_name("check-codeql.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CodeGateTests(unittest.TestCase):
    def evaluate(self, report):
        with tempfile.TemporaryDirectory() as directory:
            Path(directory, "results.sarif").write_text(json.dumps(report))
            return module.evaluate(directory)

    def test_finding_blocks(self):
        self.assertEqual(self.evaluate({"runs": [{"results": [{"ruleId": "synthetic-finding"}]}]}), 1)

    def test_clean_scan_passes(self):
        self.assertEqual(self.evaluate({"runs": [{"results": []}]}), 0)

    def test_missing_report_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                module.evaluate(directory)

    def test_failed_scan_fails_closed(self):
        with self.assertRaises(ValueError):
            self.evaluate({"runs": [{"invocations": [{"executionSuccessful": False}], "results": []}]})
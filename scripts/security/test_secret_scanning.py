"""Exercise the real scanner using synthetic fixtures; never print matched values."""
import base64
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCANNER = os.environ.get("GITLEAKS_BIN", "gitleaks")


def synthetic_jwt(role):
    def encode(value):
        return base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip("=")
    return ".".join([encode({"alg": "HS256", "typ": "JWT"}),
                     encode({"role": role, "sub": "synthetic-scanner-fixture"}),
                     "syntheticSignatureNotARealCredential123456789"])


class CredentialScanningTests(unittest.TestCase):
    def scan(self, path, content):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
            result = subprocess.run(
                [SCANNER, "dir", directory, "--config", str(ROOT / ".gitleaks.toml"),
                 "--redact=100", "--no-banner", "--ignore-gitleaks-allow"],
                capture_output=True, check=False)
            self.assertIn(result.returncode, [0, 1], "Scanner execution failed")
            return result.returncode

    def test_private_service_token_blocks_even_in_public_env_field(self):
        self.assertEqual(self.scan(".env", 'VITE_SUPABASE_PUBLISHABLE_KEY="' + synthetic_jwt("service_role") + '"'), 1)

    def test_user_access_token_blocks(self):
        self.assertEqual(self.scan("src/session.ts", 'const token = "' + synthetic_jwt("authenticated") + '";'), 1)

    def test_suppression_comment_does_not_bypass_scan(self):
        self.assertEqual(self.scan("src/session.ts", 'const token = "' + synthetic_jwt("authenticated") + '"; // gitleaks:allow'), 1)

    def test_existing_public_key_is_permitted(self):
        # The checked-in browser key is public. Read it, never print it.
        content = (ROOT / ".env").read_text()
        self.assertEqual(self.scan(".env", content), 0)

    def test_clean_code_passes(self):
        self.assertEqual(self.scan("src/clean.ts", "export const enabled = true;"), 0)


if __name__ == "__main__":
    unittest.main()
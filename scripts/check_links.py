#!/usr/bin/env python3
"""Collect and check http(s) links in DSOVS control YAML and Markdown docs.

Offline (default): validate URL syntax, report duplicates and obviously
malformed links.  Exits 0 unless a malformed URL is found.

Online (--online): issue a HEAD request to each unique URL with a short
timeout, ignoring TLS errors.  Network errors and timeouts are reported as
warnings and NEVER fail the build.  Only clearly broken responses
(400/404/410) cause a non-zero exit.
"""

import argparse
import re
import ssl
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlsplit

REPO_ROOT = Path(__file__).resolve().parent.parent
CONTROLS_DIR = REPO_ROOT / "data" / "controls"
DOCUMENT_DIR = REPO_ROOT / "document"

# Capture http(s) URLs; trailing punctuation common in prose/markdown is trimmed.
URL_RE = re.compile(r"https?://[^\s\"'`<>)\]}]+", re.IGNORECASE)
TRAILING_PUNCT = ".,;:!?"

BROKEN_STATUSES = {400, 404, 410}
TIMEOUT_SECONDS = 8

# Markers that indicate a URL is a shell/template artifact inside a code sample
# (e.g. http://$(ip ...), https://host/${VAR}, https://host/<placeholder>)
# rather than a real, checkable link.
TEMPLATE_MARKERS = ("$(", "${", "<", ">", "{{", "}}")


def clean_url(url):
    while url and url[-1] in TRAILING_PUNCT:
        url = url[:-1]
    return url


def is_template(url):
    return any(marker in url for marker in TEMPLATE_MARKERS)


def gather_urls():
    """Return dict: url -> list of 'rel:line' occurrences."""
    occurrences = defaultdict(list)
    files = []
    if CONTROLS_DIR.is_dir():
        files.extend(sorted(CONTROLS_DIR.glob("*.yaml")))
    if DOCUMENT_DIR.is_dir():
        files.extend(sorted(DOCUMENT_DIR.glob("*.md")))

    for path in files:
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        rel = path.relative_to(REPO_ROOT)
        for line_no, line in enumerate(text.splitlines(), start=1):
            for match in URL_RE.finditer(line):
                url = clean_url(match.group(0))
                if url:
                    occurrences[url].append("{}:{}".format(rel, line_no))
    return occurrences


def is_malformed(url):
    """Return a reason string if the URL is clearly malformed, else None."""
    try:
        parts = urlsplit(url)
    except ValueError as exc:
        return "unparseable URL: {}".format(exc)
    if parts.scheme not in ("http", "https"):
        return "scheme is not http/https"
    if not parts.netloc:
        return "missing host"
    if "." not in parts.netloc.split(":")[0] and parts.hostname != "localhost":
        return "host '{}' has no dot".format(parts.netloc)
    if " " in url:
        return "contains a space"
    return None


def check_online(url):
    """Return (status_or_none, error_message_or_none)."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    headers = {"User-Agent": "DSOVS-link-checker/1.0"}

    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS, context=ctx) as resp:
                return resp.status, None
        except urllib.error.HTTPError as exc:
            # Some servers reject HEAD; retry once with GET before reporting.
            if method == "HEAD" and exc.code in (403, 405, 501):
                continue
            return exc.code, None
        except (urllib.error.URLError, ssl.SSLError, OSError) as exc:
            if method == "HEAD":
                continue
            return None, str(exc)
    return None, "request failed"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--online",
        action="store_true",
        help="issue HEAD/GET requests to each unique URL.",
    )
    args = parser.parse_args()

    occurrences = gather_urls()
    if not occurrences:
        print("No http(s) URLs found.")
        return 0

    all_urls = sorted(occurrences)
    # Skip shell/template artifacts found inside code samples.
    template_urls = [u for u in all_urls if is_template(u)]
    unique_urls = [u for u in all_urls if not is_template(u)]
    print("Found {} unique URL(s) across the source files.".format(len(all_urls)))
    if template_urls:
        print(
            "Skipping {} URL(s) containing shell/template placeholders "
            "(code samples).".format(len(template_urls))
        )

    # Malformed check (offline + online).
    malformed = []
    for url in unique_urls:
        reason = is_malformed(url)
        if reason:
            malformed.append((url, reason))

    for url, reason in malformed:
        locations = ", ".join(occurrences[url])
        print("MALFORMED {} ({}) at {}".format(url, reason, locations))

    # Duplicate report (informational).
    duplicates = {
        u: locs
        for u, locs in occurrences.items()
        if len(locs) > 1 and not is_template(u)
    }
    if duplicates:
        print("")
        print("Duplicate URLs (used in more than one place):")
        for url in sorted(duplicates):
            print("  {} -> {}".format(url, ", ".join(duplicates[url])))

    exit_code = 0

    if args.online:
        print("")
        print("Online checking {} unique URL(s)...".format(len(unique_urls)))
        broken = []
        warned = 0
        for url in unique_urls:
            if is_malformed(url):
                continue  # already reported
            status, err = check_online(url)
            if err is not None:
                print("WARN {} -> network error: {}".format(url, err))
                warned += 1
            elif status in BROKEN_STATUSES:
                locations = ", ".join(occurrences[url])
                print("BROKEN {} -> HTTP {} at {}".format(url, status, locations))
                broken.append(url)
            elif status is None or status >= 400:
                # Other non-2xx/3xx: warn but do not fail.
                print("WARN {} -> HTTP {}".format(url, status))
                warned += 1
        print("")
        print(
            "Online check complete: {} broken, {} warning(s).".format(
                len(broken), warned
            )
        )
        if broken:
            exit_code = 1

    if malformed:
        print("")
        print("Link check FAILED: {} malformed URL(s).".format(len(malformed)))
        exit_code = 1

    if exit_code == 0:
        print("")
        print("Link check passed.")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())

"""Erzeugt die Web-Schriften in app/fonts/ aus dem Schriften-ZIP in material/schriften/.

Nur Cantarell Bold und Noto Sans Regular/Kursiv/Bold, als WOFF2, auf lateinische
Zeichen reduziert. Indie Flower wird bewusst nicht eingebunden.

Voraussetzung: pip install fonttools brotli
Aufruf (im Projektordner): python scripts/build-fonts.py
"""

import glob
import os
import subprocess
import sys
import tempfile
import zipfile

FONTS = {
    "Cantarell/Cantarell-Bold.ttf": "cantarell-bold",
    "Noto_Sans/static/NotoSans-Regular.ttf": "noto-sans-regular",
    "Noto_Sans/static/NotoSans-Italic.ttf": "noto-sans-italic",
    "Noto_Sans/static/NotoSans-Bold.ttf": "noto-sans-bold",
}

LICENSES = {
    "Cantarell/OFL.txt": "Cantarell-OFL.txt",
    "Noto_Sans/OFL.txt": "NotoSans-OFL.txt",
}

# Lateinischer Bereich (wie Google Fonts „latin“), inkl. typografischer Anführungszeichen und €.
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,"
    "U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)


def main() -> None:
    archives = glob.glob("material/schriften/*.zip")
    if len(archives) != 1:
        sys.exit("Genau ein ZIP in material/schriften/ erwartet.")

    archive = zipfile.ZipFile(archives[0])
    os.makedirs("app/fonts/licenses", exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        for source, name in FONTS.items():
            ttf = os.path.join(tmp, name + ".ttf")
            with open(ttf, "wb") as handle:
                handle.write(archive.read(source))
            subprocess.check_call(
                [
                    sys.executable, "-m", "fontTools.subset", ttf,
                    "--unicodes=" + LATIN, "--flavor=woff2", "--layout-features=*",
                    "--output-file=app/fonts/" + name + ".woff2",
                ]
            )
            print("app/fonts/" + name + ".woff2")

    for source, name in LICENSES.items():
        with open("app/fonts/licenses/" + name, "wb") as handle:
            handle.write(archive.read(source))


if __name__ == "__main__":
    main()

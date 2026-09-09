# PrintxPDF converter: LibreOffice (PPT<->PDF, PDF->PDF/A) + Calibre (EPUB/MOBI->PDF)
# + qpdf (PDF encrypt/decrypt) behind a stdlib Python HTTP server.
# Built for linux/amd64 and run by Cloudflare Containers.
FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive LANG=C.UTF-8 LC_ALL=C.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 libreoffice-impress calibre qpdf xvfb xauth \
      fonts-dejavu fonts-liberation fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto-core \
      libgl1 libegl1 libgbm1 libnss3 libasound2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libxtst6 libxi6 libxcb-cursor0 ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 app
COPY warm.pptx /opt/warm.pptx
# Warm the LibreOffice profile at build time (first start is slow) and prove the toolchain works.
RUN soffice -env:UserInstallation=file:///opt/lo-profile --headless --norestore --nologo --convert-to pdf:impress_pdf_Export --outdir /tmp /opt/warm.pptx \
    && test -s /tmp/warm.pdf && rm -f /tmp/warm.pdf && chown -R app:app /opt/lo-profile
COPY server.py /app/server.py
USER app
ENV HOME=/tmp PORT=8080
EXPOSE 8080
CMD ["python3", "/app/server.py"]

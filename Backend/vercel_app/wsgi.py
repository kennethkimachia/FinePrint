import os
import sys
from pathlib import Path

# Ensure the Backend directory is on sys.path so Django can find
# config.settings, api, core_logic, lib, etc.
BACKEND_DIR = str(Path(__file__).resolve().parent.parent)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
app = application
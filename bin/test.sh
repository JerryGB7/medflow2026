set -e

echo "== BANK DEMO TEST SCRIPT =="

cd backend

source .venv/Scripts/activate

psql -U postgres -c "DROP DATABASE IF EXISTS medi_test;"
psql -U postgres -c "CREATE DATABASE medi_test;"

pytest -v --disable-warnings --maxfail=1 tests/test_auth.py
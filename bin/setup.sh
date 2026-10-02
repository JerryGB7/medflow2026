
set -e

echo "== BANK DEMO SETUP SCRIPT =="

cd backend

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

source .venv/Scripts/activate
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "Fill in real values in the backend/.env file before running the application."
    cp .env.example .env
fi

cd ../frontend
echo "Setting up frontend..."
npm install

echo "Setup complete. You can now run the backend and frontend applications."
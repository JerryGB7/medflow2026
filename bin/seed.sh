

TARGET="${1:-local}"
if [ "$TARGET" == "local" ]; then

    export DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/bankdemo"
    PSQL_HOST="127.0.0.1"
    PSQL_DB="bankdemo"
elif [ "$TARGET" == "rds" ]; then
    export DATABASE_URL="postgresql+asyncpg://postgres:postgres@bankdemo-db.cxc0cqs26g9r.us-east-2.rds.amazonaws.com:5432/postgres"
    PSQL_HOST="bankdemo-db.cxc0cqs26g9r.us-east-2.rds.amazonaws.com:5432"
    PSQL_DB="postgres"
else 
    echo "Invalid target specified. Use 'local' or 'rds'."
    exit 1
fi

echo "Seeding the database for target: $TARGET"

cd backend

python -m scripts.day3_create_tables

psql -h "$PSQL_HOST" -U postgres -d "$PSQL_DB" -f ../db/sql/seed.sql

python -m scripts.day5_seed_users

echo "seed complete for target: $TARGET"
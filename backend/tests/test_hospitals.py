from tests.conftest import auth_header


async def test_create_hospital_requires_auth(client):
    response = await client.post("/hospitals", json={
        "name": "New Hospital",
        "location_region": "North",
        "capacity": 200,
        "supervisor_id": 12,
    })

    assert response.status_code == 401


async def test_create_hospital_forbidden_for_field_technician(client, seeded_user):
    response = await client.post(
        "/hospitals",
        json={
            "name": "New Hospital",
            "location_region": "North",
            "capacity": 200,
            "supervisor_id": 12,
        },
        headers=auth_header(seeded_user["technician"]),
    )

    assert response.status_code == 403


async def test_create_hospital_allowed_for_admin(client, seeded_user):
    payload = {
        "name": "New Hospital",
        "location_region": "North",
        "capacity": 200,
        "supervisor_id": 12,
    }
    response = await client.post(
        "/hospitals", json=payload, headers=auth_header(seeded_user["admin"])
    )

    assert response.status_code == 201
    assert response.json()["name"] == payload["name"]
    assert response.json()["location_region"] == payload["location_region"]
    assert response.json()["capacity"] == payload["capacity"]
    assert response.json()["supervisor_id"] == payload["supervisor_id"]